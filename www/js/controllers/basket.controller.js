(function() {
  'use strict';

    angular.module('woocommerce-api.controllers')

    // Basket Controller
    .controller('BasketCtrl', function($rootScope,CartData, $scope, $state, $sce, BasketData, MetaData) {

      $scope.meta = {};
      $scope.helperData = {};
      $scope.basketProducts = BasketData.getBasket();
      console.log($scope.basketProducts);

      function setTotalField(){
      $rootScope.$broadcast('loading:show');
          MetaData.getProperties().then(
              function(result) {
                  $scope.meta = result.meta;

                    $rootScope.$broadcast('loading:hide');
              }
          );
        }
        setTotalField();
        function setPrice(){
          if ($scope.basketProducts.length > 0) {
              var total_price = BasketData.getTotalBasketValue();
          $scope.totalPriceHtml =  BasketData.totalPriceHtml;
          $scope.totalPrice = total_price.toFixed(2) ;
        }  else {
              $scope.totalPriceHtml = '0';
              $scope.totalPrice = 0;
          }
        }
        setPrice();

        $scope.getFormmatedPrice = function(price) {

               var formmatedPrice;

               if ($scope.meta.currency_position == 'left') {
                   formmatedPrice = '<span class="amount">'
                       + $scope.meta.currency_format + price + '</span>';
               } else if ($scope.meta.currency_position == 'left_space') {
                   formmatedPrice = '<span class="amount">'
                       + $scope.meta.currency_format + ' ' + price + '</span>';
               } else if ($scope.meta.currency_position == 'right') {
                   formmatedPrice = '<span class="amount">'
                       + price + $scope.meta.currency_format + '</span>';
               } else {
                   formmatedPrice = '<span class="amount">'
                       + price + ' ' + $scope.meta.currency_format + '</span>';
               }

               return formmatedPrice;
           };
        $scope.emptyBasket = function() {
            $scope.basketProducts = [];
            setPrice();
            CartData.emptyBasket();//---current basket
            BasketData.emptyBasket();//---stored basket
        };
        function resetBasketData(response,cartAddData){
          console.log("response");
          console.log(response);
          BasketData.emptyBasket();
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
              $scope.helperData.couponCode='';
          });
          if(response.data.discountAmount){
            BasketData.setCouponCode(cartAddData.couponCode);
            BasketData.discountAmount =  response.data.discountAmount;
            $scope.discountAmount =$scope.meta.currency_format + response.data.discountAmount.toFixed(2) ;
          }else{
            BasketData.setCouponCode(null);
            BasketData.discountAmount =  0;
            $scope.discountAmount =null;
          }
          $scope.basketProducts = BasketData.getBasket();
          BasketData.setTotalBasketValue(totalCartValue);
          BasketData.totalPriceHtml = totalPriceHtml;
          setPrice();
          $rootScope.$broadcast('loading:hide');
        }

        $scope.applyCoupon = function(){
            $scope.validationCoupon="";
            if(_.isEmpty($scope.helperData.couponCode)){
              $scope.validationCoupon="Enter coupon code to apply coupon.";
              return;
            }
            $rootScope.$broadcast('loading:show');
            var cart =  CartData.generateSessionCart(BasketData.getBasket());
            var cartAddData = {
              basketData : cart,
              couponCode : $scope.helperData.couponCode
            };
            $scope.oldTotalPriceHtml=angular.copy($scope.totalPriceHtml);
            CartData.addToCart(cartAddData).then(
              function(response){
                if(response.data){
                  resetBasketData(response,cartAddData);
                  BasketData.broadcast('Coupon status',response.data.couponStatus,'OK','button-positive');
                }
              },function(error){
                  BasketData.broadcast('Oops','Some error ,Please try again later','OK','button-positive');
                  $rootScope.$broadcast('loading:hide');
              });
        }

        $scope.removeProduct = function(id) {
          $scope.validationCoupon="";
          $rootScope.$broadcast('loading:show');
            var cart =  CartData.generateSessionCart(BasketData.getBasket());
            var product = _.find(cart, { id: parseInt(id) });
            cart.splice(cart.indexOf(product), 1);
            console.log(cart);

            var cartAddData = {
              basketData : cart,
            };
            if(cartAddData.basketData.length==0){
              $scope.emptyBasket();
              $rootScope.$broadcast('loading:hide');
              return;
            }
            CartData.addToCart(cartAddData).then(
              function(response){
                if(response.data){
                  resetBasketData(response,cartAddData);
                }
            },function(error){
                BasketData.broadcast('Oops','Some error ,Please try again later','OK','button-positive');
                $rootScope.$broadcast('loading:hide');
            });
        };

        $scope.proceedToOrder = function() {
            $state.go('app.orderAddress');
        };
    })

})();
