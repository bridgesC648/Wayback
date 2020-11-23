//////////////////////////////////////////////////////
// since the file system cant be used by anything outside the app we need to find a way to tranfer app data to this
// NICHOLAS I THINK
function wayPoint1() {
  
    if (fs.existsSync("1.txt")) {
      return fs.readFileSync("1.txt", "json").name;
    }
    else
      return "undefined";
  }
  //////////////////////////////////////////////////
  
  export var points = {
    Waypoint1:"Hello",
    Waypoint2: "Car",
    Waypoint3: 0,
    Waypoint4: 0,
    Waypoint5: 0,
  };
  