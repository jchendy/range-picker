'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.view1',
  'myApp.view2',
  'myApp.version'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/view1'});
}]).
controller( 'AppController', function( $scope ) {

    document.body.onmousedown = function() {
        $scope.utils.mouseDown = 1;
    }
    document.body.onmouseup = function() {
        $scope.utils.mouseDown = 0;
    }

    $scope.utils = {};
    $scope.utils.heroPosition = 4;
    $scope.utils.positions = ["UTG", "MP", "CO", "BTN", "SB", "BB"];
    $scope.utils.cardRanks = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];	

    $scope.utils.range = function(min, max){
      var result = [];
      for (var i = min; i <= max; i++) result.push(i);
      return result;
    };    

    $scope.activeSelector = "bet-value";

    $scope.data = {
    	
    };

    $scope.getName = function (action) {
    	var map = {    		
    		"bet-value": "Bet or Raise (value)",
    		"bet-bluff": "Bet or Raise (bluff)",
    		"call": "Call or check",
    		"fold": "Fold",
    		na: "N/A"
    	}
    	return map[action];
    }

    $scope.generateHands = function(scenario) {
      var hands = {};
      $scope.data.hands = hands;
      for(var i = 0; i < 13; i++) {
        for(var j = 0; j < 13; j++) {
          if (j > i) {
            hands[$scope.utils.cardRanks[i] + $scope.utils.cardRanks[j] + "s"] = {range: "na"};
            hands[$scope.utils.cardRanks[i] + $scope.utils.cardRanks[j] + "o"] = {range: "na"};
          }
        }
        hands[$scope.utils.cardRanks[i] + $scope.utils.cardRanks[i]] = {range: "na"};
      }
    }   

    $scope.generateHands(); 

    $scope.setActiveSelector = function(val) {
      $scope.activeSelector = val;
    }

    $scope.modeButtonClass = function(name) {
      var result = [];
      result.push("btn-" + name);
      if(name == $scope.activeSelector) {
        result.push("active");
      }
      return result;
    }

    $scope.suitClass = function(name) {
      return "board-card-" + name.charAt(1);
    }

    $scope.actionClass = function(line) {
      if(line.charAt(0) == "*") {
        return "street-name";
      }
      return "";
    }

    $scope.potSize = function() {
      var result = 0;
      for(var i = 0; i < 6; i++) {
        if($scope.data.players[i].bet) {
          result += $scope.data.players[i].bet;
        }
      }
      result += $scope.data.pot;
      return result;
    }

    $scope.rangeButtonClass = function(i,j) {
      var name = $scope.getRangeLabel(i,j);
      if (!$scope.inRange(name)) {
        return "btn-inactive";
      }

      return "btn-" + $scope.data.hands[name].range;
    }

    $scope.select = function(i, j) {
      var name = $scope.getRangeLabel(i,j);
      $scope.data.hands[name].range = $scope.activeSelector;
    }

    $scope.selectOver = function(i, j, event) {
      if($scope.utils.mouseDown) {
        $scope.select(i, j);
      }
    }

    $scope.inRange = function(key){
      if(!$scope.data.parent || !$scope.data.lastAction) {
        return true;
      }
      return $scope.data.parent.hands[key].range == $scope.data.lastAction;
    }

    $scope.selectRemainder = function() {
      _.each($scope.data.hands, function(hand, key) {
        if(hand.range == "none" && $scope.inRange(key)) {
          hand.range = $scope.activeSelector;
        }
      });
    }

    $scope.selectBroadways = function() {
      var broadways = ["A", "K", "Q", "J", "T"];
      _.each($scope.data.hands, function(hand, key) {
        if($scope.inRange(key) && broadways.indexOf(key.charAt(0)) != -1 && broadways.indexOf(key.charAt(1)) != -1 ) {
          hand.range = $scope.activeSelector;
        }
      });
    }

    $scope.selectPPs = function() {
      _.each($scope.data.hands, function(hand, key) {
        if($scope.inRange(key) && key.charAt(0) == key.charAt(1)) {
          hand.range = $scope.activeSelector;
        }
      });
    }

    $scope.getRangeLabel = function(i, j) {
    var cardRanks = $scope.utils.cardRanks;
      if (i == j) {
        return cardRanks[i] + cardRanks[j];
      }
      if (i < j) {
        return cardRanks[i] + cardRanks[j] + "s";
      }
      if (i > j) {
        return cardRanks[j] + cardRanks[i] + "o";
      }
    };

    $scope.getVpip = function(stat) {
      return $scope.getStat("call") + $scope.getStat("raise");
    }

    $scope.getStat = function(stat) {
      var sum = 0;
      var total = 0;
      _.each($scope.data.hands, function(hand, name) {

        //don't count hands that aren't in our range
        if (!$scope.inRange(name)) {
          return;
        }

        if(name.endsWith("s")) {
          if(hand.range == stat) {
            sum += 4;
          }
          total += 4;
        } else if (name.endsWith("o")) {
          if(hand.range == stat) {
            sum += 12;
          }
          total += 12;
        } else {
          if(hand.range == stat) {
            sum += 6;
          }
          total += 6;
        }

      });

      return sum / total * 100;
    }

    $scope.getPlayer = function(pos) {
      var offset = 0;
      switch(pos) {
        case "BTN":
          break;
        case "SB":
          offset = 1;
          break;
        case "BB":
          offset = 2;
          break;
        case "UTG":
          offset = 3;
          break;
        case "MP":
          offset = 4;
          break;
        case "CO":
          offset = 5;
          break;
      }
      var index = (offset + $scope.data.buttonPosition) % 6;
      return $scope.data.players[index];
    };


  })

;
