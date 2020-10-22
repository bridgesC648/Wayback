export default class Waypoint {
  constructor(posn, name, i) {
    this.position = posn;
    // When a Waypoint is created, we'll assume it's active.
    this.active = true; 
    this.name = name;
  }
  // A good class should also have getters and setters.
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
    console.log("Long: "+ this.position.coords.longitude);
  }
}