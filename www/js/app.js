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

.controller('MainCtrl', function($scope, $http, $ionicSideMenuDelegate) {
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
       items: []}
    ]}
    // Multiple countries not working
  ];
  $scope.activeCountry = 0;     // select UK by default
  $scope.activeCategory = 0;    // select acm by default

  $scope.updatePage = function(index) {
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[index];
    $http.get(category.url).
      success(function(data) {
        var content = $(data).find('table > tbody > tr > td > table > tbody > tr > td > table');
        //content.find('tr').find('td:lt(4)').remove();
        var loaded = content.find('tr').map(function() {
            return $(this).text();
        }).get();
        category.items = category.items.concat(loaded);
      });
  }

  $scope.selectCountry = function(country, index) {
    $scope.activeCountry = index;
    $ionicSideMenuDelegate.toggleLeft(false);
  }

  $scope.toggleCountries = function() {
    $ionicSideMenuDelegate.toggleLeft();
  }
});

