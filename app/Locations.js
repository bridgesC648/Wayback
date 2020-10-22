import Waypoint from "./Waypoint";
export default class Locations {
  constructor() {
    this.waypoints = [];    // Array to hold up to 10 waypoints
    this.numWaypoints = 0;  // Number to track how many Waypoints.
    this.total = 0;         // Number to track total Waypoints ever.
    this.current = 0;       // Track the currently displayed index
  } // constructor
  
  maxReached() { return this.numWaypoints == 10; }
  add(posn){
    for (let i = 0; i < 10; i++) {
      if (this.waypoints[i] == undefined || this.waypoints[i].active == false) {
        let n = "Waypoint" + (++this.total);
        this.waypoints[i] = new Waypoint(posn,n);
        this.numWaypoints++;
        this.waypoints[i].log();
        /*
        if (this.numWaypoints == 1) {
          this.current = i;
          lblName.text = this.waypoints[i].getName();
          lblCoords.text = this.waypoints[i].getCoords();
        }*/
        return;
      }
    }
  } // add
  
  delete(wpt) {
    // Delete a waypoint from array
    for (w in this.waypoints) {
      if (w === wpt) { 
        w.disable();
        return;
      }
    }
  }
  
  getCurrent() { return this.waypoints[this.current]; }
  getNext() { return this.waypoints[(this.current+1)%10]; } // Return next, but don't advance.
  getPrev() { return (this.current - 1 < 0 ? this.waypoints[9] : this.waypoints[this.current - 1]) }
  
  stepForward() {
    if (this.getNext() != undefined)
      this.current = (this.current + 1)%10;
  }
  
  stepBack() {
    if (this.getPrev() != undefined)
      this.current = (--this.current < 0 ? 9 : this.current);
  }
}//ActiveLocations

