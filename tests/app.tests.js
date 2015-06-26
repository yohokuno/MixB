describe('Controllers', function(){
    var scope;

    beforeEach(module('ionic'));
    beforeEach(module('MixB'));

    beforeEach(inject(function($rootScope, $controller) {
        scope = $rootScope.$new();
        $controller('MainCtrl', {$scope: scope});
    }));

    it('should initialize with UK, acm category', function(){
        expect(scope.activeCountry).toEqual(0);
        expect(scope.activeCategory).toEqual(0);
    });
/*
    it('select tab', function(){
        scope.onSlideChanged(1);
        expect(scope.activeCategory).toEqual(1);

        scope.onTabSelected(2);
        expect(scope.activeCategory).toEqual(2);
    });
*/
});