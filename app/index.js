/*
Sprint #3 - Navigation Feature
Christopher Bridges
*/
import document from "document";
import * as messaging from "messaging";
import geolocation from "geolocation";
import Navigator from "./Navigator";
import Locations from "./Locations";
import Waypoint from "./Waypoint";
import PointerSymbol from "./PointerSymbol";
import MainView from "./MainView";

const METERS = 111139; // Number of meters corresponding to one degree long/lat
const PI = Math.PI;
const SEC_PER_DEG = 1/360;

// Making a minor change

//------------------------------------------------------------------
// FUNCTIONS
//------------------------------------------------------------------
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve,ms));
}
async function rotate() {
  let i = 0;
  while (true) {
    arrow.groupTransform.rotate.angle = i;
    i+=(360/60)%360;
    await sleep(1000);    
  }
}

async function fadeInAndOut(svg, text) {
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
// Depracated by PointerSymbol class
function animSymbol(animTransform, use, from, to, dur) {
  // sets the attributes of a rotation and then activates it.
  animTransform.from = from;
  animTransform.to = to;
  animTransform.dur = dur;
  console.log(`Rotating from ${from} to ${to}.`);
  use.animate("enable");
}

//-------------------------------------------------------------------
// UI ELEMENTS
//-------------------------------------------------------------------
/*
let background = document.getElementById("background");
let arrow = document.getElementById("arrow");
let north = document.getElementById("north");
let btnSave = document.getElementById("btnSave");
let btnReturn = document.getElementById("btnReturn");

let northGroup = document.getElementById("northInstance"); // <use> id.
let animNorth = document.getElementById("animNorth"); // animateTransform id

let phiGroup = document.getElementById("phiInstance"); // phi use id
let animPhi = document.getElementById("animPhi"); // animateTransform ID

let lblName = document.getElementById("lblName"); // waypoint name label
let lblDistance = document.getElementById("lblDistance"); // distance label

let north = new PointerSymbol(
  document.getElementById("northInstance"),
  document.getElementById("animNorth")
);

let phi = new PointerSymbol(
  document.getElementById("phiInstance"),
  document.getElementById("animPhi")
); */

//-------------------------------------------------------------------
// GLOBAL VARIABLES
//-------------------------------------------------------------------
let locs = new Locations();
let nav = new Navigator();
let mainView = new MainView();
let idleSetting;
let hapticSetting;

//-------------------------------------------------------------------
// BUTTON EVENTS
//-------------------------------------------------------------------

mainView.btnSave.onactivate = function(evt) {
  geolocation.getCurrentPosition(
    savePosition,
    locationError,
    {enableHighAccuracy: true, timeout: 60 * 1000});
}

mainView.btnReturn.onactivate = function(evt) {
  // Update nav dest to currently selected
  if (locs.getCurrent() != undefined && locs.getCurrent.active != false){
    // Update lblName
    mainView.lblName.text = locs.getCurrent().getName();
    nav.setDestination(locs.getCurrent());
    nav.start(watchSuccess, locationError);
  }
}
//-------------------------------------------------------------------
// CALLBACK FUNCTIONS
//-------------------------------------------------------------------
function savePosition(position) {
  // Log coordinates to console
  if (!locs.maxReached()) {
    locs.add(position);
  } else {
    console.log("Could not add waypoint: Maximum waypoints reached.");
  }
}

function watchSuccess(position) {
  // Gets called when position changes. Or, it should.
  console.log("------------------------------------------------");
  console.log("POSITION CHANGED: CALLING watchSuccess()");
  console.log("------------------------------------------------");
  let from; // Current rotation angle of phi 
  let northFrom; // Current rotation angle of north
  if (nav.getAngle() != null) {
    northFrom = 360 - nav.getHeading();
    from = 360 - nav.getHeading() + nav.getAngle();
  } else {
    northFrom = 0;
    from = 0;
  }
  nav.update(position);
  // Update the "arrows"
  north.rotate(360 - nav.getHeading());
  phi.rotate(360 - nav.getHeading() + nav.getAngle());
  /*)
  let northTo = 360 - nav.getHeading();
  let to = 360 - nav.getHeading() + nav.getAngle();
  let northDur = Math.abs(northTo - northFrom)/360;
  let dur = Math.abs(to-from)/360;
  animSymbol(animPhi, phiGroup, from, to, dur);
  animSymbol(animNorth, northGroup, northFrom, northTo, northDur); */
  if (nav.arrived()) {
    console.log("You have arrived!");
    nav.stop();
    mainView.lblDistance.style.display="none";
    fadeInAndOut(mainView.lblName, "You have arrived!");
    locs.getCurrent().disable(); 
  } else {
    lblDistance.text = nav.getDistance().toFixed(4);
    if (lblDistance.style.display == "none")
      lblDistance.style.display = "";
    /*
    let to = 360 - nav.getHeading() + nav.getAngle();
    let dur = Math.abs(to-from)/360;
    animSymbol(animPhi, phiGroup, from, to, dur); */
  }
}

function locationError(error) {
  console.log("Error: " + error.code, "Message: " + error.message);
}
// Settings socket whatever------------------------------------------
// Message is received
messaging.peerSocket.onmessage = evt => {
  console.log(`1 App received: ${JSON.stringify(evt)}`);
  if (evt.data.key === "heading") {
    let from = (nav.getHeading()!=undefined) ? 360-nav.getHeading() : 0;
    nav.setHeading(parseFloat(JSON.parse(evt.data.newValue).name));
    console.log(`User heading set to: ${nav.getHeading()}`);
    let to = 360 - nav.getHeading();
    let dur = Math.abs(to-from)/360;
    animSymbol(animNorth, northGroup, from, to, dur);
  } else if (evt.data.key === "idle") {
    //let val = JSON.stringify(evt.data.newValue);
    let val = evt.data.newValue;
    idleSetting = (val === "true" ? true : false);
    console.log("idleSetting: " + idleSetting);
  } else if (evt.data.key === "haptics") {
    hapticSetting = (evt.data.newValue === "true" ? true : false);
    console.log(`Haptic feedback enabled = ${hapticSetting}`);
  }
};

// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("App Socket Open");
};

// Message socket closes
messaging.peerSocket.onclose = () => {
  console.log("App Socket Closed");
};

