import geolocation from "geolocation";
import Waypoint from "./Waypoint";
const PI = Math.PI;
const METERS = 111139; // Number of meters corresponding to one degree long/lat
export default class Navigator {
  constructor() {
    // watchID for stopping navigation
    this.watchID = null;
    // Destination (waypoint) 
    this.destination = null;
    // User's last position
    this.lastPosition = null;
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


  //getDestination() { return this.destination; }
  getHeading() { return this.heading; }
  getDistance() { return this.distance; }
  getAngle() { return this.angle; }
  getLat() { return this.destination.coords.latitude; }
  getLong() { return this.destination.coords.longitude; }
  
  isNav() { return this.navigating; }
  arrived() {
    return this.distance <= 10;
  }
  
  setDestination(d) { this.destination = d; }
  setHeading(h) { this.manualHeading = h; }
  
  calcAngle(p1, p2) {
    // Returns the angle between the line connecting p1p2, and north.
    let lat1 = p1.coords.latitude;
    let long1 = p1.coords.longitude;
    let lat2 = p2.coords.latitude;
    let long2 = p2.coords.longitude
    let dLong = this.displacement(long2, long1);
    let dLat = this.displacement(lat2, lat1);
    let theta = Math.atan(dLong/dLat)*(180/PI);
    
    if (long2 > long1 && lat2 > lat1) {
      // vector points northeast.
      console.log("Vector points northeast.");
      return theta;
    } else if (long2 > long1 && lat2 == lat1) {
      // vector points due east
      console.log("Vector points due east.");
      return 90;
    } else if (long2 > long1 && lat2 < lat1) {
      // vector points south east
      console.log("Vector points southeast.");
      return 180 - theta;
    } else if (long2 == long1 && lat2 < lat1) {
      // vector points due south.
      console.log("Vector points due south.");
      return 180;
    } else if (long2 < long1 && lat2 < lat1) {
      // vector point south west
      console.log("Vector points south west.");
      return 180 + theta;
    } else if (long2 < long1 && lat2 == lat1) {
      // vector points due west
      console.log("Vector points due west.");
      return 270;
    } else if (long2 < long1 && lat2 > lat1) {
      // vector points northwest
      console.log("Vector points northwest.");
      return 360 - theta;
    } else {
      // vector points due north
      console.log("Vector points due north.");
      return 0;
    }
  }

  updateHeading(position) {
    // Check the user's heading
    try {
      this.heading = position.coords.heading;
      console.log("Heading, obtained from position: " + heading);
    } catch (err) {
      console.log("Coud not obtain heading from position.");
      console.log("Error: " + err);
      try {
        this.heading = this.calcAngle(position, this.lastPosition);
        console.log("Caclulated heading: " + this.heading);
      } catch (err) {
        this.heading = 0; // just use 0, i guess. 
      }
    }
  }
  
  update(position) {
    // Update the user's heading
    console.log("UPDATING HEADING------------------------------");
    this.updateHeading(position);    
    // Update distance
    console.log("UPDATING DISTANCE-----------------------------");
    this.distance = this.checkDistance(position);
    console.log("Distance to destination: " + this.distance);
    // Update angle
    console.log("UPDATING ANGLE PHI----------------------------");
    this.angle = this.calcAngle(this.destination.getPosition(), position);
    // set last position to current position.
    this.lastPosition = position;
  }

  displacement(a, b) {
    // If the coordinates are in the same hemisphere:
    if ( (a >= 0 && b >= 0) || (a <= 0 && b <= 0))
      return (a >= b ? (a - b)*METERS  : (b - a)*METERS);
    return (Math.abs(a) + Math.abs(b))*METERS;
  }
  
  calcDistance(latDisp, longDisp) {
    return Math.sqrt(Math.pow(latDisp, 2) + Math.pow(longDisp, 2));
  }
  
  checkDistance(position) {
    let ret = this.calcDistance(
      this.displacement(position.coords.latitude, this.destination.getLat()),
      this.displacement(position.coords.longitude, this.destination.getLong())
    );
    return ret;
  }
}
