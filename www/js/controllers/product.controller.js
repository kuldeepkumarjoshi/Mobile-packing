(function() {
  'use strict';

    angular.module('woocommerce-api.controllers')

    .controller('ProductCtrl', function($rootScope,CartData, $scope, $stateParams, $ionicSlideBoxDelegate, ProductsData, BasketData, ReviewsData, CategoriesData) {

        $rootScope.$broadcast('loading:show');
        var stepValue = 1;
        $scope.minQuantity = 1;
        $scope.maxQuantity = 100;
        $scope.quantity ={};
        $scope.inStock = true;
        ProductsData.clear();

        $scope.stepUp = function(){
          if(  $scope.quantity.value + stepValue > $scope.maxQuantity){
              $scope.quantity.value = $scope.maxQuantity;
          }else{
              $scope.quantity.value += stepValue;
          }
        }
        $scope.stepDown = function(){
          if(  $scope.quantity.value - stepValue < $scope.minQuantity){
              $scope.quantity.value = $scope.minQuantity;
          }else{
              $scope.quantity.value -= stepValue;
          }
        }
        function initiateQuantity(category){
          if($scope.product.quantityRule != undefined && !_.isEmpty($scope.product.quantityRule.min_value)){
            $scope.minQuantity = parseInt($scope.product.quantityRule.min_value);
          }else{
            $scope.minQuantity  = category.minQuantity;
          }
          if($scope.product.quantityRule != undefined &&  !_.isEmpty($scope.product.quantityRule.min_value )){
            stepValue =  parseInt($scope.product.quantityRule.step);
          }else{
            stepValue  =  category.stepValue;
          }

          $scope.maxQuantity = $scope.product.stock_quantity;
          $scope.quantity.value = $scope.minQuantity ;
          $scope.inStock = ($scope.minQuantity < $scope.product.stock_quantity);
          $scope.tableData = $scope.product.tableData;
        }

        CategoriesData.async();
        // Try to get product locally, fallback to REST API
        ProductsData.getProductAsync($stateParams.product_id).then(function(product) {

            $scope.product = product;
            $scope.productCategory =   CategoriesData.getByName($scope.product.categories[0]);
            initiateQuantity($scope.productCategory);

            // Required for the image gallery to update
            $ionicSlideBoxDelegate.update();

            $rootScope.$broadcast('loading:hide');

        });

        // Review loader (Despite the ambigious wording, review pagination is not supported by the WC API)
        // ReviewsData.async($stateParams.product_id).then(function() {
        //     $scope.reviews = ReviewsData.getAll();
        // });

        // Pretty print dates, e.g. "5 days ago"
        $scope.humaneDate = humaneDate;

        // In app browser
        $scope.openLink = function(url) {
            window.open(url, '_blank');
        };

        // Add product to basket
        $scope.toBasket = function() {
            $rootScope.$broadcast('loading:show');
          var cart =  CartData.generateSessionCart(BasketData.getBasket());

          var addToCartProduct = {id:$scope.product.id,quantity: $scope.quantity.value};
          cart.push(addToCartProduct);
          console.log(cart);
          BasketData.putProductIdCartMap($scope.product.id,$scope.product);
          var cartAddData = {
            basketData : cart,
          };
          CartData.addToCart(cartAddData).then(
            function(response){
              if(response.data){
                console.log("response");
                console.log(response);
                BasketData.emptyBasket();
                 BasketData.discountAmount = null;
                var basketItems = angular.copy(response.data.cartItems);
                var totalCartValue = angular.copy(response.data.totalCartValue);
                var totalPriceHtml = angular.copy(response.data.totalCartHtml);
                angular.forEach(basketItems, function(item, key) {
                  var cartProduct = [];
                    if(BasketData.getProductIdCartMap(item.product_id)){
                        cartProduct = BasketData.getProductIdCartMap(item.product_id);
                    }
                    cartProduct['total'] = item.line_subtotal+item.line_subtotal_tax;
                    cartProduct['price']= item.data.price;
                    cartProduct['quantity']= item.quantity;
                    cartProduct['variation']= item.variation;
                  BasketData.add(cartProduct);
                });
                BasketData.setTotalBasketValue(totalCartValue);
                  BasketData.totalPriceHtml = totalPriceHtml;
                  $rootScope.$broadcast('loading:hide');
                BasketData.broadcast('Added to Cart','Product successfully added to your Cart.','OK','button-positive');

              }
          });

        };

        $scope.isNumber = angular.isNumber;

        // Share Product
        $scope.shareProduct = function() {

            var subject = $scope.product.title;
            var message = $scope.product.short_description;
            message = message.replace(/(<([^>]+)>)/ig, "");

            var link = $scope.product.permalink;

            //Documentation: https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin
             //window.plugins.socialsharing.share('Message', 'Subject', 'Image', 'Link');
            window.plugins.socialsharing.share(message, subject, null, link);
        }

        $scope.getSlugByName = function(name) {
            return CategoriesData.getByName(name).slug;
        }

    })
})();
