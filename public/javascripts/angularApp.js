var app = angular.module('todolijst', ['ui.router'])

app.config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider,$urlRouterProvider) {
    
    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: '/home.html',
        controller: 'MainCtrl',
        resolve: {
          postPromise: ['todos', function(todos){
            return todos.getAll();
    }]
  }
      })
      .state('todos', {
  url: '/todos/{id}',
  templateUrl: '/todoDetails.html',
  controller: 'TodoDetailCtrl',
  resolve: {
    todo: ['$stateParams', 'todos', function($stateParams, todos) {
      return todos.get($stateParams.id);
    }]
  }
})
.state('login', {
  url: '/login',
  templateUrl: '/login.html',
  controller: 'AuthCtrl',
  onEnter: ['$state', 'auth', function($state, auth){
    if(auth.isLoggedIn()){
      $state.go('home');
    }
  }]
})
.state('register', {
  url: '/register',
  templateUrl: '/register.html',
  controller: 'AuthCtrl',
  onEnter: ['$state', 'auth', function($state, auth){
    if(auth.isLoggedIn()){
      $state.go('home');
    }
  }]
});

      $urlRouterProvider.otherwise('home');
  }]);


app.factory('todos', ['$http','auth',function($http,auth){
  var o =  {
    todos: []
  };
  
      o.getAll = function() {
      return $http.get('/todos').success(function(data){
        angular.copy(data,o.todos);
      });
    };
    o.create = function(todo) {
      return $http.post('/todos', todo, {
        headers: {Authorization: 'Bearer '+auth.getToken()}
      }).success(function(data){
        o.todos.push(data);
      });
    };
    o.delete = function(todo) {
		return $http.delete('/todos/' + todo._id).success(function(data) {
			angular.copy(data, o.todos);
		});
  }
  
  o.update = function(todo){
    console.log("o.update " + todo.name);
    return $http.put('/todos/'+ todo._id, todo, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).then(function(data){
      angular.copy(todo);
    });
  }


o.get = function(id) {
  return $http.get('/todos/' + id).then(function(res){
    return res.data;
  });
};

  return o;
}]);

app.controller('MainCtrl', [
  '$scope',
  'todos',
  'auth',
  function($scope,todos,auth){

    $scope.editing = [];


    $scope.todos = todos.todos;

    $scope.verifyAuthor = function(todo) {
      return todo.author === auth.currentUser();
    }

      $scope.isLoggedIn = auth.isLoggedIn;

    $scope.addTodo = function(){
    if($scope.newTodo === '') { return; }
    todos.create({
      name: $scope.newTodo,
      author: 'payload.username',
      completed: false,
      note:''
    });
    $scope.newTodo = '';
  };

  $scope.remove = function(index){
    var todo = $scope.todos[index]

    console.log(todo);
    todos.delete(todo);


  }

  $scope.cancel = function(index){
            $scope.todos[index] = angular.copy($scope.editing[index]);
            $scope.editing[index] = false;
          }

  $scope.edit = function(index){
            $scope.editing[index] = angular.copy($scope.todos[index]);
          }

  $scope.update = function(index){
    
    var todo = $scope.todos[index];
    console.log("scope.update " + todo.name);
    todos.update(todo);
    $scope.editing[index] = false;
  }
 }]);


  

app.controller('TodoDetailCtrl', ['$scope','todos','todo','auth','$state', function($scope,todos,todo,auth,$state){
$scope.todo = todo;
console.log("$scope.todo " + $scope.todo);

$scope.addNote = function(){
console.log("updateFunc");
            todos.update(todo);
            $state.go('home');
}

}]);



app.factory('auth', ['$http', '$window', function($http, $window){
   var auth = {};

   auth.saveToken = function (token){
  $window.localStorage['todo-lijst-token'] = token;
};

auth.getToken = function (){
  return $window.localStorage['todo-lijst-token'];
}

auth.isLoggedIn = function(){
  var token = auth.getToken();

  if(token){
    var payload = JSON.parse($window.atob(token.split('.')[1]));

    return payload.exp > Date.now() / 1000;
  } else {
    return false;
  }
};

auth.currentUser = function(){
  if(auth.isLoggedIn()){
    var token = auth.getToken();
    var payload = JSON.parse($window.atob(token.split('.')[1]));

    return payload.username;
  }
};
auth.register = function(user){
  return $http.post('/register', user).success(function(data){
    auth.saveToken(data.token);
  });
};
auth.logIn = function(user){
  return $http.post('/login', user).success(function(data){
    auth.saveToken(data.token);
  });
};

auth.logOut = function(){
  $window.localStorage.removeItem('todo-lijst-token');
};
  return auth;
}])


app.controller('AuthCtrl', [
'$scope',
'$state',
'auth',
function($scope, $state, auth){
  $scope.user = {};

  $scope.register = function(){
    auth.register($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };

  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };
}])

app.controller('NavCtrl', [
'$scope',
'auth',
function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}]);

app.directive('customDirective', function ($animate) {
        return {
            link : function ($scope, $element, $attrs) {
                //var isActive = true;
                $element.on('focus', function () {
                  $animate.addClass($element, 'customClick');
                  console.log("onfocus");
                   // isActive = !isActive;
                 /*   console.log(isActive);
                    // Toggle between add class and remove class
                    if (isActive) {
                        $animate.addClass($element, 'customClick');
                    } else {
                        $animate.removeClass($element, 'customClick');
                    }*/
                    //Trigger digest in this case, because this listener function is out of the angular world
                    $scope.$apply();
                });
                  $element.on('blur', function() {
                    $animate.removeClass($element, 'customClick');
                    console.log("onBlur");
                    $scope.$apply();
                  });
            }
        }
    });