/// <reference path="../typings/angularjs/angular.d.ts"/>
"use strict";
angular.module('woocommerce-api.controllers', [])
.controller('AppCtrl',AppCtrl)// Home Controller
.controller('HomeCtrl', function($scope,$state,$location, $rootScope, Data, UserData, MetaData,CategoriesData,CartData) {

    $scope.items = Data.items;

    $scope.index = {};

    MetaData.getProperties().then(
        function(result) {
            $scope.index = result;

        }
    );
    $scope.getAllProduct = function(){
          $state.go('app.home');
    };
    $scope.moveToCategory = function(cat){
      $rootScope.cat = cat;
      if(cat.children.length == 0 && cat.count > 0 ){
          $location.path('/app/categories/'+cat.slug+'/'+cat.name);
      }else{
        $state.go('app.subcategory');
      }
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

// New Customer Controller
.controller('NewCustomerCtrl', function($scope,$ionicScrollDelegate, $rootScope, $window, $ionicPopup, UserData) {

    $scope.customer = {};
    $scope.billing_address = {};
    $scope.shipping_address = {};
    $scope.customer.edit = true;
    if($window.localStorage['user']){
      $scope.customer =    JSON.parse($window.localStorage['user']).customer;
      $scope.billing_address = $scope.customer.billing_address;
      $scope.shipping_address = $scope.customer.shipping_address;
      $scope.customer.edit = false;
       $scope.isLogedIn = true;

      }

      function isFormValid(){
        $scope.errorMsg = null;

        if($scope.billing_address.phone != null ){

          if(isNaN($scope.billing_address.phone)){
              $scope.errorMsg = "Phone number must be in numbers";
               $ionicScrollDelegate.scrollBottom();
              return false;
          }else  if($scope.billing_address.phone.length != 10){
              $scope.errorMsg = "Phone number must be of 10 digits";
               $ionicScrollDelegate.scrollBottom();
              return false;
          }
        }
        return true;
      }

    function setBillingAndShippingNameIfNull(){
      if($scope.billing_address.first_name == null){
        $scope.billing_address.first_name = $scope.customer.first_name ;
      }
      if($scope.billing_address.last_name == null){
        $scope.billing_address.last_name = $scope.customer.last_name ;
      }
      if($scope.shipping_address.first_name == null){
        $scope.shipping_address.first_name = $scope.customer.first_name ;
      }
      if($scope.shipping_address.last_name == null){
        $scope.shipping_address.last_name = $scope.customer.last_name ;
      }
    }
    $scope.createCustomer = function() {
      if(!isFormValid()){
        return;
      }
      setBillingAndShippingNameIfNull();

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
                    country: 'IN',
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
                    country: 'IN'
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
