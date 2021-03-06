// View.js

import PointerSymbol from "./PointerSymbol";
import document from "document";
import { sleep } from "../common/utils";

export default class View {
  // All of the main view's UI elements and functions that manipulate them
  constructor() {
    //console.log("VIEW CONSTRUCTOR: ");
    // PointerSymbol for the phi indicator (phi = direction toward waypoint)
    this.phi = new PointerSymbol(
      document.getElementById("phiInstance"),
      document.getElementById("animPhi")
    );
    
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
    this.lblMessage = document.getElementById("lblMessage");

    // SVG Elements.
    this.navigationView = document.getElementById("NavigationScreen");
    this.tileView = document.getElementById("WaypointsListScreen");
    this.deletePrompt = document.getElementById("DeleteWaypointsScreen");
    this.cancelPrompt = document.getElementById("CancelNavigationScreen");
  } // constructor

  waypointSaved() {
    let msg = this.lblMessage.getElementById("txtMessage");
    msg.text = "waypoint saved";
    msg.style.fill = "fb-green";
    this.lblMessage.animate("enable");
  }

  saveWaypointFailed() {
    let msg = this.lblMessage.getElementById("txtMessage");
    msg.text = "max waypoints reached";
    msg.style.fill = "fb-red";
    this.lblMessage.animate("enable");
  }

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
  
  async backToNav() {
    // Method to hackily return to the navigation screen after animation.
    await sleep(9500);
    document.history.back().then(this.showNav);
  }
}
