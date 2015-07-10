app.factory('service', function($ionicLoading, $ionicScrollDelegate, $timeout, $rootScope) {
  return {
    // Handle error
    handleError : function(url) {
      $ionicLoading.show({
        template: '読み込めませんでした：' + url,
        noBackdrop: true,
        duration: 2000
      })
    },
    // Auto scroll tab bar so active tab come to center
    autoScrollTabBar : function (activeCategory) {
      var tab = $('button.button-tab:nth-child(' + (activeCategory + 1) + ')');
      var tabWidth = tab.width();
      var tabLeft = ionic.DomUtil.getPositionInParent(tab[0]).left;
      var scrollWidth = $('ion-header-bar.bar-subheader').width();
      var scrollTo = tabLeft + tabWidth / 2 - scrollWidth / 2;
      // TODO: limit maximum of scrollTo
      scrollTo = Math.max(scrollTo, 0);

      var tabBarScroll  = $ionicScrollDelegate.$getByHandle('tab-bar');
      tabBarScroll.scrollTo(scrollTo, 0, true);
      console.log('autoScrollTabBar: ' + tabLeft + ' + ' + tabWidth + ' / 2 - ' + scrollWidth + ' / 2 = ' + scrollTo);

      // scroll item list to top
      var itemListScroll = $ionicScrollDelegate.$getByHandle('main');
      itemListScroll.scrollTop();
      $timeout( function() {
        scroll.resize();
      }, 50);

      $rootScope.$broadcast('scroll.infiniteScrollComplete');
    }
  };
});