import * as messaging from "messaging";
import { points } from "../common/waypoints.js";
import { settingsStorage } from "settings";


messaging.peerSocket.addEventListener("message", (evt) => {
  let obj = evt.data;
  settingsStorage.setItem("Waypoint1", obj.Waypoint1);
  settingsStorage.setItem("Waypoint2", obj.Waypoint2);
  settingsStorage.setItem("Waypoint3", obj.Waypoint3);
  settingsStorage.setItem("Waypoint4", obj.Waypoint4);
  settingsStorage.setItem("Waypoint5", obj.Waypoint5);
  settingsStorage.setItem("Waypoint6", obj.Waypoint6);
  settingsStorage.setItem("Waypoint7", obj.Waypoint7);
  settingsStorage.setItem("Waypoint8", obj.Waypoint8);
  settingsStorage.setItem("Waypoint9", obj.Waypoint9);
  settingsStorage.setItem("Waypoint10", obj.Waypoint10);
  
  settingsStorage.setItem("newName1", "");
  settingsStorage.setItem("newName2", "");
  settingsStorage.setItem("newName3", "");
  settingsStorage.setItem("newName4", "");
  settingsStorage.setItem("newName5", "");
  settingsStorage.setItem("newName6", "");
  settingsStorage.setItem("newName7", "");
  settingsStorage.setItem("newName8", "");
  settingsStorage.setItem("newName9", "");
  settingsStorage.setItem("newName10", "");
  
  console.log(JSON.stringify(evt.data));
});

// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("Companion Socket Open");
  restoreSettings();
};

// Message socket closes
messaging.peerSocket.onclose = () => {
  console.log("Companion Socket Closed");
};

// A user changes settings
settingsStorage.onchange = evt => {
  let data = {
    key: evt.key,
    newValue: evt.newValue
  };
  sendVal(data);
};

// Restore any previously saved settings and send to the device
function restoreSettings() {
  for (let index = 0; index < settingsStorage.length; index++) {
    let key = settingsStorage.key(index);
    if (key) {
      let data = {
        key: key,
        newValue: settingsStorage.getItem(key)
      };
      sendVal(data);
    }
  }
}

// Send data to device using Messaging API
function sendVal(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  }
}