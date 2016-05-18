(function() {
  'use strict';

    angular.module('woocommerce-api.controllers')

    // Social Controller
    .controller('SocialCtrl', function($scope, SocialData) {

        $scope.socialItems = SocialData.items;
        
        // In app browser
        $scope.openLink = function(url) {
            window.open(url, '_blank');
        };

    });

})();