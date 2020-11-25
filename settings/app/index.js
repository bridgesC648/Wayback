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
import document from "document";
import * as messaging from "messaging";
import geolocation from "geolocation";
import Navigator from "./Navigator";
import State from "./State";
import View from "./View";
import * as fs from "fs";
import { vibration } from "haptics";

//------------------------------------------------------------------
// FUNCTIONS
//------------------------------------------------------------------
// HOLY JANK BATMAN
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve,ms));
}

// THIS SHIT NEEDS TO BE REPLACED WITH PROPER ANIMATION
async function fadeInAndOut(svg, text) {
  // Method that hackily fades the label in and then out
  svg.text = text;
  svg.style.opacity = 0;
  while ( svg.style.opacity < 1) {
    svg.style.opacity += 0.1;
    await sleep(100);
  }
  await sleep(1000);
  while (svg.style.opacity > 0) {
    svg.style.opacity -= 0.1;
    await sleep(100);
  }
}

//-------------------------------------------------------------------
// GLOBAL VARIABLES - IS IT BAD TO HAVE SO MANY?
//-------------------------------------------------------------------
// State object, holds Waypoints and manipulates them
var state = new State();
// Navigator object, handles navigational features
let nav = new Navigator();
// Contains all of the UI elements. 
let view = new View();
// Contains the tiles of the tile list
var tileList = [11];
var deletionButtons = [10];
var deletionIndex = 0;
var hapticSetting = false;

//-------------------------------------------------------------------
// BUTTON EVENTS
//-------------------------------------------------------------------
// Gets called when the Save button gets pressed
view.btnSave.onactivate = function(evt) {
  try {
    view.beacon.acquire();
  } catch (err) {
    console.log(err);
  }
  
  if (hapticSetting)
    vibration.start("confirmation");
  else
    console.log("Prevented Haptic Feedback");
  
  geolocation.getCurrentPosition(
    savePosition,
    locationError,
    {enableHighAccuracy: true, timeout: 60 * 1000});
}

// Gets called when the Return button gets pressed.
view.btnReturn.onactivate = function(evt) {
  view.showTiles();
  refreshList();
}

view.btnConfirmDeletion.onactivate = function(evt) {
  state.delete(deletionIndex);
  view.showTiles();
  refreshList();
  sendMessage();
}

view.btnCancelDeletion.onactivate = function(evt){
  view.showTiles();
  refreshList();
}

//-------------------------------------------------------------------
// CALLBACK FUNCTIONS
//-------------------------------------------------------------------
function savePosition(position) {
  view.beacon.disable();
  // Log coordinates to console
  if (!state.maxReached()) {
    let waypointIndex = state.add(position);
  } else {
    // at some point we should replace this with some on-screen indication
    // that max waypoints have been reached.
    console.log("Could not add waypoint: Maximum waypoints reached.");
  }
  sendMessage();
}

function refreshList(){
  for (var i = 1; i <= 11; i++){
    if (state.getAtIndex(i-1) != undefined && tileList[i] != undefined){
      tileList[i].getElementById("text").text = state.getAtIndex(i-1).getName();
      tileList[i].getElementById("btnDelete").style.display = "inline";
    } else if (tileList[i] != undefined){
      tileList[i].getElementById("text").text = "";
      tileList[i].getElementById("btnDelete").style.display = "none";
    }
  }
}

function watchSuccess(position) {
  // Gets called when position changes.
  console.log("------------------------------------------------");
  console.log("POSITION CHANGED: CALLING watchSuccess()");
  console.log("------------------------------------------------");
  console.log("Updating navigator.");
  nav.update(position);
  // Update the "arrows"
  view.phi.rotate(360 - nav.getHeading() + nav.getAngle());
  if (nav.arrived()) {
    // announce arrival to log
    console.log("You have arrived!");
    // Stop navigator
    nav.stop();
    // hide distance label
    view.lblDistance.style.display="none";
    // change name label text, fade in and out.
    fadeInAndOut(view.lblName, "You have arrived!");
  } else {
    // Update distance label
    view.lblDistance.text = nav.getDistance().toFixed(4);
    // Show the label if it is hidden.
    if (view.lblDistance.style.display == "none")
      view.lblDistance.style.display = "";
  }
}

function locationError(error) {
  console.log("Error: " + error.code, "Message: " + error.message);
}

// Settings socket ------------------------------------------
// Message is received
messaging.peerSocket.onmessage = evt => {
  console.log(`1 App received: ${JSON.stringify(evt)}`);

  let names = ["newName1", "newName2", "newName3", "newName4", "newName5",
               "newName6", "newName7", "newName8", "newName9", "newName10"];  // array of setttings keys
  for (let i = 0; i < names.length; i++) {
    if (typeof state.waypoints[i] != "undefined") {
       rename(names[i], state.waypoints[i].getFilename(), evt);
    }
  }
  if (evt.data.key === "idle") {
    let val = evt.data.newValue;
    idleSetting = (val === "true" ? true : false);
    console.log("idleSetting: " + idleSetting);
  } else if (evt.data.key === "haptics") {
    hapticSetting = (evt.data.newValue === "true" ? true : false);
    console.log(`Haptic feedback enabled = ${hapticSetting}`);
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
    refreshList();
  }
}

function editString(string) { 
  var start = string.indexOf(':')
  var res = string.substring(start + 3, string.length - 4);
  var length = 20;                                           // max number of characters
  var trim = res.substring(0, length);
  return trim;
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
    console.log(`Item: ${info.index}`)
    if (info.type == "my-pool") {
      
      //Assigns tile to array to be accessed outside of delegate
      tileList[info.index] = tile;
      deletionButtons[info.index-1] = tile.getElementById("btnDelete");
      
      let touch = tile.getElementById("touch");
      touch.addEventListener("click", evt => {
        console.log(`touched: ${info.index}`);
        if (info.index == 0) {
          view.showNav();
        }else {
          state.selectWaypoint(info.index);
          // Update nav dest to currently selected Waypoint
          if (state.getCurrent() != undefined && state.getCurrent.active != false){
          // Update lblName
          view.lblName.text = state.getCurrent().getName();
          // Set nav destination to the current waypoint
          nav.setDestination(state.getCurrent());
          // Start navigation with watchSuccess callback 
          nav.start(watchSuccess, locationError);
        }
          view.showNav();
        }
      });
      
      let btnDelete = tile.getElementById("btnDelete");
      btnDelete.onactivate = function(evt) {
        console.log("delete button " + info.index);
      }
      
      if (info.index == 0) {
       tile.getElementById("text").text = "Return";
        tile.getElementById("btnDelete").style.display = "none";
       console.log("Changed tile name");
      } else{
        if (state.getAtIndex(info.index-1) != undefined){
          tile.getElementById("text").text = state.getAtIndex(info.index-1).getName();
          tile.getElementById("btnDelete").style.display = "inline";
        } else {
          tile.getElementById("text").text = "";
          tile.getElementById("btnDelete").style.display = "none";
        }
      }
      
      tile.getElementById("btnDelete").onactivate = function(evt) {
        console.log("delete button pressed for " + info.index);
        deletionIndex = info.index;
        view.showPrompt();
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