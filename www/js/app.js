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
  function getUrl(country, category, action) {
    var suffix = category + "/" + category + "_" + action + "_f.php";
    if (country == "uk") {
      switch (category) {
        case "ser": case "cir": case "info":
          return "http://www.mixb.net/" + suffix;
        default:
          return "http://www.mixb.jp/uk/" + suffix;
      }
    }
    return "http://" + country + ".mixb.net/" + suffix;
  }

  $scope.countries = [
    {name: "イギリス", id: "uk"},
    {name: "フランス", id: "fra"},
    {name: "シンガポール", id: "sin"},
  ];

  $.each($scope.countries, function(i, country) {
    country.categories = [
        {name: "住まい", id: "acm"},
        {name: "求人", id: "job"},
        {name: "売ります", id: "sal"},
        {name: "買います", id: "buy"},
        {name: "レッスン", id: "les"},
        {name: "サービス", id: "ser"},
        {name: "サークル ", id: "cir"},
        {name: "お知らせ", id: "inf"},
    ];
    $.each(country.categories, function(i, category) {
      category.items = [];
      category.url = getUrl(country.id, category.id, "list");
    });
  });

  $scope.activeCountry = 0;     // select UK by default
  $scope.activeCategory = 0;    // select acm by default
  $scope.search = {query: ""};

  function handleError(url) {
    $ionicLoading.show({
      template: '読み込めませんでした：' + url,
      noBackdrop: true,
      duration: 2000
    });
  }

  $scope.updateItems = function(index) {
    $scope.activeCategory = index;
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[index];
    var dirname = category.url.replace(/\/[^\/]+$/, '/');

    $http.get(category.url).success(function(data) {
      var contents = $(data).find('table > tbody > tr > td > table > tbody > tr > td > table');
      var rows = contents.find('tbody > tr').filter(function(i,e) {return $(e).find('td > a').length == 1});
      category.items = rows.map(function(i,e) {
        return {
          title: $(e).find('td > a').text(),
          url: dirname + $(e).find('td > a').attr('href'),
        };
      }).get();
      $ionicLoading.hide()
      $rootScope.$broadcast('scroll.refreshComplete');
    }).error(function() {handleError(url);});
  }

  // TODO: merge with updateItems()
  $scope.searchItem = function(query) {
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[$scope.activeCategory];
    var dirname = category.url.replace(/\/[^\/]+$/, '/');

    // HACK: replace list with search
    var searchUrl = category.url.replace(/list/, 'search');

    $ionicLoading.show({template: '<ion-spinner></ion-spinner>', noBackdrop: true})
    $scope.search.query = "";

    $http({
          method: 'POST',
          url: searchUrl,
          data: $.param({'sc_word':query}),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data) {
      var contents = $(data).find('table > tbody > tr > td > table > tbody > tr > td > table');
      console.log(contents.html());
      var rows = contents.find('tbody > tr').filter(function(i,e) {return $(e).find('td > a').length == 1});
      category.items = rows.map(function(i,e) {
        return {
          title: $(e).find('td > a').text(),
          url: dirname + $(e).find('td > a').attr('href'),
        };
      }).get();
      $ionicLoading.hide()
      $rootScope.$broadcast('scroll.refreshComplete');
    }).error(function() {handleError(searchUrl);});
  }

  // modal view for item detail
  $ionicModal.fromTemplateUrl('item-detail.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal
  });

  $scope.openItemDetail = function(url) {
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[$scope.activeCategory];
    var dirname = category.url.replace(/\/[^\/]+$/, '/');

    $ionicLoading.show({template: '<ion-spinner></ion-spinner>', noBackdrop: true})

    $http.get(url).success(function(data) {
      var contents = $(data).find('table > tbody > tr > td > table > tbody > tr > td > table');
      // replace image path to absolute url
      contents.find('img').each(function() {
        var src = $(this).attr("src");
        $(this).attr("src", dirname + src);
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
  }

  $scope.closeItemDetail = function() {
    $scope.modal.hide();
  };

  // functions for multiple countries
  $scope.selectCountry = function(country, index) {
    $scope.activeCountry = index;
    $ionicSideMenuDelegate.toggleLeft(false);
    $scope.activeCategory = 0;
    $scope.updateItems($scope.activeCategory);
    $ionicLoading.show({template: '<ion-spinner></ion-spinner>', noBackdrop: true})
  }

  $scope.toggleCountries = function() {
    $ionicSideMenuDelegate.toggleLeft();
  }
  // Show loading screen only when active tab is empty
  $scope.showLoading = function() {
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[$scope.activeCategory];
    if (category.items.length == 0) {
      $ionicLoading.show({template: '<ion-spinner></ion-spinner>', noBackdrop: true})
    }
  }

  // Initialize
  $scope.showLoading();
  $scope.updateItems($scope.activeCategory);
});

