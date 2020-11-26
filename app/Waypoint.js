import * as fs from "fs";

export default class Waypoint {
  constructor(posn, name, f) {
    this.filename = f;
    this.position = posn;
    this.active = true; // assumed active on creation
    this.name = name;
  }
  
  // A good class should also have getters and setters.
  getFilename() { return this.filename; }
  getName() { return this.name; }
  getLat() { return this.position.coords.latitude; }
  getLong() { return this.position.coords.longitude; }
  getCoords() {
    return this.getLat().toFixed(3) + " , " + this.getLong().toFixed(3);
  }
  // Sometimes you need the position as well.
  getPosition() { return this.position; }
  
  disable() {
    // Mark a Waypoint as inactive.
    this.active = false;
  }

  log() {
    // Print information about this waypoint to the console
    console.log("Name: " + this.name);
    console.log("Lat: " + this.position.coords.latitude);
    console.log("Long: " + this.position.coords.longitude);
    console.log("Filename: " + this.filename);
  }
  
  saveToDevice() {
    let jsonData = {
      filename: this.filename,
      position: this.position, 
      active: this.active,
      name: this.name
    };
    fs.writeFileSync(this.filename, jsonData, "cbor");
  }
}