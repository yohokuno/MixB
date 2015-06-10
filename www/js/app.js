// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('MixB', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.controller('MainCtrl', function($scope, $ionicSideMenuDelegate) {
  $scope.countries = [
    {name: "イギリス", categories: [
      {name: "住まい"},
      {name: "求人"},
      {name: "売ります"},
      {name: "買います"},
      {name: "レッスン"},
      {name: "サービス"},
      {name: "サークル"},
      {name: "お知らせ"}
    ]},
    {name: "フランス"}
  ];
  $scope.activeCountry = 0; // select UK by default

  $scope.selectCountry = function(country, index) {
    $scope.activeCountry = index;
    $ionicSideMenuDelegate.toggleLeft(false);
  }
});

