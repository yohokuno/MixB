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

app.controller('MainCtrl', function($scope, $rootScope, $http, $timeout, $sce,
            $ionicModal, $ionicLoading,
            $ionicSideMenuDelegate, $ionicSlideBoxDelegate, $ionicScrollDelegate) {
  // helper function to show error message
  function handleError(url) {
    $ionicLoading.show({
      template: '読み込めませんでした：' + url,
      noBackdrop: true,
      duration: 2000
    });
  }

  // Auto scroll tab bar so active tab come to center
  function autoScrollTabBar() {
    var tab = $('button.button-tab:nth-child(' + ($scope.activeCategory + 1) + ')');
    var tabWidth = tab.width();
    var tabLeft = ionic.DomUtil.getPositionInParent(tab[0]).left;
    var scrollWidth = $('ion-header-bar.bar-subheader').width();
    var scrollTo = tabLeft + tabWidth / 2 - scrollWidth / 2;
    // TODO: limit maximum of scrollTo
    scrollTo = Math.max(scrollTo, 0);

    var scroll = $ionicScrollDelegate.$getByHandle('tab-bar');
    scroll.scrollTo(scrollTo, 0, true);
    console.log('autoScrollTabBar: ' + tabLeft + ' + ' + tabWidth + ' / 2 - ' + scrollWidth + ' / 2 = ' + scrollTo);
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
    {name: '香港', id: 'hkg'}
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
        {name: 'お知らせ', id: 'inf'}
    ];
    $.each(country.categories, function(i, category) {
      category.items = [];
      category.query = '';
      category.page = 0;
      category.timestamp = 0;
      category.attributes = [];
      category.action = 'list';
    });
  });

  $scope.activeCountry = 0;     // select UK by default
  $scope.activeCategory = 0;    // select acm by default

  // Add modal view for item detail
  $ionicModal.fromTemplateUrl('item-detail.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal
  });

  // load and add items in the next page of active category of active country
  $scope.loadItems = function() {
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[$scope.activeCategory];
    var url = getUrl(country.id, category.id, 'list');
    console.log('loadItems; page: ' + category.page + ', category:' + $scope.activeCategory);

    var request = {
      url: url,
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja-jp',
        'Cache-Control': 'max-age=0'
      }
    };

    if (category.page == 0) {
      request.method = 'GET';
    } else {
      request.method = 'POST';
      request.data = $.param({
        'page_timestamp': category.timestamp,
        'page_no': category.page + 1
      });
      request.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    console.log('Request: ' + JSON.stringify(request, null, 2));

    $http(request).success(function(data) {
      var oldLength = category.items.length;
      var newItems = createItems(data);
      if (category.page == 0) {
        category.items = newItems;
      } else {
        category.items = category.items.concat(newItems);
      }
      category.items = removeDuplicates(category.items);
      if (category.items.length == oldLength) {
        console.log('Warning: items not changed!');
        return;
      }
      category.timestamp = getTimestamp(data);

      if (category.page == 0) {
        var attributes = $(data).find('table > tbody > tr > td > table > tbody > tr > td > select');
        category.attributes = attributes.map(function(i,e) {
          var label = $(e).find(':first-child').text().replace('で検索', '');
          $(e).find(':first-child').html('指定なし');
          return {
            id: e.name,
            label: label,
            html: $sce.trustAsHtml(e.innerHTML)
          };
        });
      }
      category.page += 1;
      $rootScope.$broadcast('scroll.refreshComplete');
      $scope.$broadcast('scroll.infiniteScrollComplete');
    }).error(function() {handleError(url);});
  };

  // TODO: merge with loadItems()
  $scope.searchItem = function() {
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[$scope.activeCategory];
    var url = getUrl(country.id, category.id, 'search');
    console.log('searchItem: ' + category.query);

    $ionicLoading.show({template: '<ion-spinner></ion-spinner>', noBackdrop: true});

    var request = {
      method: 'POST',
      url: url,
      data: $.param({'sc_word': category.query}),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    };
    console.log('Request: ' + JSON.stringify(request, null, 2));

    $http(request).success(function(data) {
      category.items = createItems(data);
      $ionicLoading.hide();
      $scope.$broadcast('scroll.infiniteScrollComplete'); 
    }).error(function() {handleError(url);});

    category.query = '';
  };

  // Open item detail modal view
  $scope.openItemDetail = function(item) {
    console.log('openItemDetail'+ item);
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[$scope.activeCategory];
    var dirname = getUrl(country.id, category.id);
    var url = getUrl(country.id, category.id, 'detail', item.id);

    $ionicLoading.show({template: '<ion-spinner></ion-spinner>', noBackdrop: true});

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
  };

  // Pull to request
  $scope.onRefresh = function() {
    console.log('onRefresh');
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[$scope.activeCategory];
    category.page = 0;
    $scope.loadItems();
  };

  $scope.onSearchClicked = function() {
    console.log('onSearchClicked');
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[$scope.activeCategory];
    category.action = 'search';
  }

  $scope.onCancelClicked = function() {
    console.log('onCancelClicked');
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[$scope.activeCategory];
    category.action = 'list';
  }
});

