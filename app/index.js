import document from "document";        // Christopher Bridges
import * as messaging from "messaging"; // Nicholas Worrell
import geolocation from "geolocation";  // Christopher Bridges
import Navigator from "./Navigator";    // Christopher Bridges
import State from "./State";            // Christopher Bridges
import View from "./View";              // Christopher Bridges
import * as fs from "fs";               // Christopher Bridges
import * as util from "../common/utils";// Christopher Bridges

//-------------------------------------------------------------------
// GLOBAL VARIABLES 
//-------------------------------------------------------------------
var state = new State();    // CMB
let nav = new Navigator();  // CMB
let view = new View();      // CMB 
var tileList = [11];        // KA
var deletionIndex = 0;      // KA
var hapticSetting;          // KL

//-------------------------------------------------------------------
// BUTTON EVENTS
//-------------------------------------------------------------------
// Gets called when the Save button gets pressed - CMB
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

// Gets called when the Return button gets pressed. - CMB / KA
view.btnReturn.onactivate = function(evt) {
  view.showTiles();
  util.refreshList(tileList, state, nav);
}

view.btnConfirmDeletion.onactivate = function(evt) { // KA
  state.delete(deletionIndex);
  view.showTiles();
  util.refreshList(tileList, state, nav);
  util.sendMessage(state);
}

view.btnCancelDeletion.onactivate = function(evt){  // KA
  view.showTiles();
  util.refreshList(tileList, state, nav);
}

view.btnConfirmCancelNavigation.onactivate = function(evt) { // KA
  view.showNav();
  if (view.beacon.acquiring) {            // Stop the beacon if it is active
    console.log("Navigation started.");
    view.beacon.disable();
  }
  nav.stop();
  view.phi.rotate(0);
  view.lblName.style.opacity = 0;
  view.lblDistance.style.opacity = 0;
}

view.btnCancelCancelNavigation.onactivate = function(evt){ // KA
  view.showTiles();
  util.refreshList(tileList, state, nav);
}

//-------------------------------------------------------------------
// CALLBACK FUNCTIONS
//-------------------------------------------------------------------
function savePosition(position) { // CMB
  view.beacon.disable();
  if (!state.maxReached()) {  // If < max waypoints added
    state.add(position);
    view.waypointSaved(); 
  } else {
    view.saveWaypointFailed();
    console.log("Could not add waypoint: Maximum waypoints reached.");
  }
  util.sendMessage(state); // NW
}

// Christopher Bridges
function watchSuccess(position) {
  // Gets called when position changes.
  console.log("Updating navigator.");
  nav.update(position);
  if (nav.arrived()) {
    if (view.beacon.acquiring) {            // Stop the beacon if it is active
      console.log("Navigation started.");
      view.beacon.disable();
    }
    console.log("You have arrived!");     // Announce arrival to log
    nav.stop();                           // Stop navigator
    view.lblDistance.style.display="none";// Hide distance label
    view.lblName.style.display="none";    // Hide the name label.
    util.vibrate("alert", hapticSetting); // Alert ring - KL
    // Change to fireworks.
    document.location.assign("fireworks.view").then(view.backToNav);
    view.phi.rotate(360);
  } else {
    // Update the direction indicator
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

// Christopher Bridges
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
  // array of setttings keys - NW
  let names = ["newName1", "newName2", "newName3", "newName4", "newName5",
               "newName6", "newName7", "newName8", "newName9", "newName10"];  
  for (let i = 0; i < names.length; i++) {
    if (typeof state.waypoints[i] != "undefined") {
       rename(names[i], state.waypoints[i].getFilename(), evt);
    }
  }
};

// NW
function rename(setKey, txt, evt) {
  if (evt.data.key === setKey && evt.data.newValue && fs.existsSync(txt)) {
    let newName = util.editString(JSON.stringify(evt.data.newValue));
    let jsonData = fs.readFileSync(txt, "cbor");
    jsonData.name = newName;
    fs.writeFileSync(txt, jsonData, "cbor");
    util.sendMessage(state);
    let stateJSON = fs.readFileSync("state.txt", "cbor");
    state.restoreState(stateJSON);
    util.refreshList(tileList, state, nav);
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
      tileList[info.index] = tile;  //Assigns tile to array to be accessed outside of delegate
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
  util.sendMessage(state);
});

messaging.peerSocket.addEventListener("error", (err) => {
  console.error(`Connection error: ${err.code} - ${err.message}`);
});