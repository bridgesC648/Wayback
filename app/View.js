import PointerSymbol from "./PointerSymbol";
import document from "document";
export default class View {
  // All of the main view's UI elements and functions that manipulate them
  constructor() {
    //console.log("VIEW CONSTRUCTOR: ");
    // PointerSymbol for the phi indicator (phi = direction toward waypoint)
    this.phi = new PointerSymbol(
      document.getElementById("phiInstance"),
      document.getElementById("animPhi")
    );
    
    // WHY AREN'T YOU WORKING, BACON!?
    this.beacon = {
      useID : document.getElementById("signalRing"),
      scale : document.getElementById("ringScale"),
      opacity : document.getElementById("ringOpacity"),
      translate : document.getElementById("ringTrans"),
      acquiring: false,
      
      acquire : function() {
        console.log("Acquiring signal.");
        this.acquiring = true;
        this.useID.animate("enable");
        this.useID.style.opacity = 1;
      },
      
      disable : function() {
        console.log("Disabling signal.");
        this.acquiring = false;
        this.useID.animate("disable");
        this.useID.style.opacity = 0;
      }
    }
  
    // Buttons
    this.btnSave = document.getElementById("btnSave");
    this.btnReturn = document.getElementById("btnReturn");
    this.btnConfirmDeletion = document.getElementById("btnConfirmDeletion");
    this.btnCancelDeletion = document.getElementById("btnCancelDeletion");
    this.btnConfirmCancelNavigation = document.getElementById("btnConfirmCancelNavigation");
    this.btnCancelCancelNavigation = document.getElementById("btnCancelCancelNavigation");
    
    // Labels (text elements)
    this.lblName = document.getElementById("lblName");
    this.lblDistance = document.getElementById("lblDistance");

    // SVG Elements.
    this.navigationView = document.getElementById("NavigationScreen");
    this.tileView = document.getElementById("WaypointsListScreen");
    this.deletePrompt = document.getElementById("DeleteWaypointsScreen");
    this.cancelPrompt = document.getElementById("CancelNavigationScreen");
  } // constructor

  // Show methods
  showNav() {
    this.navigationView.style.display = "inline";
    this.tileView.style.display = "none";
    this.deletePrompt.style.display = "none";
    this.cancelPrompt.style.display = "none";
  }

  showTiles() {
    this.tileView.style.display = "inline";
    this.navigationView.style.display = "none";
    this.deletePrompt.style.display = "none";
    this.cancelPrompt.style.display = "none";
  }

  showPrompt() {
    this.deletePrompt.style.display = "inline";
    this.tileView.style.display = "none";
    this.navigationView.style.display = "none";
    this.cancelPrompt.style.display = "none";
  }

  showCancel() {
    this.deletePrompt.style.display = "none";
    this.tileView.style.display = "none";
    this.navigationView.style.display = "none";
    this.cancelPrompt.style.display = "inline";
  }
  
}
