app = angular.module('MixB', ['ionic'])

// Setup
app.config(function($httpProvider) {
  $httpProvider.interceptors.push(function($rootScope) {
    return {
      response: function(response) {
        $rootScope.$broadcast('loading:hide')
        return response
      }
    }
  });
});

app.run(function($ionicPlatform, $rootScope, $ionicLoading) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

  $rootScope.$on('loading:hide', function() {
    $ionicLoading.hide()
    $rootScope.$broadcast('scroll.refreshComplete');
  });
});

app.controller('MainCtrl', function($scope, $http, $ionicModal, $ionicSideMenuDelegate, $ionicLoading) {
  // Main model data: country -> category -> item
  $scope.countries = [
    {name: "イギリス",
     categories: [
      {name: "住まい",
       url: "http://www.mixb.jp/uk/acm/acm_list_f.php",
       items: []},
      {name: "求人",
       url: "http://www.mixb.jp/uk/job/job_list_f.php",
       items: []},
      {name: "売ります",
       url: "http://www.mixb.jp/uk/sal/sal_list_f.php",
       items: []},
      {name: "買います",
       url: "http://www.mixb.jp/uk/buy/buy_list_f.php",
       items: []},
      {name: "レッスン",
       url: "http://www.mixb.jp/uk/les/les_list_f.php",
       items: []},
      {name: "サービス",
       url: "http://www.mixb.net/ser/ser_list_f.php",
       items: []},
      {name: "サークル",
       url: "http://www.mixb.net/cir/cir_list_f.php",
       items: []},
      {name: "お知らせ",
       url: "http://www.mixb.net/inf/inf_list_f.php",
       items: []},
    ]},
    {name: "フランス",
     categories: [
      {name: "住まい",
       url: "http://fra.mixb.net/acm/acm_list_f.php",
       items: []},
      {name: "求人",
       url: "http://fra.mixb.net/job/job_list_f.php",
       items: []},
      {name: "売ります",
       url: "http://fra.mixb.net/sal/sal_list_f.php",
       items: []},
      {name: "買います",
       url: "http://fra.mixb.net/buy/buy_list_f.php",
       items: []},
      {name: "レッスン",
       url: "http://fra.mixb.net/les/les_list_f.php",
       items: []},
      {name: "サービス",
       url: "http://fra.mixb.net/ser/ser_list_f.php",
       items: []},
      {name: "サークル",
       url: "http://fra.mixb.net/cir/cir_list_f.php",
       items: []},
      {name: "お知らせ",
       url: "http://fra.mixb.net/inf/inf_list_f.php",
       items: []},
    ]},
    {name: "シンガポール",
     categories: [
      {name: "住まい",
       url: "http://sin.mixb.net/acm/acm_list_f.php",
       items: []},
      {name: "求人",
       url: "http://sin.mixb.net/job/job_list_f.php",
       items: []},
      {name: "売ります",
       url: "http://sin.mixb.net/sal/sal_list_f.php",
       items: []},
      {name: "買います",
       url: "http://sin.mixb.net/buy/buy_list_f.php",
       items: []},
      {name: "レッスン",
       url: "http://sin.mixb.net/les/les_list_f.php",
       items: []},
      {name: "サービス",
       url: "http://sin.mixb.net/ser/ser_list_f.php",
       items: []},
      {name: "サークル",
       url: "http://sin.mixb.net/cir/cir_list_f.php",
       items: []},
      {name: "お知らせ",
       url: "http://sin.mixb.net/inf/inf_list_f.php",
       items: []},
    ]},
  ];
  $scope.activeCountry = 0;     // select UK by default
  $scope.activeCategory = 0;    // select acm by default

  // Download data from external website
  $scope.fetchData = function(url) {
    return $http.get(url)
      .error(function() {
        $ionicLoading.show({
          template: '読み込めませんでした：' + url,
          noBackdrop: true,
          duration: 2000
        });
      });
  }

  $scope.updateItems = function(index) {
    $scope.activeCategory = index;
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[index];
    var dirname = category.url.replace(/\/[^\/]+$/, '/');

    $scope.fetchData(category.url).success(function(data) {
      var contents = $(data).find('table > tbody > tr > td > table > tbody > tr > td > table');
      var rows = contents.find('tbody > tr');
      category.items = rows.map(function(i,e) {
        return {
         title: $(e).find('a').text(),
          url: dirname + $(e).find('a').attr('href'),
        };
      }).get();
    });
  }

  // TODO: merge with updateItems()
  $scope.searchItem = function(query) {
    console.log("searchItem: " + query)
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[$scope.activeCategory];
    var dirname = category.url.replace(/\/[^\/]+$/, '/');

    // HACK: replace list with search
    var searchUrl = category.url.replace(/list/, 'search');

    // TODO: implement error handling
    $http({
          method: 'POST',
          url: 'http://www.mixb.jp/uk/acm/acm_search_f.php',
          data: $.param({'sc_word':query}),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data) {
      var contents = $(data).find('table > tbody > tr > td > table > tbody > tr > td > table');
      console.log(contents.html());
      var rows = contents.find('tbody > tr');
      category.items = rows.map(function(i,e) {
        return {
         title: $(e).find('a').text(),
          url: dirname + $(e).find('a').attr('href'),
        };
      }).get();
    });
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

    $scope.fetchData(url).success(function(data) {
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
    });
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

