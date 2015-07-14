app.service('scrollService', function($ionicScrollDelegate, $timeout, $rootScope) {
  // Scroll tab bar so active tab come to center
  this.tabToCenter = function (activeCategory) {
    var tab = $('button.button-tab:nth-child(' + (activeCategory + 1) + ')');
    var tabWidth = tab.width();
    var tabLeft = ionic.DomUtil.getPositionInParent(tab[0]).left;
    var scrollWidth = $('ion-header-bar.bar-subheader').width();
    var scrollTo = tabLeft + tabWidth / 2 - scrollWidth / 2;
    // TODO: limit maximum of scrollTo
    scrollTo = Math.max(scrollTo, 0);

    var tabBarScroll  = $ionicScrollDelegate.$getByHandle('tabBar');
    tabBarScroll.scrollTo(scrollTo, 0, true);
    console.log('tabToCenter: ' + tabLeft + ' + ' + tabWidth + ' / 2 - ' + scrollWidth + ' / 2 = ' + scrollTo);
  };

  // Scroll item list area to top
  // Note that this function scroll all categories to top
  this.mainToTop = function() {
    // scroll item list to top
    var itemListScroll = $ionicScrollDelegate.$getByHandle('itemList');
    itemListScroll.scrollTop(true);
    $timeout( function() {
      itemListScroll.resize();
    }, 50);
    $rootScope.$broadcast('scroll.infiniteScrollComplete');
  };

  // Scroll item detail to top
  this.itemDetailToTop = function() {
    $ionicScrollDelegate.$getByHandle('itemDetail').scrollTop();
  };
});