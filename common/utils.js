export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve,ms));
}

export function refreshList(tileList, state, nav){
    // Code to refresh the tile list so it matches the waypoints : Keaton Archibald
    for (var i = 1; i <= 11; i++){
      //Repopulates the list's labels and if buttons should be shown.
      if (state.getAtIndex(i-1) != undefined && tileList[i] != undefined){
        tileList[i].getElementById("text").text = state.getAtIndex(i-1).getName();
        tileList[i].getElementById("btnDelete").style.display = "inline";
      } else if (tileList[i] != undefined){
        tileList[i].getElementById("text").text = "";
        tileList[i].getElementById("btnDelete").style.display = "none";
      } 
      try {
        tileList[i].getElementById("btnCancelNavigation").style.display = "none";
      } catch (err) { }
    }
      
      // Only shows the cancel navigation button if the app is navigating on the waypoint that is being navigated to
      if (!nav.isNav()) {
        try {
          if(state.getCurrent().getName() != ""){
            tileList[state.getCurrentIndex() + 1].getElementById("btnDelete").style.display = "inline";
            console.log("no error")
          }
        } catch(err) {
          tileList[state.getCurrentIndex() + 1].getElementById("btnDelete").style.display = "none";
          console.log(err);
        }
        tileList[state.getCurrentIndex() + 1].getElementById("btnCancelNavigation").style.display = "none"; 
      } else {
        tileList[state.getCurrentIndex() + 1].getElementById("btnDelete").style.display = "none";
        tileList[state.getCurrentIndex() + 1].getElementById("btnCancelNavigation").style.display = "inline";
      }
  }