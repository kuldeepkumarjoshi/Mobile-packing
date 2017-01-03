(function() {
  'use strict';

    angular.module('woocommerce-api.controllers')

    .controller('PaymentCtrl', function($scope,$rootScope, $location, $window, UserData, BasketData ) {

        // Get the basket products
        $scope.basketProducts = BasketData.getBasket();
        $scope.paid = false;

        $scope.orderSuccess = function(){

            // var cartProduct = [];
            //   cartProduct['id'] = 8121;
            //   cartProduct['total'] = 5600;
            //   cartProduct['price']= 8;
            //   cartProduct['quantity']= 700;
            //   cartProduct['variation']= [];
            //   BasketData.add(cartProduct);
            //     $state.go('app.neftPayment');


              $location.path('/app/orderSuccess').search({method : 'bacs',paymentId:''});

        };

        $scope.canPay = function() {
            $scope.totalPrice = BasketData.getTotal();
            return $scope.totalPrice > 0 ;
        }

        if ($scope.basketProducts.length > 0) {
            $scope.totalPriceHtml = BasketData.totalPriceHtml ;
        }

        $scope.isPaid = function() {
            return $scope.paid;
        };
        $scope.payViaRazorpay = function(){
            $rootScope.$broadcast('loading:show');
          if(!$scope.canPay()){
            return ;
          }
          var customer = {};
          if($window.localStorage['user']){
             customer =  JSON.parse($window.localStorage['user']).customer;
          }else{
            customer = {
              email:'guest@packnation.in',
              username:'guest'
            }
          }
          $scope.paid=false;
            var options = {
                description: 'Packnation - Great packaging delivered.',
                image:"http://packnation.in/wp-content/uploads/2015/12/logo.jpg",
                currency: 'INR',
                key: 'rzp_live_Jta8q6CBITnSIc',
                amount: $scope.totalPrice*100,
                name: "Packnation",
                prefill: {email: customer.email, contact: BasketData.billing_address.phone, name:customer.username},
                theme: {color: '#27276b'}
            }
            var successCallback = function(payment_id) {
                console.log('payment_id: ' + payment_id);
                $rootScope.$broadcast('loading:hide');
                $location.path('/app/orderSuccess').search({method : 'razorPay',paymentId:payment_id});

            }
            var cancelCallback = function(error) {
                console.log('error: ' );
                console.log(error );
                $rootScope.$broadcast('loading:hide');
              BasketData.broadcast('Payment not recceived','Payment not received, please try again later.','OK','button-positive');
            }

            RazorpayCheckout.open(options, successCallback, cancelCallback);

        }

    })
})();


// $scope.completePayment = function() {
//     $scope.paid = true;
//     // Maybe a more robust way of handling this is necessary
//     BasketData.sendOrder('paypal', true).then(
//         function(response) {
//             console.log("payment complete: " + JSON.stringify(payment));
//         },
//         function(response) {
//             console.error("Error: order request could not be sent.", response);
//         });
//     $scope.basketProducts = [];
//     BasketData.emptyBasket();
// };
        // $scope.payViaSite = function(method, paid) {
        //     // Account exists/user checks out, send order.
        //     BasketData.sendOrder(method, paid).then(
        //         function(response) {
        //             // Redirect to the account page of the user to finalize the order.
        //             var url = CONFIG.site_url + "/index.php/my-account/";
        //             // Redirect to payment page immediately
        //             //var url = CONFIG.site_url + "/index.php/checkout/order-pay/" + response.data.order.order_number
        //             //          + '/?pay_for_order=true&key=' + response.data.order.order_key;
        //             window.open(url, '_blank');
        //
        //             $scope.basketProducts = [];
        //             BasketData.emptyBasket();
        //             $state.go('app.products');
        //         },
        //         function(response) {
        //             console.error("Error: order request could not be sent.", response);
        //         });
        // };

        // PayPalMobile implementation is not functional in browsers and will return an error.
        // $scope.payViaPaypal = function() {
        //
        //     // Billing info check
        //     var sa = $scope.user.customer.shipping_address;
        //     if  (sa.address_1 === "" || sa.address_2 === "" ||
        //         sa.city === "" || sa.company === "" || sa.country === "" ||
        //         sa.first_name === "" || sa.last_name === "" ||
        //         sa.postcode === "" || sa.state === "") {
        //
        //         $scope.shipping_address = sa;
        //         $scope.shippingAddressModal.show();
        //         return; // Once the modal is closed this function is called again.
        //     }
        //
        //     var paymentDetails = new PayPalPaymentDetails(
        //         // subtotal - Sub-total (amount) of items being paid for.
        //         String($scope.totalPrice),
        //         // shipping - Amount charged for shipping.
        //         "0.00",
        //         // tax - Amount charged for tax.
        //         "0.00"
        //     );
        //
        //     var payment = new PayPalPayment(
        //         String($scope.totalPrice), // amount
        //         $scope.store.meta.currency,
        //         $scope.store.name + " mobile payment", // description of the payment
        //         "Sale", // Sale (immediate payment) or Auth (authorization only)
        //         paymentDetails // The details set above, the amount should be the sum of the details.
        //     );
        //
        //     // Render payment UI
        //     window.PayPalMobile.renderSinglePaymentUI(
        //         payment,
        //         function(payment) {
        //             $scope.completePayment();
        //         },
        //         function(error) {
        //             console.warn(JSON.stringify(error));
        //         }
        //     );
        // };

/**
    Payment with stripe is a 2 step process, first you authenticate the user and
    generate a token, then you use that token to finalize the payment.
    The second step should be implemented on the server side for security reasons
    and it is out of the scope of this app.

    As such only a partial implementation
    will be shown along with guidelines for further steps.

    For more info about the process and supported configurations:
        https://stripe.com/docs/checkout#integration-custom

    How to test:
        https://stripe.com/docs/testing

    Supported countries and currencies:
        https://support.stripe.com/questions/which-currencies-does-stripe-support

    Server side implementation:
        https://stripe.com/docs/charges

**/
// $scope.payViaStripe = function() {
//     console.log("Stripe modal called.");
//
//     $scope.stripeModal.show();
//
//     /*
//     var handler = StripeCheckout.configure({
//         key: PAYMENT_CONFIG.stripe.public_key,
//         image: 'images/woocommerce-logo.png',
//         locale: 'auto',
//         currency: 'EUR',
//         token: function(token) {
//             console.log("Stripe checked out", token);
//
//             // Use the token to create the charge with a server-side script.
//             // You can access the token ID with `token.id`
//             $scope.paid = true;
//         }
//     });
//
//     // Open Checkout with further options
//     handler.open({
//         name: 'Stripe.com',
//         description: '2 widgets',
//         amount: 100 // In cents
//     });
//     */
// };
