import geolocation from "geolocation";
import Waypoint from "./Waypoint";
const PI = Math.PI;
const METERS = 111139; // Number of meters corresponding to one degree long/lat
export default class Navigator {
  constructor() {
    // watchID for stopping navigation
    this.watchID = null;
    // Destination Position 
    this.destination = null;
    // User's last position
    this.lastPosition = null;
    // User's heading (set manually). Fallback. 
    //this.manualHeading = 0; screw this just start at 0.
    // User's heading, computed.
    this.heading = null;
    // Distance from current posn to dest
    this.distance = null;
    // Angle between heading and dest
    this.angle = null;   
    this.navigating = false;
    this.idle = false;
  }
  
  idle(success, error) {
    // Monitors your location/heading while not navigating
    this.navigating = false;
    this.idle = true;
    this.watchID = geolocation.watchPosition(success, error, {enableHighAccuracy: true});
    console.log("Idle.");
  }
  
  start(success, error) {
    // Begins navigation
    this.navigating = true;
    this.idle = false;
    if (this.watchID != null)
      geolocation.clearWatch(this.watchID);
    this.watchID = geolocation.watchPosition(success, error, {enableHighAccuracy: true});
    console.log("Navigation started.");
  }
  
  stop(){
    geolocation.clearWatch(this.watchID);
    this.navigating = false;
    console.log("Navigation stopped.");
  }


  getDestination() { return this.destination; }
  getHeading() { return this.heading; }
  getDistance() { return this.distance; }
  getAngle() { return this.angle; }
  getLat() { return this.destination.coords.latitude; }
  getLong() { return this.destination.coords.longitude; }
  
  isNav() { return this.navigating; }
  arrived() {
    //console.log("Inside arrived();");
    return this.distance <= 10;
  }
  
  setDestination(d) { this.destination = d; }
  setHeading(h) { this.manualHeading = h; }
  
  setAngle(p) {
    //console.log("Inside of setAngle()");
    // Compare the position to the destinate and determine angle
    let cLat = p.coords.latitude; // current lat
    let cLon = p.coords.longitude; // current long
    //console.log("cLat: " + p.coords.latitude);
    //console.log("cLon: " + p.coords.longitude);

    if ( this.destination.getLat() > cLat && this.destination.getLong() > cLon) {
      // Case 1
      let opp = this.displacement(this.destination.getLong(), cLon);
      //console.log("opp: " + opp);
      let adj = this.displacement(this.destination.getLat(), cLat);
      //console.log("adj: " + adj);
      let angle = Math.atan(opp/adj)*(180/PI);
      //console.log("phi: " + angle);
      this.angle = Math.atan(opp/adj)*(180/PI);
      console.log(this.angle);
    }
  }
  
  calcHeading(position) {
    // Use last known position vs current positiong to extrapolate heading
    let p1 = this.lastPosition.coords;
    try {
      console.log(JSON.stringify(p1));
    } catch (err) {
      console.log("p1 not a JSON.");
    }
    let p2 = position.coords;
    // Calculate the displacement (positive values)
    let dLong = 
        displacement(
          this.lastPosition.coords.longitude,
          position.coords.longitude
        );
    let dLat =
        displacement(
          this.lastPosition.coords.latitude,
          position.coords.latitude
        );
    // Case 1: Heading north east
    if ( p2.latitude > p1.latitude && p2.longitude > p1.longitude)
      return Math.atan(dLong/dLat);
    // Case 2: Heading due east.
    if (p2.latitude == p1.latitude && p2.longitude > p1.longitude)
      return 90;
    // Case 3: Heading south east.
    if (p2.latitude < p1.latitude && p2.longitude > p1.longitude)
      return 180 - Math.atan(dLong/dLat);
    // Case 4: Heading due south.
    if (p2.latitude < p1.latitude && p2.longitude == p1.longitude)
      return 180;
    // Case 5: Heading south west.
    if (p2.latitude < p1.latitude && p2.longitude < p1.longitude)
      return 180 + Math.atan(dLong/dLat);
    // Case 6: heading due west
    if (p2.latitude == p1.latitude && p2.longitude < p1.longitude)
      return 270;
    // Case 7: heading northwest
    if (p2.latitude > p1.latitude && p2.longitude == p1.longitude)
      return 360 - Math.atan(dLong/dLat);
    // Case 8: heading due north.
    return 0;
  }
  
  update(position) {
    // Check the user's heading
    try {
      this.heading = position.coords.heading;
      console.log("Heading, obtained from position: " + heading);
    } catch (err) {
      console.log("Error: " + err);
      try {
        this.heading = this.calcHeading(position);
      } catch (err) {
        try {
        // Use heading from Settings
        this.heading = manualHeading;
        } catch (err) {
          console.log("Error: " + err);
        }
      }
    }
    
    // Update distance
    this.distance = this.checkDistance(position);
    console.log("Distance to destination: " + this.distance);
    // Update angle
    this.setAngle(position);
    this.lastPosition = position;
  }

  displacement(a, b) {
    //console.log("Inside of displacement.");
    // If the coordinates are in the same hemisphere:
    if ( (a >= 0 && b >= 0) || (a <= 0 && b <= 0))
      return (a >= b ? (a - b)*METERS  : (b - a)*METERS);
    return (Math.abs(a) + Math.abs(b))*METERS;
  }
  
  calcDistance(latDisp, longDisp) {
    //console.log("Inside of calcDistance.");
    return Math.sqrt(Math.pow(latDisp, 2) + Math.pow(longDisp, 2));
  }
  
  checkDistance(position) {
    //console.log("Inside of checkDistance(position)");
    //console.log("Calling calcDistance");
    let ret = this.calcDistance(
      this.displacement(position.coords.latitude, this.destination.getLat()),
      this.displacement(position.coords.longitude, this.destination.getLong())
    );
    //console.log("Back from calcDistance.");
    return ret;
  }
}
//module.exports = Navigator;