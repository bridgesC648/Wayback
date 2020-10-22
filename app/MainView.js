import PointerSymbol from "./PointerSymbol";
import geolocation from "geolocation";

export default class MainView {
  // All of the main view's UI elements and functions that manipulate them
  constructor() {
    // Background rectangle... Actually, I don't think we need this.
    // this.background = document.getElementById("background");
    // PointerSymbol for the North indicator
    this.north = new PointerSymbol(
      document.getElementById("northInstance"),
      document.getElementById("animNorth")
    );
    //PointerSymbol for the phi indicator (phi = direction toward waypoint)
    this.phi = new PointerSymbol(
      document.getElementById("phiInstance"),
      document.getElementById("animPhi")
    );
    // Buttons
    this.btnSave = document.getElementById("btnSave");
    this.btnReturn = document.getElementById("btnReturn");
    
    // Labels (text elements)
    this.lblName = document.getElementById("lblName");
    this.lblDistance = document.getElementById("lblDistance");    
  } // constructor
}
