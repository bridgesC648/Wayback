// utils.js
// Christopher Bridges, Kevin Le, Nicholas Worrell

import { vibration } from "haptics";    // Kevin Le
import * as fs from "fs"; // CMB
import * as messaging from "messaging"; // NW

// NW
export function editString(string) { 
    var start = string.indexOf(':')
    var res = string.substring(start + 3, string.length - 4);
    var length = 20;                                           // max number of characters
    var trim = res.substring(0, length);
    return trim;
  }

// CMB
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve,ms));
}

// KA
export function refreshList(tileList, state, nav){
    // Code to refresh the tile list so it matches the waypoints : Keaton Archibald
    for (var i = 1; i <= 11; i++){
      //Repopulates the list's labels and if buttons should be shown.
      if (state.getAtIndex(i-1) != undefined && tileList[i] != undefined){
        tileList[i].getElementById("text").text = state.getAtIndex(i-1).getName();
        tileList[i].getElementById("btnDelete").style.display = "inline";
      } else if (tileList[i] != undefined){
        tileList[i].getElementById("text").text = "";
        tileList[i].getElementById("btnDelete").style.display = "none";
      } 
      try {
        tileList[i].getElementById("btnCancelNavigation").style.display = "none";
      } catch (err) { }
    }
      
      // Only shows the cancel navigation button if the app is navigating on the waypoint that is being navigated to
    if (!nav.isNav()) {
        try {
            if(state.getCurrent().getName() != ""){
                tileList[state.getCurrentIndex() + 1].getElementById("btnDelete").style.display = "inline";
                console.log("no error")
            }
        } catch(err) {
          tileList[state.getCurrentIndex() + 1].getElementById("btnDelete").style.display = "none";
          console.log(err);
        }
        tileList[state.getCurrentIndex() + 1].getElementById("btnCancelNavigation").style.display = "none"; 
      } else {
        tileList[state.getCurrentIndex() + 1].getElementById("btnDelete").style.display = "none";
        tileList[state.getCurrentIndex() + 1].getElementById("btnCancelNavigation").style.display = "inline";
    }
}

// NW
export function sendMessage(state) {
    let blank = "waypoint not saved yet";
    let data = {
      Waypoint1 : blank,
      Waypoint2 : blank,
      Waypoint3 : blank,
      Waypoint4 : blank,
      Waypoint5 : blank,
      Waypoint6 : blank,
      Waypoint7 : blank,
      Waypoint8 : blank,
      Waypoint9 : blank,
      Waypoint10 : blank
    }
    let counter = 0;
    for (let property in data) {
        if (typeof state.waypoints[counter] != "undefined") {
            data[property] = fs.readFileSync(state.waypoints[counter].getFilename(), "cbor").name;
        }  
        counter++;
    } 
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        messaging.peerSocket.send(data);
    }
}

//sends a vibration and logs the vibration type
//does not perform if haptics setting is disabled  KL
export function vibrate(p, hapticSetting) {
    if (hapticSetting) {
      vibration.start(p);
      console.log("Vibration Pattern: " + p);
    } else
      console.log("Prevented Vibration: " + p);
  }