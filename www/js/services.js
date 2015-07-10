app.factory('service', function($ionicLoading, $ionicScrollDelegate, $timeout, $rootScope, $sce) {
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

      var scroll = $ionicScrollDelegate.$getByHandle('tab-bar');
      scroll.scrollTo(scrollTo, 0, true);
      console.log('autoScrollTabBar: ' + tabLeft + ' + ' + tabWidth + ' / 2 - ' + scrollWidth + ' / 2 = ' + scrollTo);

      // scroll item list to top
      var scroll = $ionicScrollDelegate.$getByHandle('main');
      scroll.scrollTop();
      $timeout( function() {
        scroll.resize();
      }, 50);

      $rootScope.$broadcast('scroll.infiniteScrollComplete');
    },
    // Get search attributes
    getAttributes : function (data) {
      var attributes = $(data).find('table > tbody > tr > td > table > tbody > tr > td > select');
      return attributes.map(function (i, e) {
        var label = $(e).find(':first-child').text().replace('で検索', '');
        $(e).find(':first-child').html('指定なし');
        return {
          id: e.name,
          label: label,
          html: $sce.trustAsHtml(e.innerHTML)
        };
      });
    }
  };
});