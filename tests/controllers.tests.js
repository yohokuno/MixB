describe('Controllers', function(){
    var scope;

    // load the controller's module
    beforeEach(module('ionic'));
    beforeEach(module('MixB'));

    beforeEach(inject(function($rootScope, $controller) {
        scope = $rootScope.$new();
        $controller('MainCtrl', {$scope: scope});
    }));

    // tests start here
    it('should have set active country to UK', function(){
        expect(scope.activeCountry).toEqual(0);
    });
});