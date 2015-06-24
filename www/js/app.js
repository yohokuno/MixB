'use strict';
var app = angular.module('MixB', ['ionic']);

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

app.controller('MainCtrl', function($scope, $rootScope, $http, $timeout,
            $ionicModal, $ionicLoading,
            $ionicSideMenuDelegate, $ionicSlideBoxDelegate, $ionicScrollDelegate) {
  // construct MixB's URL
  function getUrl(country, category, action, id) {
    var suffix = category + '/';
    if (action) {
      suffix += category + '_' + action;
      if (!id) {
        suffix += '_f.php';
      } else if (category == 'buy') {
        suffix += '_f.php?id=' + id;
      } else {
        suffix += '_fs.php?id=' + id;
      }
    }
    if (document.location.hostname == 'localhost') {
      return '/uk/' + suffix;
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

  // parse and extract MixB's item list
  function createItems(data) {
    var contents = $(data).find('table > tbody > tr > td > table > tbody > tr > td > table');
    var rows = contents.find('tbody > tr')
        .filter(function(i,e) {return $(e).find('td > a').length == 1});
    return rows.map(function(i,e) {
      var link = $(e).find('td > a');
      var headers = $(e).find('td:not(:last)')
        .map(function(i,e2){return $(e2).text().trim();})
        .filter(function(i,e2){return e2 != '';})
        .get();
      return {
        title: link.text(),
        id: link.attr('href').replace(/^.*=/i, ''),
        headers: headers,
      };
    }).get();
  }

  // helper function to show error message
  function handleError(url) {
    $ionicLoading.show({
      template: '読み込めませんでした：' + url,
      noBackdrop: true,
      duration: 2000
    });
  }

  // Show loading screen only when active tab is empty
  function showLoading() {
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[$scope.activeCategory];
    if (category.items.length == 0) {
      $ionicLoading.show({template: '<ion-spinner></ion-spinner>', noBackdrop: true})
    }
  }

  // Auto scroll tab bar so active tab come to center
  function autoScrollTabBar() {
    var tab = $('button.button-tab:nth-child(' + ($scope.activeCategory + 1) + ')');
    var tabWidth = tab.width();
    var tabLeft = ionic.DomUtil.getPositionInParent(tab[0]).left;
    var scrollWidth = $('ion-header-bar.bar-subheader').width();
    var scroll = $ionicScrollDelegate.$getByHandle('tab-bar');
    var scrollLeft = scroll.getScrollPosition().left;
    var scrollTo = tabLeft + tabWidth / 2 - scrollWidth / 2;
    // TODO: limit maximum of scrollTo
    scrollTo = Math.max(scrollTo, 0);
    console.log('tabWidth: ' + tabWidth);
    console.log('tabLeft: ' + tabLeft);
    console.log('scrollWidth: ' + scrollWidth);
    console.log('scrollLeft: ' + scrollLeft);
    console.log('scrollTo: ' + scrollTo);
    scroll.scrollTo(scrollTo, 0, true);
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
        {name: '住まい', id: 'acm'},
        {name: '求人', id: 'job'},
        {name: '売ります', id: 'sal'},
        {name: '買います', id: 'buy'},
        {name: 'レッスン', id: 'les'},
        {name: 'サービス', id: 'ser'},
        {name: 'サークル', id: 'cir'},
        {name: 'お知らせ', id: 'inf'},
    ];
    $.each(country.categories, function(i, category) {
      category.items = [];
      category.query = '';
      category.page = 0;
    });
  });

  $scope.activeCountry = 0;     // select UK by default
  $scope.activeCategory = 0;    // select acm by default

  // update items in active category of active country
  $scope.updateItems = function() {
    console.log('updateItems: ' + $scope.activeCategory);
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[$scope.activeCategory];
    var url = getUrl(country.id, category.id, 'list');

    $http.get(url).success(function(data) {
      category.items = createItems(data);
      $ionicLoading.hide();
      $rootScope.$broadcast('scroll.refreshComplete');
      $scope.$broadcast('scroll.infiniteScrollComplete'); 
      category.page = 1;
    }).error(function() {handleError(url);});
  };

  // TODO: merge with updateItems()
  $scope.searchItem = function() {
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[$scope.activeCategory];
    var url = getUrl(country.id, category.id, 'search');
    console.log('searchItem: ' + category.query);

    $ionicLoading.show({template: '<ion-spinner></ion-spinner>', noBackdrop: true})

    $http({
          method: 'POST',
          url: url,
          data: $.param({'sc_word': category.query}),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data) {
      category.items = createItems(data);
      $ionicLoading.hide();
      $scope.$broadcast('scroll.infiniteScrollComplete'); 
    }).error(function() {handleError(url);});

    category.query = '';
  };

  // TODO: merge with update and search items
  $scope.loadMore = function() {
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[$scope.activeCategory];
    var url = getUrl(country.id, category.id, 'list');
    console.log('loadMore: ' + category.page);
    category.page += 1;

    $http({
          method: 'POST',
          url: url,
          data: $.param({'page_no': category.page}),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data) {
      category.items = category.items.concat(createItems(data));
      $ionicLoading.hide();
      $scope.$broadcast('scroll.infiniteScrollComplete'); 
    }).error(function() {handleError(url);});
  };

  // Open item detail modal view
  $scope.openItemDetail = function(item) {
    console.log('openItemDetail'+ item);
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[$scope.activeCategory];
    var dirname = getUrl(country.id, category.id);
    var url = getUrl(country.id, category.id, 'detail', item.id);

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
      $scope.$broadcast('scroll.infiniteScrollComplete'); 

    }).error(function() {handleError(url);});
  };

  // Pressed back button on item detail view
  $scope.closeItemDetail = function() {
    console.log('closeItemDetail');
    $scope.modal.hide();
  };

  // Selected country in side menu
  $scope.selectCountry = function(index) {
    console.log('selectCountry: ' + index);
    $scope.activeCountry = index;
    $ionicSideMenuDelegate.toggleLeft(false);
    $scope.activeCategory = 0;
    //showLoading();
    //$scope.updateItems();
  };

  // Show/hide side menu
  $scope.toggleCountries = function() {
    console.log('toggleCountries');
    $ionicSideMenuDelegate.toggleLeft();
  };

  // Slide changed by swiping slide
  $scope.onSlideChanged = function(index) {
    console.log('onSlideChanged: ' + index);
    $scope.activeCategory = index;
    //showLoading();
    //$scope.updateItems();
    var scroll = $ionicScrollDelegate.$getByHandle('main');
    scroll.scrollTop();
    $scope.$broadcast('scroll.infiniteScrollComplete'); 
    $timeout( function() {
      scroll.resize();
    }, 50);
    autoScrollTabBar();
  };

  // Tab selected
  $scope.onTabSelected = function(index) {
    console.log('onTabSelected: ' + index);
    $ionicSlideBoxDelegate.slide(index);
    $scope.activeCategory = index;
    $scope.$broadcast('scroll.infiniteScrollComplete'); 
    autoScrollTabBar();
    //showLoading();
    //$scope.updateItems();
  }

  // Add modal view for item detail
  $ionicModal.fromTemplateUrl('item-detail.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal
  });

  // Initialize
  //showLoading();
  //$scope.updateItems();
});

