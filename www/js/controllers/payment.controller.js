(function() {
  'use strict';

    angular.module('woocommerce-api.controllers')

    .controller('PaymentCtrl', function($scope, $ionicModal, $state, UserData, BasketData, MetaData, CONFIG, PAYMENT_CONFIG) {

        // Get meta
        $scope.meta = {};
        MetaData.getProperties().then(
            function(result) {
                $scope.store = result;
                console.log("RESULT:", result);
            }
        );

        // Get the basket products
        $scope.basketProducts = BasketData.getBasket();
        $scope.paid = false;

        // Email validation regex with a simplified RFC 2822 implementation
        // which doesn't support double quotes and square brackets.
        var email_regex = RegExp(["[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*",
            "+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]",
            "(?:[a-z0-9-]*[a-z0-9])?"
        ].join(''));

        $scope.email = {
            addr: ''
        };


        // Register User
        $scope.registerUser = function() {
            // var url = CONFIG.site_url + "/wp-login.php?action=register";
            // window.open(url, '_blank');
            $state.go('app.newCustomer');
        };

        $scope.neft_Payment = function(){
              $state.go('app.neftPayment');

        };
        $scope.isLogedIn = false;
        $scope.evaluateEmail = function() {
            var valid = email_regex.test($scope.email.addr);

            if (valid) {
                UserData.check($scope.email.addr).then(function(user) {
                    $scope.emailVerified = true;
                    $scope.user = user;
                    $scope.isLogedIn = true;
                   $window.localStorage['user'] =JSON.stringify($scope.user);
                    console.log(user);
                }, function() {
                    $scope.emailVerified = false;
                });
            } else {
                $scope.emailVerified = false;
                $scope.user = null;
            }
        };

        $scope.canPay = function() {
            $scope.totalPrice = BasketData.getTotal();
            return $scope.totalPrice > 0 && $scope.emailVerified;
        }
        // Hide modal and go back to cart
        $scope.closeModal = function() {
            $scope.shippingAddressModal.hide();
            $state.go('app.payment');
        };
        // Modal for shipping info
        $ionicModal.fromTemplateUrl('templates/shipping-info-modal.html', function(modal) {
            $scope.shippingAddressModal = modal;// Billing info check
        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });

        // Shipping Info Modal Done button
        $scope.shippingModalAccept = function() {
            $scope.shippingAddressModal.hide();
            $scope.user.customer.shipping_address = $scope.shipping_address;
            $scope.payViaPaypal();
        };

        $scope.isPaid = function() {
            return $scope.paid;
        };
        $scope.payViaRazorpay = function(){
          var customer = $scope.user.customer;
          $scope.paid=false;
            var options = {
                description: 'Please check cart your amount before pay.',
                image:"http://packnation.in/wp-content/uploads/2015/12/logo.jpg",
                currency: 'INR',
                key: 'rzp_live_Jta8q6CBITnSIc',
                amount: $scope.totalPrice*100,
                name: "Packnation",
                prefill: {email: customer.email, contact: customer.billing_address.phone, name:customer.username},
                theme: {color: '#F37254'}
            }

            var successCallback = function(payment_id) {
                console.log('payment_id: ' + payment_id);
                BasketData.sendOrder('razorPay', true,payment_id).then(
                    function(response) {
                        console.log("response : " + JSON.stringify(response));
                        $scope.order = response.data.order;
                        BasketData.emptyBasket();
                          $rootScope.$broadcast('loading:hide');

                          $ionicHistory.clearHistory();
                          $ionicHistory.nextViewOptions({
                            disableAnimate: true,
                            disableBack: true
                          });
                          $scope.paid=true;
                    },
                    function(response) {
                        console.error("Error: order request could not be sent.", response);
                        BasketData.broadcast('Product order','Hi Product not available.','OK','button-positive');
                        BasketData.emptyBasket();
                        $rootScope.$broadcast('loading:hide');
                    });
            }

            var cancelCallback = function(error) {
                BasketData.broadcast('Payment not recceived','Payment not received, please again later.','OK','button-positive');
            }

            RazorpayCheckout.open(options, successCallback, cancelCallback);
        }

        $ionicModal.fromTemplateUrl('templates/stripe-modal.html', function(modal) {
            $scope.stripeModal = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });

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
