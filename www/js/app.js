app = angular.module('MixB', ['ionic'])

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

app.controller('MainCtrl', function($scope, $http, $ionicModal, $ionicSideMenuDelegate, $ionicLoading, $rootScope) {
  // wrap MixB's arbitrary URL rule
  function getUrl(country, category, action, id) {
    var suffix = category + '/';
    if (action) {
      suffix += category + '_' + action;
      if (!id) {
        suffix += '_f.php';
      } else {
        suffix += '_fs.php?id=' + id;
      }
    }
    if (country == 'uk') {
      switch (category) {
        case 'ser': case 'cir': case 'inf':
          return 'http://www.mixb.net/' + suffix;
        default:
          return 'http://www.mixb.jp/uk/' + suffix;
      }
    }
    return 'http://' + country + '.mixb.net/' + suffix;
  }

  // parse and extract Mixb's item list
  function createItems(data, dirname) {
    var contents = $(data).find('table > tbody > tr > td > table > tbody > tr > td > table');
    var rows = contents.find('tbody > tr')
        .filter(function(i,e) {return $(e).find('td > a').length == 1});
    return rows.map(function(i,e) {
      return {
        title: $(e).find('td > a').text(),
        url: dirname + $(e).find('td > a').attr('href'),
      };
    }).get();
  }

  // Main model data for countries
  $scope.countries = [
    {name: 'イギリス', id: 'uk'},
    {name: 'フランス', id: 'fra'},
    {name: 'ドイツ', id: 'ger'},
    {name: 'イタリア', id: 'ita'},
    {name: 'アイルランド', id: 'irl'},
    {name: 'ニューヨーク', id: 'nyc'},
    {name: 'ロサンゼルス', id: 'los'},
    {name: 'サンフランシスコ', id: 'sfc'},
    {name: 'カナダ・バンクーバー', id: 'van'},
    {name: 'オーストラリア・シドニー', id: 'syd'},
    {name: 'ニュージーランド', id: 'nz'},
    {name: 'シンガポール', id: 'sin'},
    {name: '上海', id: 'sha'},
    {name: '香港', id: 'hkg'},
  ];

  // Add categories to all countries
  $.each($scope.countries, function(i, country) {
    country.categories = [
        {name: '住まい', id: 'acm', items: [], query: ''},
        {name: '求人', id: 'job', items: [], query: ''},
        {name: '売ります', id: 'sal', items: [], query: ''},
        {name: '買います', id: 'buy', items: [], query: ''},
        {name: 'レッスン', id: 'les', items: [], query: ''},
        {name: 'サービス', id: 'ser', items: [], query: ''},
        {name: 'サークル ', id: 'cir', items: [], query: ''},
        {name: 'お知らせ', id: 'inf', items: [], query: ''},
    ];
  });

  $scope.activeCountry = 0;     // select UK by default
  $scope.activeCategory = 0;    // select acm by default

  // helper function to show error message
  function handleError(url) {
    $ionicLoading.show({
      template: '読み込めませんでした：' + url,
      noBackdrop: true,
      duration: 2000
    });
  }

  // update items in active category of active country
  $scope.updateItems = function() {
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[$scope.activeCategory];
    var dirname = getUrl(country.id, category.id);
    var url = getUrl(country.id, category.id, 'list');

    $http.get(url).success(function(data) {
      var items = createItems(data, dirname);
      category.items = items;

      $ionicLoading.hide();
      $rootScope.$broadcast('scroll.refreshComplete');
    }).error(function() {handleError(url);});
  };

  // TODO: merge with updateItems()
  $scope.searchItem = function() {
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[$scope.activeCategory];
    var dirname = getUrl(country.id, category.id);
    var url = getUrl(country.id, category.id, 'search');

    $ionicLoading.show({template: '<ion-spinner></ion-spinner>', noBackdrop: true})

    $http({
          method: 'POST',
          url: url,
          data: $.param({'sc_word':category.query}),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data) {
      var items = createItems(data, dirname);
      category.items = items;

      $ionicLoading.hide();
      $rootScope.$broadcast('scroll.refreshComplete');

    }).error(function() {handleError(url);});

    category.query = '';
  };

  // Add modal view for item detail
  $ionicModal.fromTemplateUrl('item-detail.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal
  });

  // Open item detail modal view
  $scope.openItemDetail = function(url) {
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[$scope.activeCategory];
    var dirname = getUrl(country.id, category.id);

    $ionicLoading.show({template: '<ion-spinner></ion-spinner>', noBackdrop: true})

    $http.get(url).success(function(data) {
      var contents = $(data).find('table > tbody > tr > td > table > tbody > tr > td > table');
      // replace image path to absolute url
      contents.find('img').each(function() {
        var src = $(this).attr('src');
        $(this).attr('src', dirname + src);
      });
      $scope.title = contents.find('tr:eq(0)').text();
      $scope.metadata = contents.find('tr:eq(1)').html();
      var body = contents.find('tr:eq(2)');
      $scope.content = body.find('div:eq(0)').html();
      $scope.photo = body.find('div:eq(1)').html();
      $scope.modal.show();
      $ionicLoading.hide();
      $rootScope.$broadcast('scroll.refreshComplete');
    }).error(function() {handleError(url);});
  };

  // Pressed back button on item detail view
  $scope.closeItemDetail = function() {
    $scope.modal.hide();
  };

  // Selected country in side menu
  $scope.selectCountry = function(country, index) {
    $scope.activeCountry = index;
    $ionicSideMenuDelegate.toggleLeft(false);
    $scope.activeCategory = 0;
    $scope.showLoading();
    $scope.updateItems();
  };

  // Show/hide side menu
  $scope.toggleCountries = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  // Show loading screen only when active tab is empty
  $scope.showLoading = function() {
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[$scope.activeCategory];
    if (category.items.length == 0) {
      $ionicLoading.show({template: '<ion-spinner></ion-spinner>', noBackdrop: true})
    }
  };

  // Slide changed by swiping slide or tapping tab
  $scope.onSlideChanged = function(index) {
    $scope.activeCategory = index;
    $scope.showLoading();
    $scope.updateItems();
  };

  // Initialize
  $scope.showLoading();
  $scope.updateItems();
});

