import PointerSymbol from "./PointerSymbol";
import Signal from "./Signal";
import geolocation from "geolocation";
import document from "document";
export default class MainView {
  // All of the main view's UI elements and functions that manipulate them
  constructor() {
    //PointerSymbol for the phi indicator (phi = direction toward waypoint)
    this.phi = new PointerSymbol(
      document.getElementById("phiInstance"),
      document.getElementById("animPhi")
    );
    
    this.beacon = {
      useID : document.getElementById("signalRing"),
      scale : document.getElementById("ringScale"),
      opacity : document.getElementById("ringOpacity"),
      translate : document.getElementById("ringTrans"),
      
      acquire : function() {
        console.log("Acquiring signal.");
        this.useID.animate("enable");
        this.useID.style.opacity = 1;
      },
      
      disable : function() {
        console.log("Disabling signal.");
        this.useID.animate("disable");
        this.useID.style.opacity = 0;
      }
    }
  
    // Buttons
    this.btnSave = document.getElementById("btnSave");
    this.btnReturn = document.getElementById("btnReturn");
    this.btnConfirmDeletion = document.getElementById("btnConfirmDeletion");
    this.btnCancelDeletion = document.getElementById("btnCancelDeletion");
    
    // Labels (text elements)
    this.lblName = document.getElementById("lblName");
    this.lblDistance = document.getElementById("lblDistance");    
  } // constructor
}
