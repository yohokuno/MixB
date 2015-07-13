
app.controller('MainCtrl', function($scope, $rootScope, $http, $timeout,
                                    $ionicModal, $ionicLoading,
                                    $ionicSideMenuDelegate, $ionicSlideBoxDelegate,
                                    scrollService) {

  // Main model data for countries; see data.js
  $scope.countries = allCountries;
  $scope.categories = allCategories;
  initCategories($scope.categories);

  $scope.activeCountry = 0;     // select UK by default
  $scope.activeCategory = 0;    // select acm by default
  $scope.showSearch = false;    // hide search tools by default
  $scope.itemDetail = null;     // no item details when open

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
    var category = $scope.categories[$scope.activeCategory];
    console.log('loadItems; page: ' + category.list.page + ', category:' + $scope.activeCategory);

    var url = getUrl(country.id, category.id, 'list');
    var request = getRequest(url, category.list.page, category.list.timestamp);
    console.log('Request: ' + JSON.stringify(request, null, 2));

    $http(request).success(function(data) {
      var newItems = createItems(data);
      if (category.list.page == 0) {
        category.list.items = newItems;
      } else {
        category.list.items = category.list.items.concat(newItems);
      }
      category.list.items = removeDuplicates(category.list.items);
      category.list.timestamp = getTimestamp(data);

      if (category.list.page == 0) {
        category.search.attributes = getAttributes(data);
      }
      category.list.page += 1;
      $rootScope.$broadcast('scroll.refreshComplete');
      $scope.$broadcast('scroll.infiniteScrollComplete');
      $ionicLoading.hide();
    }).error(function() {
      $ionicLoading.show(getError(url));
    });
  };

  // TODO: merge with loadItems()
  $scope.searchItem = function() {
    var country = $scope.countries[$scope.activeCountry];
    var category = $scope.categories[$scope.activeCategory];
    var url = getUrl(country.id, category.id, 'search');
    console.log('searchItem: ' + category.search.query);

    $ionicLoading.show(loadingTemplate);

    // TODO: extract to separate function
    var params = {
      'sc_word': category.search.query
    };
    $.each(category.search.attributes, function(i, attribute) {
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
      category.search.items = createItems(data);
      $ionicLoading.hide();
      $scope.$broadcast('scroll.infiniteScrollComplete');
    }).error(function() {
      $ionicLoading.show(getError(url));
    });

    category.search.query = '';
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.close();
    }
  };

  // Open item detail modal view
  $scope.openItemDetail = function(item) {
    console.log('openItemDetail'+ item);
    var country = $scope.countries[$scope.activeCountry];
    var category = $scope.categories[$scope.activeCategory];
    var dirname = getUrl(country.id, category.id);
    var url = getUrl(country.id, category.id, 'detail', item.id);

    $ionicLoading.show(loadingTemplate);

    $http.get(url).success(function(data) {
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
    $scope.activeCategory = 0;
    initCategories($scope.categories);
    // It seems like infinite scroll does not work when side menu is toggled
    $scope.loadItems();
    $ionicSideMenuDelegate.toggleLeft(false);
  };

  // Show/hide side menu
  $scope.toggleCountries = function() {
    console.log('toggleCountries');
    $ionicSideMenuDelegate.toggleLeft();
  };

  // Category changed by swiping on slide box or clicking tab
  $scope.onCategoryChanged = function(index) {
    console.log('onCategoryChanged: ' + index);
    var category = $scope.categories[$scope.activeCategory];
    $scope.activeCategory = index;
    scrollService.autoScrollTabBar($scope.activeCategory);
    scrollService.scrollMainToTop();
    $scope.showSearch = false;
    category.list.page = 0;
    // Infinite scroll must load items here if no items in the new category
  };

  // Category tab clicked
  $scope.onTabClicked = function(index) {
    console.log('onTabClicked: ' + index);
    if (index != $scope.activeCategory) {
      // This triggers onCategoryChanged automatically
      $ionicSlideBoxDelegate.slide(index);
    } else {
      scrollService.scrollMainToTop();
    }
  };

  // Pull to request
  $scope.onRefresh = function(index) {
    console.log('onRefresh: ' + index);
    if (index == $scope.activeCategory) {
      var category = $scope.categories[$scope.activeCategory];
      category.list.page = 0;
      $scope.loadItems();
      // we don't need to empty the items list because loadItems does it when new items are ready
    }
  };

  // Vertical scroll reached the end so load more data
  // Note: this can be called on first page when the items list is empty
  $scope.onInfinite = function(index) {
    //console.log('onInfinite: ' + index);
    if (index == $scope.activeCategory) {
      console.log('onInfinite: ' + index);
      $scope.loadItems();
    }
  };

  // Search button on header bar clicked
  $scope.toggleSearch = function() {
    console.log('toggleSearch');
    $scope.showSearch = !$scope.showSearch;
  };
});
