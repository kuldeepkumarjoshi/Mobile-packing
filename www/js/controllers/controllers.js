/// <reference path="../typings/angularjs/angular.d.ts"/>
"use strict";
angular.module('woocommerce-api.controllers', [])
.controller('AppCtrl',AppCtrl)// Home Controller
.controller('HomeCtrl', function($scope,$state, $rootScope, Data, UserData, MetaData,CategoriesData,CartData) {

    $scope.items = Data.items;

    $scope.index = {};
    $scope.getCart = function(){
      CartData.getCartAsync();
    };
    $scope.createCart= function(){
      CartData.createCart({id:8121,quantity:1002});
    };

    MetaData.getProperties().then(
        function(result) {
            $scope.index = result;

        }
    );

    $scope.moveToCategory = function(cat){
      $rootScope.cat = cat;
      $state.go('app.subcategory');
    };
    $rootScope.$broadcast('loading:show');

    CategoriesData.async().then(
        // successCallback
        function() {
            var cats = CategoriesData.getAll();
          //  console.log(cats)
                // Create layered categories/sub-categories view
            var parents = [];

            angular.forEach(cats, function(cat, key) {

                // Has no parent itself
                if (cat.parent == 0) {
                    parents[cat.id] = cat;
                    // list which contains subcategories
                    parents[cat.id].children = [];

                }
                // Or there are categories that consider it a parent
                else if (parents[cat.parent] == undefined) {
                    parents[cat.parent] = {
                        children: []
                    };
                }

            });

            // Add children
            angular.forEach(cats, function(cat, key) {
                if (cat.parent != 0) {
                    parents[cat.parent].children.push(cat);

                    // If was initialized, consider it a parent
                    if (parents[cat.id] != undefined)
                        for (var attr in cat)
                            parents[cat.id][attr] = cat[attr];
                }
            });

            // Fix indices to be 0-based instead of id based
            $scope.categories = parents.filter(function() {
                return true;
            });

            $rootScope.$broadcast('loading:hide');

        },
        // errorCallback
        function() {
            $rootScope.$broadcast('loading:hide');
            console.warn("Was unable to fetch categories data from the API.");
        }
    );

    $scope.getPercentageValue = function(value, total) {
        return value * 100 / total;
    }

    $scope.options = {
        scaleColor: false,
        lineWidth: 10,
        lineCap: 'square',
        barColor: '#9b5c8f',
        size: 100,
        animate: 500
    };


})

// Products Controller
.controller('ProductsCtrl', function($rootScope, $scope, ProductsData) {

    $scope.title = 'Products';
    $scope.products = [];
    $scope.productPage = 0;


    $scope.hasMoreProducts = function() {
        return (ProductsData.hasMore() || $scope.productPage == 0);
    };

    $scope.loadMoreProducts = function() {

        $rootScope.$broadcast('loading:show');

        ProductsData.getProductsAsync($scope.productPage + 1).then(
            // successCallback
            function() {
                $scope.productPage++;
                $scope.products = ProductsData.getAll();
                $scope.$broadcast('.infiniteScrollComplete');

                $rootScope.$broadcast('loading:hide');
            },
            // errorCallback
            function() {
                $rootScope.$broadcast('loading:hide');
                console.warn("Was unable to fetch products data from the API.");
            }
        );
    };

    // Load once as soon as the page loads
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        //if (toState['name'] === 'app.products' && $scope.products.length == 0)
        //$scope.loadMoreProducts();
    });

})
// Categories Controller
.controller('CategoriesCtrl', function($rootScope, $scope, CategoriesData) {

    $rootScope.$broadcast('loading:show');

    CategoriesData.async().then(
        // successCallback
        function() {
            var cats = CategoriesData.getAll();
            console.log(cats)
                // Create layered categories/sub-categories view
            var parents = [];

            angular.forEach(cats, function(cat, key) {

                // Has no parent itself
                if (cat.parent == 0) {
                    parents[cat.id] = cat;
                    // list which contains subcategories
                    parents[cat.id].children = [];

                }
                // Or there are categories that consider it a parent
                else if (parents[cat.parent] == undefined) {
                    parents[cat.parent] = {
                        children: []
                    };
                }

            });

            // Add children
            angular.forEach(cats, function(cat, key) {
                if (cat.parent != 0) {
                    parents[cat.parent].children.push(cat);

                    // If was initialized, consider it a parent
                    if (parents[cat.id] != undefined)
                        for (var attr in cat)
                            parents[cat.id][attr] = cat[attr];
                }
            });

            // Fix indices to be 0-based instead of id based
            $scope.categories = parents.filter(function() {
                return true;
            });

            $rootScope.$broadcast('loading:hide');

        },
        // errorCallback
        function() {
            $rootScope.$broadcast('loading:hide');
            console.warn("Was unable to fetch categories data from the API.");
        }
    );

    $scope.getPercentageValue = function(value, total) {
        return value * 100 / total;
    }

    $scope.options = {
        scaleColor: false,
        lineWidth: 10,
        lineCap: 'square',
        barColor: '#9b5c8f',
        size: 100,
        animate: 500
    };

})

// Category Controller
.controller('CategoryCtrl', function($rootScope, $scope, $stateParams, ProductsData) {

    $scope.title = $stateParams.category_name;
    $scope.slug = $stateParams.category_slug;
    $scope.products = [];
    $scope.productsPage = 0;
    ProductsData.clear();
    $scope.categoryName = $stateParams.category_name;

    $scope.hasMoreProducts = function() {
        return (ProductsData.hasMore() || $scope.productsPage == 0);
    };

    $scope.loadMoreProducts = function() {

        $rootScope.$broadcast('loading:show');

        ProductsData.getProductsAsync(
            $scope.productsPage + 1, {
                'filter[category]': encodeURIComponent($stateParams.category_slug)
            }).then(
            // successCallback
            function() {
                $scope.productsPage++;
                $scope.products = ProductsData.getAll();
                $scope.$broadcast('scroll.infiniteScrollComplete');

                $rootScope.$broadcast('loading:hide');
            },
            // errorCallback
            function() {
                $rootScope.$broadcast('loading:hide');
                console.warn("Was unable to fetch products data from the API.");
            }
        );
    };

    //*
    // Load once as soon as the page loads
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

        if (toState['name'] === 'app.category') {
            //$scope.loadMoreProducts();
        }
    });

})

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
              if ($scope.basketProducts.length > 0) {
                  var total_price = BasketData.getTotal();
              $scope.totalPriceHtml =  $scope.meta.currency_format + total_price.toFixed(2) ;
              $scope.totalPrice = total_price.toFixed(2) ;
            }  else {
                  $scope.totalPriceHtml = '0';
                  $scope.totalPrice = 0;
              }
                $rootScope.$broadcast('loading:hide');
          }
      );
    }
    setTotalField();
    // Get the basket products

    // Calculate total price


        if ($scope.basketProducts.length > 0) {
            var total_price = BasketData.getTotal();

            if ($scope.meta.currency_position == 'left') {
                $scope.totalPriceHtml =  $scope.meta.currency_format + total_price.toFixed(2) ;
            } else if ($scope.meta.currency_position == 'left_space') {
                $scope.totalPriceHtml =  $scope.meta.currency_format + ' ' + total_price.toFixed(2) ;
            } else if ($scope.meta.currency_position == 'right') {
                $scope.totalPriceHtml =  total_price.toFixed(2) + $scope.meta.currency_format ;
            } else {
                $scope.totalPriceHtml =  total_price.toFixed(2) + ' ' + $scope.meta.currency_format;
            }
        } else {
            $scope.totalPriceHtml = '0';
            $scope.totalPrice = 0;
        }



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
        BasketData.emptyBasket();
    };
    $scope.applyCoupon = function(){
      $rootScope.$broadcast('loading:show');
    var cart =  CartData.generateSessionCart(BasketData.getBasket());
    console.log(cart);

    var cartItems = {
      basketData : cart,
      couponCode : $scope.helperData.couponCode
    };
    CartData.addToCart(cartItems).then(
      function(response){
        if(response.data){
          console.log("response");
          console.log(response);
          BasketData.emptyBasket();
          var basketItems = angular.copy(response.data.cartItems);
          var totalCartValue = angular.copy(response.data.totalCartValue);
          $scope.oldTotalPriceHtml=0;
          angular.forEach(basketItems, function(item, key) {
            var cartProduct = [];
              cartProduct = BasketData.getProductIdCartMap(item.product_id);
              cartProduct['price']= item.data.price;
              cartProduct['quantity']= item.quantity;
              cartProduct['variation']= item.variation;
              $scope.oldTotalPriceHtml = $scope.oldTotalPriceHtml + (item.line_subtotal+item.line_subtotal_tax);
            BasketData.add(cartProduct);
            $scope.helperData.couponCode='';
          });
          $scope.basketProducts = BasketData.getBasket();
          $scope.cartItems = $scope.basketProducts.length;
          BasketData.setTotalBasketValue(totalCartValue);
          $scope.oldTotalPriceHtml=  $scope.oldTotalPriceHtml.toFixed(2);
          BasketData.setDiscountAmount($scope.meta.currency_format + response.data.discountAmount);
          $scope.discountAmount =$scope.meta.currency_format + response.data.discountAmount.toFixed(2) ;
          if ($scope.basketProducts.length > 0) {
              var total_price = BasketData.getTotal();
            $scope.totalPriceHtml =  $scope.meta.currency_format + total_price.toFixed(2) ;
            $scope.totalPrice = total_price.toFixed(2) ;
          }else{
                $scope.totalPriceHtml = '0';
                $scope.totalPrice = 0;
          }
            $rootScope.$broadcast('loading:hide');
            BasketData.broadcast('Coupon status',response.data.couponStatus,'OK','button-positive');
        }
      });
    }
    $scope.removeProduct = function(id) {
      $rootScope.$broadcast('loading:show');
    var cart =  CartData.generateSessionCart(BasketData.getBasket());
    var product = _.find(cart, { id: parseInt(id) });
    cart.splice(cart.indexOf(product), 1);
    console.log(cart);
    var cartItems = {
      basketData : cart,
    };
    CartData.addToCart(cartItems).then(
      function(response){
        if(response.data){
          console.log("response");
          console.log(response);
          BasketData.emptyBasket();
          var basketItems = angular.copy(response.data.cartItems);
          var totalCartValue = angular.copy(response.data.totalCartValue);
          angular.forEach(basketItems, function(item, key) {
            var cartProduct = [];
              cartProduct = BasketData.getProductIdCartMap(item.product_id);
              cartProduct['price']= item.data.price;
              cartProduct['quantity']= item.quantity;
              cartProduct['variation']= item.variation;
            BasketData.add(cartProduct);
          });
          $scope.basketProducts = BasketData.getBasket();
          $scope.cartItems = $scope.basketProducts.length;
          BasketData.setTotalBasketValue(totalCartValue);
          if ($scope.basketProducts.length > 0) {
              var total_price = BasketData.getTotal();
            $scope.totalPriceHtml =  $scope.meta.currency_format + total_price.toFixed(2) ;
            $scope.totalPrice = total_price.toFixed(2) ;
          }else{
                $scope.totalPriceHtml = '0';
                $scope.totalPrice = 0;
          }
            $rootScope.$broadcast('loading:hide');

        }
    });
    };

    $scope.proceedToOrder = function() {
        $state.go('app.orderAddress');
    };
})
// New Customer Controller
.controller('NewCustomerCtrl', function($scope, $rootScope, $window, $ionicPopup, UserData) {

    $scope.customer = {};
    $scope.billing_address = {};
    $scope.shipping_address = {};
    $scope.customer.edit = true;

    $scope.createCustomer = function() {
      $rootScope.$broadcast('loading:show');
        var data = {
            customer: {
                email: $scope.customer.email,
                first_name: $scope.customer.first_name,
                last_name: $scope.customer.last_name,
                username: $scope.customer.username,
                password: $scope.customer.password,
                billing_address: {
                    first_name: $scope.billing_address.first_name,
                    last_name: $scope.billing_address.last_name,
                    company: $scope.billing_address.company,
                    address_1: $scope.billing_address.address_1,
                    address_2: $scope.billing_address.address_2,
                    city: $scope.billing_address.city,
                    state: $scope.billing_address.state,
                    postcode: $scope.billing_address.postcode,
                    country: $scope.billing_address.country,
                    email: $scope.billing_address.email,
                    phone: $scope.billing_address.phone
                },
                shipping_address: {
                    first_name: $scope.shipping_address.first_name,
                    last_name: $scope.shipping_address.last_name,
                    company: $scope.shipping_address.company,
                    address_1: $scope.shipping_address.address_1,
                    address_2: $scope.shipping_address.address_2,
                    city: $scope.shipping_address.city,
                    state: $scope.shipping_address.state,
                    postcode: $scope.shipping_address.postcode,
                    country: $scope.shipping_address.country
                }
            }
        };

        UserData.createCustomer(data).then(function(result) {
            $scope.customer = result.data.customer;
            $scope.customer.edit = false;
            if(!$window.localStorage['user']){
               $scope.isLogedIn = true;
                $scope.emailVerified = true;
                $scope.user= {};
                $scope.user.customer = $scope.customer;
                $window.localStorage['user'] =JSON.stringify($scope.user);
                $window.location.reload(true);
              }
              $rootScope.$broadcast('loading:hide');
            var alertPopup = $ionicPopup.alert({
                title: 'Success',
                template: 'Customer created successfully'
            });
        }, function(result) {
            console.log(result)
              $rootScope.$broadcast('loading:hide');
            var alertPopup = $ionicPopup.alert({
                title: 'Registration Error',
                template: result.data.errors[0].message
            });
        });

    }

});
