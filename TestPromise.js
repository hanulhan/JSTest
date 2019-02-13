var promiseCount = 0;

var doButton = function(){
  console.log("doButton");
};

var onButtonClick = function(){
  console.log("onButtonClick");

  doButton();
};

function testPromise(callback) {
  var id = "Hallo";
  var self = this;

  new Promise(function (resolve) {
      self.doButton = function () {
        console.log("First Promise Event");
        resolve();
      };

      console.log("In first promise");
  }, function(){
    console.log("first promise error");
    callback.onFailure("error");
  })

  .then(function(){
    console.log("first promise end");

    return new Promise(function (resolve) {
      self.doButton = function () {
        console.log("second Promise Event");
        resolve();
      };

      console.log("In second promise");
    });
  }, function(){
    console.log("second promise error");
    callback.onFailure("error");
  })

  .then(function(){
    console.log("second promise end");

    return new Promise(function (resolve) {
      self.doButton = function () {
        console.log("third Promise Event");
        callback.onSuccess("success");
      };

      console.log("In third promise");
    });
  }, function(){
    console.log("third promise error");
    callback.onFailure("error");
  });
}

function Init() {

  var self = this;

  var myBtn1 = document.getElementById('myButton1');
  myBtn1.addEventListener('click', onButtonClick);

  var param = {
    "id": 7,

    "onSuccess": function (id) {
      console.log("received onSuccess");
    },
    "onFailure": function (id) {
      console.log("received onFailure");
    }
  };

  testPromise(param);
  console.log("Init() Finished");
}
