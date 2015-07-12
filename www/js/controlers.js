
app.controller('MainCtrl', function($scope, $rootScope, $http, $timeout,
                                    $ionicModal, $ionicLoading,
                                    $ionicSideMenuDelegate, $ionicSlideBoxDelegate,
                                    service) {

  // Main model data for countries; see data.js
  $scope.countries = initialCountries;
  $scope.activeCountry = 0;     // select UK by default
  $scope.activeCategory = 0;    // select acm by default
  $scope.showSearch = false;    // hide search tools by default

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
    console.log('loadItems; page: ' + category.page + ', category:' + $scope.activeCategory);

    var url = getUrl(country.id, category.id, 'list');
    var request = getRequest(url, category.page, category.timestamp);
    console.log('Request: ' + JSON.stringify(request, null, 2));

    $http(request).success(function(data) {
      var newItems = createItems(data);
      if (category.page == 0) {
        category.items = newItems;
      } else {
        category.items = category.items.concat(newItems);
      }
      category.items = removeDuplicates(category.items);
      category.timestamp = getTimestamp(data);

      if (category.page == 0) {
        category.attributes = getAttributes(data);
      }
      category.page += 1;
      $rootScope.$broadcast('scroll.refreshComplete');
      $scope.$broadcast('scroll.infiniteScrollComplete');
      $ionicLoading.hide();
    }).error(function() {
      $ionicLoading.show(getError(url));
    });
  };

  // TODO: merge with loadItems()
  // TODO: support attributes
  $scope.searchItem = function() {
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[$scope.activeCategory];
    var url = getUrl(country.id, category.id, 'search');
    console.log('searchItem: ' + category.query);

    $ionicLoading.show({template: '<ion-spinner></ion-spinner>', noBackdrop: true});

    var params = {
      'sc_word': category.query
    };
    $.each(category.attributes, function(i, attribute) {
      console.log('attribute' + attribute);
      params[attribute.id] = attribute.selected;
    });
    // TODO: use getRequest() function
    var request = {
      method: 'POST',
      url: url,
      data: $.param(params),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    };
    console.log('Request: ' + JSON.stringify(request, null, 2));

    $http(request).success(function(data) {
      category.items = createItems(data);
      $ionicLoading.hide();
      $scope.$broadcast('scroll.infiniteScrollComplete');
    }).error(function() {
      $ionicLoading.show(getError(url));
    });

    category.query = '';
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.close();
    }
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
      // TODO: extract getItemDetail to separate function
      $scope.itemDetail = getItemDetail(data, dirname);
      $scope.modal.show();
      $ionicLoading.hide();
      $scope.$broadcast('scroll.infiniteScrollComplete');

    }).error(function() {
      $ionicLoading.show(getError(url));
    });
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


  // Category changed
  $scope.onCategoryChanged = function(index) {
    console.log('onCategoryChanged: ' + index);
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[$scope.activeCategory];
    $ionicSlideBoxDelegate.slide(index);
    $scope.activeCategory = index;
    service.autoScrollTabBar($scope.activeCategory);
    category.page = 0;
    $scope.loadItems();
    $ionicLoading.show({template: '<ion-spinner></ion-spinner>', noBackdrop: true});

  };

  // Pull to request
  $scope.onRefresh = function() {
    console.log('onRefresh');
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[$scope.activeCategory];
    category.page = 0;
    $scope.loadItems();
  };

  // Search button on header bar clicked
  $scope.onSearchClicked = function() {
    console.log('onSearchClicked');
    var country = $scope.countries[$scope.activeCountry];
    var category = country.categories[$scope.activeCategory];
    if ($scope.showSearch) {
      $scope.showSearch = false;
      category.page = 0;
      $scope.loadItems();
      $ionicLoading.show({template: '<ion-spinner></ion-spinner>', noBackdrop: true});
    } else {
      $scope.showSearch = true;
    }
  };
});
