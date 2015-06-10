angular.module('MixB', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.controller('MainCtrl', function($scope, $http, $ionicModal, $ionicSideMenuDelegate, $ionicLoading) {
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
  ];
  $scope.activeCountry = 0;     // select UK by default
  $scope.activeCategory = 0;    // select acm by default

  // Download data from external website
  $scope.fetchData = function(url, callback) {
    $http.get(url)
      .success(callback)
      .error(function() {
          $ionicLoading.show({ template: 'Could not load ' + url, noBackdrop: true, duration: 1000 }
      });
  }
  $scope.updateItems = function(index) {
    $scope.activeCategory = index;
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[index];
    var dirname = category.url.replace(/\/[^\/]+$/, '/');
    $scope.fetchData(category.url, function(data) {
      var rows = $(data).find('table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr');
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
    $scope.temp = url;
    $scope.modal.show()
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
  }

  $scope.toggleCountries = function() {
    $ionicSideMenuDelegate.toggleLeft();
  }

  // Initialize
  $scope.updateItems($scope.activeCategory);
});

