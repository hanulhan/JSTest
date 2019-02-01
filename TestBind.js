var SmartCom = SmartCom || {};

SmartCom.TvPhilipsManager = {
  name: 'SmartCom.TvPhilipsManager',
  Events: {},

  Logout: function (szText) {
    console.log(szText);
  },

  Init: function () {
    var myBtn = document.getElementById('myButton');
    var self= this;

    //add event listener
    
    myBtn.addEventListener('click', this.Events.onButtonPressed.bind(this));

  },

  Tune: function () {
    var self = this;
    wixp.api.alarm("Request");
  },


};


SmartCom.TvPhilipsManager.Events.onButtonPressed =  function () {
    console.log("Button pressed");
    this.Tune();
    wixp.api.alarm("Request");
};


wixp = {
  name: 'wixp',
  svc: "WIXP",
  svcVer: "1.0",
  cookie: "0",
  myInterval: null,

  // Following are the command types possible in WIXP
  CmdType: {
    Request: "Request",
    Response: "Response",
    Change: "Change"
  },
  Function: {
    // Following are the functions possible in WIXP
    FUN_AMBILIGHT: "AmbilightControl",
    FUN_THREED: "PictureControl",
    FUN_CHANNELLIST: "ChannelList",
    FUN_MYCHOICE: "MyChoice",
    FUN_SUBTITLES: "Subtitles",
    FUN_EPG: "EPG",
    FUN_AUDIOLANGAUGE: "AudioLanguage",
    FUN_CHANNELSELECTION: "ChannelSelection",
    FUN_TELETEXT: "Teletext",
    FUN_VOLUME: "AudioControl",
    FUN_INTERNAL: "InternalCommands",
    FUN_SOURCE: "Source",
    FUN_HOME_LIST: "HomeList",
    FUN_PICTURE_LIST: "PictureList",
    FUN_PICTURE: "PictureControl",
    FUN_CLOCK: "ClockControl",
    FUN_APPLICATION: "ApplicationControl",
    FUN_POWER: "PowerState",
    FUN_PBS: "ProfessionalSettingsControl",
    FUN_INPUTCONTROL: "UserInputControl",
    FUN_CONTENT_SECURITY: "ContentSecurityControl",
    FUN_UPGRADE_CONTROL: "UpgradeControl"
  },


  api: {

    alarm: function (cmdType) {
      console.log("wixp.alarm()");
      var self = this;

      window.setTimeout(function () {
        var x = this;
        var myRequest = {};
        myRequest = {
          "Svc": wixp.svc,
          "SvcVer": wixp.svcVer,
          "Cookie": 1,
          "CmdType": cmdType,
          "Fun": wixp.Function.FUN_INTERNAL
        };

        if (myRequest.CmdType == "Request") {
          clearInterval(this.myInterval);
          myInterval = window.setInterval(function () {
            this.sendCommand(myRequest);
          }.bind(x), 2000);

        } else {
          this.sendCommand(myRequest);
        }

      }.bind(this), 1000);


    },

    sendCommand: function (request) {
      var z = this;
      console.log("SendRequest(" + request.Fun + ")");
    }

  }
};


