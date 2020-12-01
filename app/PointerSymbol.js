export default class PointerSymbol {
  constructor(u, a) {
    this.use = u; // <use> id
    this.anim = a; // <animate> id
    this.current = 0; // start at 0
  }
  
  rotate(toAngle) {
    this.anim.from = this.current;
    this.anim.to = toAngle;
    this.anim.dur = Math.abs(toAngle-this.current)/360;
    this.use.animate("enable");
    this.current = toAngle;
  }
}