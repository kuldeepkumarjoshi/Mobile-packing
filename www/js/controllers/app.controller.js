
    // Application Controller
var AppCtrl = function($scope,$rootScope,$window,$ionicHistory,$ionicPopup,$state, MenuData, BasketData,UserData) {

        $scope.items = MenuData.items;
        $scope.isLogedIn = false;
        if($window.localStorage['user']){
            $scope.isLogedIn = true;
        }
        var cartItems = BasketData.getBasket();
        $scope.cartItems = cartItems.length;


        $scope.$on('basket', function(event, args) {
            cartItems = BasketData.getBasket();
            $scope.cartItems = cartItems.length;
        });

    function processLogin(){
      $scope.data = {};

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '<input type="text" placeholder="Username"  ng-model="data.username"><br/>'
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
                  e.preventDefault();
              }
            }
          }
        ]
      });

      myPopup.then(function(res) {
        if(!$scope.isLogedIn){
          myPopup.show();
        }
        console.log('Tapped!', res);
      });

    }
        $scope.actionLogin = function() {
          if($scope.isLogedIn){
              $scope.isLogedIn = false;
              $window.localStorage['user']='';
                $state.go('app.home');
                $window.location.reload(true);
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
                     e.preventDefault();
                  }else{
                    $scope.user = response;
                    $scope.isLogedIn = true;
                   $window.localStorage['user'] =JSON.stringify($scope.user);
                    console.log($scope.user);
                    $rootScope.$broadcast('loading:hide');
                    //$window.location.reload(true);
                  }
                    //$state.go($state.current, {}, {reload: true});
                     return;
                 }, function() {

                     $scope.validationMsg = "Account does not exists with this email.";

                     $rootScope.$broadcast('loading:hide');
                     e.preventDefault();
                 });
             e.preventDefault();
         };

}
