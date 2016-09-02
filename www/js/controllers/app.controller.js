
    // Application Controller
var AppCtrl = function($scope,$rootScope,$window,$ionicHistory,$ionicPopup,$state, MenuData, BasketData,UserData,CartData) {

        $scope.items = MenuData.items;
        $scope.isLogedIn = false;
        if($window.localStorage['user']){
            $scope.isLogedIn = true;
        }

        $scope.$on('basket', function(event, args) {
            var   currentCartData = CartData.getCurrentCart();
            $rootScope.cartItems = currentCartData.length;
        });
        $rootScope.$broadcast('basket');
        var loginPopup = {
          template: '<input type="text" placeholder="Username or Email"  ng-model="data.username"><br/>'
                    +'<input type="password" placeholder="Password"  ng-model="data.password"><br/>'
                    +'<div style="color:red;" ng-bind-html="validationMsg"></div>',
          title: ' Login',
          subTitle: '',
          scope: $scope,
          buttons: [
            { text: 'Cancel' },
            {
              text: '<b>Login</b>',
              type: 'button-positive',
              onTap: function(e) {
                if ($scope.data.username && $scope.data.password ) {
                $scope.loginUser(e);
                } else {
                    $scope.validationMsg = "Please provide username or password.";
                    e.preventDefault();
                }
              }
            }
          ]
        };
    function processLogin(){
      $scope.data = {};

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show(loginPopup);



    }
    $scope.actionLogin = function(scope) {
      $scope.childScope= scope;
      $scope.validationMsg = "";
      if($scope.isLogedIn){
          $scope.isLogedIn = false;
          $window.localStorage['user']='';
          $scope.basketProducts = [];
          CartData.emptyBasket();//---current basket
          BasketData.emptyBasket();//---stored basket
          $state.go('app.home');
          //$window.location.reload(true);
      }else{
         processLogin();
      }
     };

     $scope.loginUser = function(e) {
             $rootScope.$broadcast('loading:show');
             console.log($scope.data);
             UserData.loginUser($scope.data).then(function(response) {
               if(response.errors !=null && response.errors.length>0){
                  $scope.validationMsg =response.errors[0].message;
                 $rootScope.$broadcast('loading:hide');
                var myPopup = $ionicPopup.show(loginPopup);
              }else{
                $scope.user = response;
                $scope.isLogedIn = true;
               $window.localStorage['user'] =JSON.stringify($scope.user);
                console.log($scope.user);
                $rootScope.$broadcast('loading:hide');
                  $scope.validationMsg = "";
                  $state.go($state.current, {}, {reload: true});
                  if(  $scope.childScope!=null){
                                $scope.childScope.populateAddressLoginUser();
                  }
                //$window.location.reload(true);
              }
                //$state.go($state.current, {}, {reload: true});
                 return;
             }, function() {

                 $scope.validationMsg = "Invalid username or email.";

                 $rootScope.$broadcast('loading:hide');
                var myPopup = $ionicPopup.show(loginPopup);
             });
     };

}
