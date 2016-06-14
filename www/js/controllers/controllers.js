/// <reference path="../typings/angularjs/angular.d.ts"/>
"use strict";
angular.module('woocommerce-api.controllers', [])

// Application Controller
.controller('AppCtrl', function($scope, MenuData, BasketData) {

    $scope.items = MenuData.items;

    var cartItems = BasketData.getBasket();
    $scope.cartItems = cartItems.length;

    $scope.$on('basket', function(event, args) {
        cartItems = BasketData.getBasket();
        $scope.cartItems = cartItems.length;
    });

})

// Home Controller
.controller('HomeCtrl', function($scope,$state, $rootScope, Data, UserData, MetaData,CategoriesData) {

    $scope.items = Data.items;

    $scope.index = {};

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

// Product Controller
.controller('ProductCtrl', function($rootScope, $scope, $stateParams, $ionicSlideBoxDelegate, ProductsData, BasketData, ReviewsData, CategoriesData) {

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
      stepValue = category.stepValue;
      $scope.minQuantity = category.minQuantity;
      $scope.maxQuantity = $scope.product.stock_quantity;
      $scope.quantity.value = $scope.minQuantity ;
      $scope.inStock = ($scope.minQuantity < $scope.product.stock_quantity);
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
    ReviewsData.async($stateParams.product_id).then(function() {
        $scope.reviews = ReviewsData.getAll();
    });

    // Pretty print dates, e.g. "5 days ago"
    $scope.humaneDate = humaneDate;

    // In app browser
    $scope.openLink = function(url) {
        window.open(url, '_blank');
    };

    // Add product to basket
    $scope.toBasket = function() {
        $scope.product['quantity'] = $scope.quantity.value;
        BasketData.add($scope.product);
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
.controller('BasketCtrl', function($rootScope, $scope, $state, $sce, BasketData, MetaData) {

    $scope.meta = {};

    MetaData.getProperties().then(
        function(result) {
            $scope.meta = result.meta;
        }
    );

    // Get the basket products
    $scope.basketProducts = BasketData.getBasket();
    // Calculate total price
    $scope.calculateTotal = function() {

        if ($scope.basketProducts.length > 0) {
            var total_price = BasketData.getTotal();

            if ($scope.meta.currency_position == 'left') {
                $scope.totalPriceHtml = '<span class="amount">'
                    + $scope.meta.currency_format + total_price.toFixed(2) + '</span>';
            } else if ($scope.meta.currency_position == 'left_space') {
                $scope.totalPriceHtml = '<span class="amount">'
                    + $scope.meta.currency_format + ' ' + total_price.toFixed(2) + '</span>';
            } else if ($scope.meta.currency_position == 'right') {
                $scope.totalPriceHtml = '<span class="amount">'
                    + total_price.toFixed(2) + $scope.meta.currency_format + '</span>';
            } else {
                $scope.totalPriceHtml = '<span class="amount">'
                    + total_price.toFixed(2) + ' ' + $scope.meta.currency_format + '</span>';
            }

            $scope.totalPrice = total_price.toFixed(2);

        } else {
            $scope.totalPriceHtml = '<span class="amount">0</span>';
            $scope.totalPrice = 0;
        }
    
        return $scope.totalPriceHtml;
    };


    $scope.emptyBasket = function() {
        $scope.basketProducts = [];
        BasketData.emptyBasket();
    };

    $scope.removeProduct = function(id) {

        var product = _.find($scope.basketProducts, { id: parseInt(id) });

        $scope.basketProducts.splice($scope.basketProducts.indexOf(product), 1);
        $rootScope.$broadcast('basket');

    };

    $scope.proceedToOrder = function() {
        $state.go('app.payment');
    };
})
// New Customer Controller
.controller('NewCustomerCtrl', function($scope, $ionicPopup, UserData) {

    $scope.customer = {};
    $scope.billing_address = {};
    $scope.shipping_address = {};
    $scope.customer.edit = true;

    $scope.createCustomer = function() {

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

            var alertPopup = $ionicPopup.alert({
                title: 'Success',
                template: 'Customer created successfully'
            });

        }, function(result) {
            console.log(result)
            var alertPopup = $ionicPopup.alert({
                title: 'Registration Error',
                template: result.data.errors[0].message
            });

        });

    }

});
