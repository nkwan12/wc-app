angular.module('wc.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, AuthenticationService, Global, $state, $stateParams) {
  
  $ionicModal.fromTemplateUrl('templates/login.html', function(modal) {
    $scope.loginModal = modal;
    },
    {
      scope: $scope,
      animation: "slide-in-up",
      focusFirstInput: true
    }
  );
  
  $ionicModal.fromTemplateUrl('templates/password_reset.html', function(modal) {
    $scope.forgotPasswordModal = modal;
    },
    {
      scope: $scope,
      animation: "slide-in-up",
      focusFirstInput: true
    }
  );

  $scope.showForgotPassword = function() {
    $scope.forgotPasswordModal.show();
  };

  $scope.doLogin = function() {
    $scope.loginModal.show();
  };

  $scope.pad = function(t) {
    return t >= 10? t : "0" + t;
  };

/*  $scope.$on("$destroy", function() {
    $scope.loginModal.remove();
  });
*/
  $scope.logout = function() {
    AuthenticationService.logout();
  };

  $scope.$on("event:auth-logout-complete", function() {
    Global.userSession.loggedIn = false;
    Global.userSession.userId = null;
  });

  $scope.loginOutFunc = function() {
    if (Global.userSession.loggedIn) {
      $scope.logout();
    } else {
      $scope.doLogin();
    }
  };

  $scope.loginOutText = function() {
    if (Global.userSession.loggedIn) {
      return "Logout";
    } else {
      return "Login";
    }
  };

  $scope.$on("event:auth-token-valid", function() {
    $state.transitionTo($state.current, $stateParams, {
      reload: true,
      inherit: false,
      notify: true
    });
  });



})

.controller("HomeCtrl", function($scope, $ionicModal, Global, $state, $stateParams) {
  $scope.buttons = [];
  $scope.setButtons = function() {
    if (Global.userSession.loggedIn) {
      $scope.buttons = [{name: "Workouts", link: "#/app/workouts", click: ""}, {name: "New Workout", link: "#/app/workout/new", click: ""}];
    } else {
      $scope.buttons = [{name: "Sign In", link: "", click: "doLogin()"}, {name: "Sign Up", link: "", click: "signUp()"}, {name: "New Workout", link: "#/app/workout/new", click: ""}];
    };
  };
  $scope.setButtons();
      
  $ionicModal.fromTemplateUrl('templates/new_user.html', function(modal) {
    $scope.signUpModal = modal;
    },
    {
      scope: $scope,
      animation: "slide-in-up",
      focusFirstInput: true
    }
  );

  $scope.signUp = function() {
    $scope.signUpModal.show();
  };

  $scope.$on("event:auth-loginConfirmed", function() {
    $scope.setButtons();
  });

  $scope.$on("event:auth-logout-complete", function() {
    $scope.setButtons();
  });

/*  $scope.$on("$destroy", function() {
    $scope.signUpModal.remove();
  });
*/
})

.controller("LoginCtrl", function($scope, $state, AuthenticationService, $stateParams, $ionicLoading) {
  $scope.msg = "";
  
  $scope.user = {email: null, password: null};

  $scope.closeLogin = function() {
    $scope.user.email = null;
    $scope.user.password = null;
    $scope.loginModal.hide();
  };

  $scope.login = function() {
    $ionicLoading.show({templateUrl: "templates/loading.html"});
    AuthenticationService.login($scope.user);
  };

  $scope.$on("event:auth-loginRequired", function(e, rejection) {
    $scope.loginModal.show();
  });

  $scope.$on("event:auth-loginConfirmed", function() {
    $scope.user.email = null;
    $scope.user.password = null;
    $scope.loginModal.hide();
    $state.transitionTo($state.current, $stateParams, {
      reload: true,
      inherit: false,
      notify: true
    });
    $ionicLoading.hide();
  });

  $scope.$on("event:auth-login-complete", function() {
    $state.go("app.workouts", {}, {reload: true, inherit: false});
  });

  $scope.$on("event:auth-login-failed", function() {
    $ionicLoading.hide();
    $scope.msg = "Wrong email or password, please try again...";
  });

  $scope.forgotPassword = function() {
    $scope.closeLogin();
    $scope.showForgotPassword();
  };
})

.controller("SignUpCtrl", function($scope, AuthenticationService, $ionicLoading) {
  $scope.newUser = {email: null, password: null, passwordConfirmation: null};
  $scope.msg = "";
  var wrongPasswordsMsg = "The passwords you entered do not match, please try again..."
  var emailInUseMsg = "An account with that email address already exists..."
  var invalidEmailMsg = "Please enter a valid email address..."
  $scope.submit = function() {
    $scope.msg = "";
    if ($scope.newUser.password != $scope.newUser.passwordConfirmation) {
      $scope.msg = wrongPasswordsMsg;
      $scope.newUser.password = null;
      $scope.newUser.passwordConfirmation = null;
    } else if (!(/([^@]+)@([^\.]+).(.+)$/.test($scope.newUser.email))) {
      $scope.msg = invalidEmailMsg;
    } else {
      $ionicLoading.show({templateUrl: "templates/loading.html"});
      AuthenticationService.newUser($scope.newUser);
    };
  };

  $scope.$on("event:auth-email-in-use", function() {
    $ionicLoading.hide();
    $scope.newUser.email = null;
    $scope.newUser.password = null;
    $scope.newUser.passwordConfirmation = null;
    $scope.msg = emailInUseMsg;
  });

  $scope.$on("event:auth-new-user-success", function() {
    $ionicLoading.hide();
    $scope.signUpModal.hide();
    $scope.newUser.email = null;
    $scope.newUser.password = null;
    $scope.newUser.passwordConfirmation = null;
    $scope.setButtons();
  });

  $scope.closeModal = function() {
    $ionicLoading.hide();
    $scope.signUpModal.hide();
    $scope.newUser.email = null;
    $scope.newUser.password = null;
    $scope.newUser.passwordConfirmation = null;
  };
})
.controller("PasswordResetCtrl", function($scope, AuthenticationService, $ionicPopup, $ionicLoading) {
  $scope.user = {email: null}
  var emailNotFoundMsg = "No account with that email address was found.";
  var successMsg = "Password email successfully sent.";
  var failureMsg = "An error has occurred. Please try again."
  $scope.msg = "";
  var passwordResetSuccess = function() {
    var successPopup = $ionicPopup.alert({
      title: "Password Reset Email Sent",
      template: "Please be patient, the email may take a few minutes to appear in your inbox"
    });
    successPopup.then(function() {
    })
  };
  $scope.$on("event:auth-password-reset-not-found", function() {
    $scope.msg = emailNotFoundMsg;
    $ionicLoading.hide();
    $scope.user.email = null;
  });
  $scope.$on("event:auth-password-reset-success", function() {
    $scope.successClass = "hidden";
    $scope.user.email = null;
    $scope.forgotPasswordModal.hide();
    passwordResetSuccess();
  });
  $scope.$on("event:auth-password-reset-failure", function() {
    $scope.msg = failureMsg;
    $ionicLoading.hide();
    $scope.user.email = null;
  });
  $scope.closeModal = function() {
    $scope.forgotPasswordModal.hide();
    $scope.user.email = null;
    $ionicLoading.hide();
  };
  $scope.resetPassword = function() {
    $ionicLoading.show({templateUrl: "templates/loading.html"});
    AuthenticationService.resetPassword($scope.user);
  };
})
.controller('WorkoutsCtrl', function($scope, Workout, Global) {
  $scope.workouts = []
  $scope.workoutsMsgClass = "hidden";
  $scope.msg = "No workouts yet! (You must sign in to access your saved workouts)";
  setMsg = function() {
    if ($scope.workouts.length == 0) {
      $scope.workoutsMsgClass = "";
    } else {
      $scope.workoutsMsgClass = "hidden";
    };
  };
  Workout.getAll().then(function(data) {
    $scope.workouts = data;
    setMsg();
  }, function(data) {
    console.log("Error retrieving workouts");
  });
  if (!Global.userSession.loggedIn) {
    setMsg();
  };
})

.controller('WorkoutCtrl', function($scope, $stateParams, Workout) {
  $scope.exerciseClass = "exercise-list";
  $scope.restClass = "rest-list";
  Workout.get($stateParams.workoutId).then(function(data) {
    $scope.workout = data.workout;
    $scope.workout.exercises = data.exercises;
  });
  $scope.Math = window.Math;
})

.controller("NewWorkoutCtrl", function($scope, $ionicModal, $state, Workout, Global) {
  $scope.exerciseClass = "exercise-list";
  $scope.restClass = "rest-list";
  $scope.title = "New Workout";
  $scope.showDelete = false;
  $scope.showReorder = false;
  $ionicModal.fromTemplateUrl('templates/workouts/exercise.html', function(modal) {
    $scope.exerciseModal = modal;
    },
    {
      scope: $scope,
      animation: "slide-in-up",
    }
  );
  var emptyMsg = "No exercises in this workout yet!";
  var noNameMsg = "You must give this workout a name!";
  var noExercisesMsg = "You must add at least one exercise before continuing!";
  $scope.msg = emptyMsg;
  $scope.newExercise = {
    exercise: {name: "", cat: "Exercise", dur: { minutes: 0, seconds: 0 }},
    index: null,
    action: "create",
    readOnly: false,
    title: "New Exercise"
  };
  $scope.workout = {name: "", private: null, rounds: 1};
  $scope.exercises = [];
  $scope.createExercise = function() {
    $scope.newExercise.action = "create";
    $scope.newExercise.title = "New Exercise";
    $scope.exerciseModal.show();
  };

  $scope.rmExercise = function(index) {
    $scope.exercises.splice(index, 1);
  };

  $scope.editExercise = function(index) {
    $scope.newExercise.action = "edit";
    $scope.newExercise.title = "Edit Exercise";
    $scope.newExercise.exercise = $scope.exercises[index];
    if ($scope.newExercise.exercise.cat == "Rest") {
      $scope.newExercise.readOnly = true;
    };
    $scope.newExercise.index = index;
    $scope.exerciseModal.show();
  };

  $scope.mvExercise = function(fromI, toI) {
    var temp = $scope.exercises[fromI-1];
    $scope.exercises.splice(fromI-1, 1);
    $scope.exercises.splice(toI-1, 0, temp);
  };

  $scope.submit = function() {
    if ($scope.workout.name == "") {
      $scope.msg = noNameMsg;
    } else if ($scope.exercises[0] == null) {
      $scope.msg = noExercisesMsg;
    } else {
      Workout.create($scope.workout, $scope.exercises).then(function(data) {
        Global.userSession.workoutId = data;
        $state.go("app.workout", {workoutId: data}, {reload: true, inherit: false});
      });
    };
  };

  $scope.$on("$destroy", function() {
    $scope.exerciseModal.remove();
  });

  $scope.checkMsg = function() {
    if ($scope.exercises.length == 0) {
      $scope.msg = emptyMsg;
    } else {
      $scope.msg = "";
    };
  };
})

.controller("EditWorkoutCtrl", function($scope, $state, $ionicModal, $stateParams, Workout, Global) {
  $scope.exerciseClass = "exercise-list";
  $scope.restClass = "rest-list";
  $scope.title = "Edit Workout";
  $scope.showDelete = false;
  $scope.showReorder = false;
  $scope.workout = null;
  $scope.exercises = [];
  var emptyMsg = "No exercises in this workout yet!"
  $scope.msg = "";
  $ionicModal.fromTemplateUrl('templates/workouts/exercise.html', function(modal) {
    $scope.exerciseModal = modal;
    },
    {
      scope: $scope,
      animation: "slide-in-up",
    }
  );
  $scope.newExercise = {
    exercise: {name: "", cat: "Exercise", dur: { minutes: 0, seconds: 0 }},
    index: null,
    action: "create",
    readOnly: false,
    title: "New Exercise"
  };
  $scope.workout = {};
  $scope.exercises = [];
  $scope.createExercise = function() {
    $scope.newExercise.action = "create";
    $scope.newExercise.title = "New Exercise";
    $scope.exerciseModal.show();
  };

  $scope.rmExercise = function(index) {
    $scope.exercises.splice(index, 1);
    $scope.checkMsg();
  };

  $scope.editExercise = function(index) {
    $scope.newExercise.action = "edit";
    $scope.newExercise.title = "Edit Exercise";
    $scope.newExercise.exercise = $scope.exercises[index];
    if ($scope.newExercise.exercise.cat == "Rest") {
      $scope.newExercise.readOnly = true;
    };
    $scope.newExercise.index = index;
    $scope.exerciseModal.show();
  };

  $scope.mvExercise = function(fromI, toI) {
    var temp = $scope.exercises[fromI-1];
    $scope.exercises.splice(fromI-1, 1);
    $scope.exercises.splice(toI-1, 0, temp);
  };
  $scope.checkMsg = function() {
    if ($scope.exercises.length == 0) {
      $scope.msg = emptyMsg;
    } else {
      $scope.msg = "";
    };
  };
  Workout.get($stateParams.workoutId).then(function(data, status, headers, config) {
    $scope.workout = data.workout;
    $scope.exercises = data.exercises;
    for (i = 0; i < $scope.exercises.length; i++) {
      var temp = parseInt($scope.exercises[i].dur);
      $scope.exercises[i].dur = {
        minutes: Math.floor(temp/60),
        seconds: (temp%60)
      }
    }
    $scope.checkMsg();
  });
  $scope.submit = function() {
    if ($scope.workout.name == "") {
      $scope.msg = noNameMsg;
    } else if ($scope.exercises[0] == null) {
      $scope.msg = noExercisesMsg;
    } else {
      Workout.edit($scope.workout, $scope.exercises, $stateParams.workoutId).then(function(data) {
        Global.userSession.workoutId = data;
        $state.go("app.workout", {workoutId: data}, {reload: true, inherit: false});
      });
    };
  };
  $scope.$on("$destroy", function() {
    $scope.exerciseModal.remove();
  });
})

.controller("NewExerciseCtrl", function($scope, $state) {
  $scope.exerciseMsg = "";
  $scope.closeModal = function() {
    $scope.exerciseModal.hide();
    $scope.newExercise.exercise = {name: "", cat: "Exercise", dur: { minutes: 0, seconds: 0 }};
    $scope.newExercise.readOnly = false;
  };
  $scope.addEditExercise = function() {
    if (($scope.newExercise.exercise.dur.minutes == 0) && ($scope.newExercise.exercise.dur.seconds == 0)) {
      $scope.exerciseMsg = "The length of the exercise cannot be zero!";
    } else if ($scope.newExercise.exercise.name == "") {
      $scope.exerciseMsg = "Please give this exercise a name!";
    } else {
      $scope.exerciseMsg = "";
      if ($scope.newExercise.action == "create") { 
        $scope.exercises.push($scope.newExercise.exercise);
      } else {
        $scope.exercises[$scope.newExercise.index] = $scope.newExercise.exercise;
      };
      $scope.checkMsg();
      $scope.exerciseModal.hide();
      $scope.newExercise.exercise = {name: "", cat: "Exercise", dur: { minutes: 0, seconds: 0 }};
      $scope.newExercise.readOnly = false;
    };
  };
  $scope.changeCat = function() {
    if ($scope.newExercise.exercise.cat == "Exercise") {
      $scope.newExercise.exercise.name = "";
      $scope.newExercise.readOnly = false;
    } else {
      $scope.newExercise.exercise.name = "Rest";
      $scope.newExercise.readOnly = true;
    }
  };
})

.controller("PlayWorkoutCtrl", function($scope, $stateParams, $interval, Workout, $cordovaVibration, $insomnia) {
  $scope.workout = null;
  $scope.currentExercise = null;
  $scope.currentRound = 1;
  var exerciseIndex = 0;
  var timer = null;
  $scope.startPause = "ion-play";
  $scope.bgColor = "blue";

  $scope.$on("$stateChangeStart", function() {
    $scope.pauseTimer();
  });

  $scope.workout = Workout.get($stateParams.workoutId).then(function(data, status, headers, config) {
    $scope.workout = data.workout;
    console.log("Rounds: " + data.workout.rounds);
    $scope.workout.exercises = data.exercises;
    $scope.Math = window.Math;
    $scope.totalMilSecs = $scope.workout.exercises[0].dur * 1000;
    $scope.currentExercise = $scope.workout.exercises[0];
    $scope.spFunc = $scope.startTimer;
    setPrevNext();
  });
  
  var setPrevNext = function() {
    if ($scope.workout.exercises[exerciseIndex - 1]) {
      $scope.prevExercise = $scope.workout.exercises[exerciseIndex - 1].name;
    } else if ($scope.currentRound > 1) {
      $scope.prevExercise = $scope.workout.exercises[$scope.workout.exercises.length - 1].name;
    } else {
      $scope.prevExercise = "Start";
    }
    if ($scope.workout.exercises[exerciseIndex + 1]) {
      $scope.nextExercise = $scope.workout.exercises[exerciseIndex + 1].name;
    } else if ($scope.currentRound < $scope.workout.rounds) {
      $scope.nextExercise = $scope.workout.exercises[0].name;
    } else {
      $scope.nextExercise = "End";
    }
  };

  $scope.startTimer = function() {
    timer = $interval(decrement, 1000);
    $insomnia.keepAwake(); //disable for computer testing
    if ($scope.currentExercise.cat == "Exercise") {
      $scope.bgColor = "red";
    } else {
      $scope.bgColor = "green";
    }
    $scope.startPause = "ion-pause"
    $scope.spFunc = $scope.pauseTimer;
  };

  $scope.pauseTimer = function() {
    $interval.cancel(timer);
    $insomnia.allowSleepAgain(); //disable for computer testing
    timer = null;
    $scope.bgColor = "blue";
    $scope.startPause = "ion-play";
    $scope.spFunc = $scope.startTimer;
  };

  $scope.skipForward = function() {
    $scope.pauseTimer();
    nextExercise();
  };

  $scope.skipBack = function() {
    $scope.pauseTimer();
    prevExercise();
  };

  var decrement = function() {
    $scope.totalMilSecs -= 1000;
    if ($scope.totalMilSecs <= 0) {
      $cordovaVibration.vibrate([100,100,100,100,100]); //disable this line for testing on computer
      nextExercise();
    };
  };

  var nextExercise = function() {
    if ($scope.workout.exercises[++exerciseIndex]) {
      $scope.currentExercise = $scope.workout.exercises[exerciseIndex];
      $scope.totalMilSecs = $scope.currentExercise.dur * 1000;
    } else if ($scope.currentRound < $scope.workout.rounds) {
      console.log("End of round, going to next round!");
      exerciseIndex = 0;
      ++$scope.currentRound;
      $scope.currentExercise = $scope.workout.exercises[exerciseIndex];
      $scope.totalMilSecs = $scope.currentExercise.dur * 1000;
    } else {
      --exerciseIndex;
      $interval.cancel(timer);
      endWorkout();
    }
    if (timer) {
      if ($scope.currentExercise.cat == "Exercise") {
        $scope.bgColor = "red";
      } else {
        $scope.bgColor = "green";
      }
    }
    setPrevNext();
  };

  var prevExercise = function() {
    if ($scope.workout.exercises[exerciseIndex - 1]) {
      exerciseIndex--;
      $scope.currentExercise = $scope.workout.exercises[exerciseIndex];
      $scope.totalMilSecs = $scope.currentExercise.dur * 1000;
    } else if ($scope.currentRound > 1) {
      exerciseIndex = $scope.workout.exercises.length - 1;
      --$scope.currentRound;
      $scope.currentExercise = $scope.workout.exercises[exerciseIndex];
      $scope.totalMilSecs = $scope.currentExercise.dur * 1000;
    } else {
      $scope.totalMilSecs = $scope.currentExercise.dur * 1000;
    }
    setPrevNext();
  };
  
  var endWorkout = function() {
  };
  
});
