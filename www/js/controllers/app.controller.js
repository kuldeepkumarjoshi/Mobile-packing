
    // Application Controller
var AppCtrl = function($scope,$rootScope,$window,$ionicHistory,$ionicPopup,$state, MenuData, BasketData,UserData) {

        $scope.items = MenuData.items;
        $scope.isLogedIn = false;
        if($window.localStorage['user']){
            $scope.isLogedIn = true;
        }
        var cartItems = BasketData.getBasket();
        $scope.cartItems = cartItems.length;

        var email_regex = RegExp(["[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*",
            "+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]",
            "(?:[a-z0-9-]*[a-z0-9])?"
        ].join(''));

        $scope.$on('basket', function(event, args) {
            cartItems = BasketData.getBasket();
            $scope.cartItems = cartItems.length;
        });

    function processLogin(){
      $scope.data = {};

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '<input type="text" placeholder="Please enter your email" ng-change="changeEmail()" ng-model="data.email"><br/><div style="color:red;">{{validationMsg}}</div>',
        title: ' Login',
        subTitle: '',
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function(e) {
              if ($scope.data.email) {
              $scope.evaluateEmail(e);
              } else {
                  e.preventDefault();
              }
            }
          }
        ]
      });

      myPopup.then(function(res) {
        if(!$scope.emailVerified){
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

         $scope.changeEmail = function(){
            $scope.emailVerified =true;
           $scope.validationMsg ='';
         };
         $scope.evaluateEmail = function(e) {
             var valid = email_regex.test($scope.data.email);

             if (valid) {
                 $rootScope.$broadcast('loading:show');
                 UserData.check($scope.data.email).then(function(user) {
                     $scope.emailVerified = true;
                     $scope.user = user;
                     $scope.isLogedIn = true;
                    $window.localStorage['user'] =JSON.stringify($scope.user);
                     console.log(user);
                     $rootScope.$broadcast('loading:hide');
                    $window.location.reload(true);
                    //$state.go($state.current, {}, {reload: true});
                     return;
                 }, function() {
                     $scope.emailVerified = false;
                     $scope.validationMsg = "Account does not exists with this email.";

                     $rootScope.$broadcast('loading:hide');
                     e.preventDefault();
                 });
             } else {
                 $scope.emailVerified = false;
                 $scope.validationMsg = "Please provide correct email address.";
                 $scope.user = null;
                e.preventDefault();
             }
             e.preventDefault();
         };

}
