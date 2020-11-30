/*
Sprint #5 - Navigation Feature with Tile List and Deletable Waypoints
Christopher Bridges and Keaton Archibald

Sprint #6 - Navigation Feature + Tile List w/ deletable Waypoints + persistence
  PATCH NOTES
  11/16:  Changed Locations class to State class. Renamed all instances
          appropriately. CB
          Deleted unnecessary code comments CB
          Added some questionably necessary code comments. CB 
  11/17:  State of application now saved to device memory upon any change CB
            - Waypoint saved CB
            - Waypoint deleted CB
            - Current waypoint changed CB
          Upon load, state of application is restored if state information available
  11/22:  Integrating Settings feature from Fitbit Studio -> GitHub
          Updated app to include current Settings functionality
          Renamed MainView -> View, renamed mainView -> view
          Refactoring
            - Moved hide/show SVG elements to View class   
*/
import document from "document";        // Christopher Bridges
import * as messaging from "messaging"; // Nicholas Worrell
import geolocation from "geolocation";  // Christopher Bridges
import Navigator from "./Navigator";    // Christopher Bridges
import State from "./State";            // Christopher Bridges
import View from "./View";              // Christopher Bridges
import * as fs from "fs";               // Christopher Bridges
import { vibration } from "haptics";    // Kevin Le

import {refreshList, editString} from "../common/utils"; // Christopher Bridges

//------------------------------------------------------------------
// FUNCTIONS
//------------------------------------------------------------------

//sends a vibration and logs the vibration type
//does not perform if haptics setting is disabled  KL
function vibrate(p) {
  if (hapticSetting) {
    vibration.start(p);
    console.log("Vibration Pattern: " + p);
  } else
    console.log("Prevented Vibration: " + p);
}

//-------------------------------------------------------------------
// GLOBAL VARIABLES 
//-------------------------------------------------------------------
// State object, holds Waypoints and manipulates them
var state = new State();
// Navigator object, handles navigational features
let nav = new Navigator();
// Contains all of the UI elements. 
let view = new View();
// Contains the tiles of the tile list
var tileList = [11];
var deletionIndex = 0;
var hapticSetting;

//-------------------------------------------------------------------
// BUTTON EVENTS
//-------------------------------------------------------------------
// I am really not sure why some of these can't just be in the View class.
// Gets called when the Save button gets pressed
view.btnSave.onactivate = function(evt) {
  try {
    view.beacon.acquire();
  } catch (err) {
    console.log(err);
  }
  geolocation.getCurrentPosition(
    savePosition,
    locationError,
    {enableHighAccuracy: true, timeout: 60 * 1000});
}

// Gets called when the Return button gets pressed.
view.btnReturn.onactivate = function(evt) {
  view.showTiles();
  refreshList(tileList, state, nav);
}

view.btnConfirmDeletion.onactivate = function(evt) {
  state.delete(deletionIndex);
  view.showTiles();
  refreshList(tileList, state, nav);
  sendMessage();
}

view.btnCancelDeletion.onactivate = function(evt){
  view.showTiles();
  refreshList(tileList, state, nav);
}

view.btnConfirmCancelNavigation.onactivate = function(evt) {
  view.showNav();
  nav.stop();
  view.phi.rotate(0);
  view.lblName.style.opacity = 0;
  view.lblDistance.style.opacity = 0;
}

view.btnCancelCancelNavigation.onactivate = function(evt){
  view.showTiles();
  refreshList(tileList, state, nav);
}

//-------------------------------------------------------------------
// CALLBACK FUNCTIONS
//-------------------------------------------------------------------
function savePosition(position) {
  view.beacon.disable();
  // Log coordinates to console
  if (!state.maxReached()) {
    state.add(position);
  } else {
    // at some point we should replace this with some on-screen indication
    // that max waypoints have been reached.
    console.log("Could not add waypoint: Maximum waypoints reached.");
  }
  sendMessage();
}

// Christopher Bridges
function watchSuccess(position) {
  // Stop the beacon if it is active
  if (view.beacon.acquiring) {
    console.log("Navigation started.");
    view.beacon.disable();
  }
  // Gets called when position changes.
  console.log("Updating navigator.");
  nav.update(position);
  if (nav.arrived()) {
    // announce arrival to log
    console.log("You have arrived!");
    // Stop navigator
    nav.stop();
    // hide distance label
    view.lblDistance.style.display="none";
    // hide the name label.
    view.lblName.style.display="none";
    // alert ring
    vibrate("alert");
    // Change to fireworks.
    document.location.assign("fireworks.view").then(view.backToNav);
    view.phi.rotate(360);
  } else {
    // Update the "arrows"
    view.phi.rotate(360 - nav.getHeading() + nav.getAngle());
    // Update distance label
    view.lblDistance.text = nav.getDistance().toFixed(4) + " m";
    // Show the label if it is hidden.
    if (view.lblDistance.style.display == "none")
      view.lblDistance.style.display = "";
  }
  view.lblName.style.opacity = 1;
  view.lblDistance.style.opacity = 1;
}

function locationError(error) {
  console.log("Error: " + error.code, "Message: " + error.message);
  // Disable beacon, since we aren't trying to acquire anymore.
  view.beacon.disable();
  // Tell navigation to stop because it ain't going to start.
  nav.stop();
}

// Settings socket ------------------------------------------
// Message is received
messaging.peerSocket.onmessage = evt => {
  //console.log(`1 App received: ${JSON.stringify(evt)}`);

  if (evt.data.key === "haptics"){
    hapticSetting = (evt.data.newValue === "true" ? true : false);
    console.log(`Haptic feedback enabled = ${hapticSetting}`);
  }

  let names = ["newName1", "newName2", "newName3", "newName4", "newName5",
               "newName6", "newName7", "newName8", "newName9", "newName10"];  // array of setttings keys
  for (let i = 0; i < names.length; i++) {
    if (typeof state.waypoints[i] != "undefined") {
       rename(names[i], state.waypoints[i].getFilename(), evt);
    }
  }
};

function rename(setKey, txt, evt) {
  if (evt.data.key === setKey && evt.data.newValue && fs.existsSync(txt)) {
    let newName = editString(JSON.stringify(evt.data.newValue));
    let jsonData = fs.readFileSync(txt, "cbor");
    jsonData.name = newName;
    fs.writeFileSync(txt, jsonData, "cbor");
    sendMessage();
    let stateJSON = fs.readFileSync("state.txt", "cbor");
    state.restoreState(stateJSON);
    refreshList(tileList, state, nav);
  }
}

// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("App Socket Open");
};

// Message socket closes
messaging.peerSocket.onclose = () => {
  console.log("App Socket Closed");
};

//Change View and Tile List Stuff - Keaton
view.showNav();
let myList = document.getElementById("myList");
let NUM_ELEMS = 11;
myList.delegate = {
  getTileInfo: (index) => {
    return {
      type: "my-pool",
      value: "Item",
      index: index
    };
  },
  configureTile: (tile, info) => {
    if (info.type == "my-pool") {
      
      //Assigns tile to array to be accessed outside of delegate
      tileList[info.index] = tile;
      
      let touch = tile.getElementById("touch");
      touch.addEventListener("click", evt => {
        //console.log(`touched: ${info.index}`);
        if (info.index == 0) {
          view.showNav();
        } else if (info.index != state.getCurrent+1){
          try {
            state.getAtIndex(info.index-1).getName();
            state.selectWaypoint(info.index);
            // Update nav dest to currently selected Waypoint
            if (state.getCurrent() != undefined && state.getCurrent.active != false){
              // Update lblName
              view.lblName.text = state.getCurrent().getName();
              // Make sure lblName is visible
              view.lblName.style.display = "inline";
              // Set nav destination to the current waypoint
              nav.setDestination(state.getCurrent());
              // Start beacon animation - CMB
              view.beacon.acquire();
              // Start navigation with watchSuccess callback 
              nav.start(watchSuccess, locationError);
              view.showNav();
            }
          } catch(err){ console.log ("Waypoint does not exist; " + err); }
        } else { }
      });
      
      tile.getElementById("btnDelete").onactivate = function(evt) {
        //console.log("delete button pressed for " + info.index);
        deletionIndex = info.index;
        view.showPrompt();
      }

      tile.getElementById("btnCancelNavigation").onactivate = function(evt){
        //console.log("cancel navigation button pressed for " + info.index);
        view.showCancel();
      }

      tile.getElementById("btnCancelNavigation").style.display = "none";
      if (info.index == 0) {
        tile.getElementById("text").text = "                   Return";
        tile.getElementById("btnDelete").style.display = "none";
       console.log("Changed tile name");
      } else {
        
        //Populates tile items with data from State.js as they load 
        if (state.getAtIndex(info.index-1) != undefined){
          tile.getElementById("text").text = state.getAtIndex(info.index-1).getName();
          tile.getElementById("btnDelete").style.display = "inline";
        } else {
          tile.getElementById("text").text = "";
          tile.getElementById("btnDelete").style.display = "none";
        }
      }
    }
  }
};
myList.length = NUM_ELEMS;

// Nicholas W. (Settings stuff)
messaging.peerSocket.addEventListener("open", (evt) => {
  console.log("Ready to send or receive messages");
  sendMessage();
});

messaging.peerSocket.addEventListener("error", (err) => {
  console.error(`Connection error: ${err.code} - ${err.message}`);
});

function sendMessage() {
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