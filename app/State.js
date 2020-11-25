import Waypoint from "./Waypoint";
import * as fs from "fs"; // Time to save each waypoint as a file.

export default class State {
  constructor() {
    this.waypoints = [];
    // Check for existence of state.txt
    if (fs.existsSync("state.txt")) {
      console.log("Found previous state information.");
      // read to JS object
      let stateJSON = fs.readFileSync("state.txt", "cbor");
      this.restoreState(stateJSON);
    } else {
      console.log("No state information found.");
      // Set initial values
      this.numWaypoints = 0;    // Number to track how many Waypoints.
      this.total = 0;           // Number to track total Waypoints ever.
      this.current = 0;         // Track the currently displayed index
      // Variable for hapticsEnabled here
    }
  } // constructor
      
  maxReached() { return this.numWaypoints == 10; }
  getCurrent() { return this.waypoints[this.current]; }
  getAtIndex(i) { return this.waypoints[i]; }
  getCurrentIndex() {return this.current; }
  
  saveState() {
    let savedFilenames = [];
    for (let i = 0; i < this.numWaypoints; i++) {
      // If there's a waypoint there
      if (this.waypoints[i] != undefined || this.waypoints[i] != null) {
        savedFilenames[i] = this.waypoints[i].getFilename();
      }
    }
    
    let json = {
      waypoints: savedFilenames,
      numWaypoints: this.numWaypoints,
      total: this.total,
      current: this.current
      // corresponding haptics :  value here
    };
    fs.writeFileSync("state.txt", json, "cbor");
  }
  
  restoreWaypoints(filenameArray) {
    for (let i = 0; i < this.numWaypoints; i++) {
      // read the filename saved in the index
      let jsonData = fs.readFileSync(filenameArray[i], "cbor");
      // Log the data
      console.log(JSON.stringify(jsonData));
      // create and assign waypoint based on json data
      this.waypoints[i] = new Waypoint(jsonData.position, jsonData.name, jsonData.filename);
      this.waypoints[i].active = jsonData.active;
    }
  }
  
  restoreState(jsonData) {
    // restore the state of the app from a json
    let fnameArray = jsonData.waypoints;
    this.numWaypoints = jsonData.numWaypoints;
    console.log("Restored number of waypoints: " + this.numWaypoints);
    this.total = jsonData.total;
    console.log("Restored current index: " + this.current);
    this.current = jsonData.current;
    if (this.numWaypoints > 0 ){
      console.log("Restoring waypoints.");
      this.restoreWaypoints(fnameArray);
    }
  }
  
  add(posn){
    for (let i = 0; i < 10; i++) {
      if (this.waypoints[i] == undefined || this.waypoints[i].active == false) {
        // Give the waypoint a default name
        let n = "Waypoint" + (++this.total);
        // Give it a file name.
        let filename = this.total + ".txt"; 
        // Create and assign new waypoint to index i
        this.waypoints[i] = new Waypoint(posn, n, filename);
        // Increment number of waypoints
        this.numWaypoints++;
        // Print waypoint information
        this.waypoints[i].log();
        // Save the waypoint to device 
        this.waypoints[i].saveToDevice();
        // List directory files, just to see that it was written.
        this.listFiles();
        // Save state after adding
        this.saveState();
        return i;
      }
    }
  } // add
  
  listFiles() { // CMB
    let listDir = fs.listDirSync("/private/data");
    let dirIter;
    console.log("Currently saved files: ");
    while ((dirIter = listDir.next()) && !dirIter.done) {
      console.log(dirIter.value);
    }
  }
  
  delete(index) {
    // Need to find the waypoint in memory and kill it. 
    let filename = this.waypoints[index - 1].getFilename();   //CMB
    try {                                                     //CMB
      fs.unlinkSync(filename);                                //CMB
    } catch (err) {                                           //CMB
      console.log(err);                                       //CMB
    }
    
    // Delete a waypoint from the array and shift other wpts back.
    for (var i = index-1; i<11; i++){                         //KA
      if (this.waypoints[i+1] != undefined){                  //KA
        this.waypoints[i] = this.waypoints[i+1];              //KA
      } else {                                                //KA
        this.waypoints[i] = undefined;                        //KA
      }
    }
    console.log("Deleted waypoint in location " + index);
    this.numWaypoints--;
    // Save state after deleting
    this.saveState();
  }

  selectWaypoint(i) { // KA
    if (this.getAtIndex(i-1) != undefined){
      this.current = i-1;
      console.log("Set " + this.waypoints[i-1].getName() + " as current waypoint.");
    } else {
      console.log("Waypoint does not exist.");
    }
  }
}//State

