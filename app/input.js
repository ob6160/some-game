export default class Input {
  constructor(codes) {
    let pressed = Object.create(null);
    function handler(event) {
      if (codes.hasOwnProperty(event.keyCode)) {
        pressed[codes[event.keyCode]] = (event.type === "keydown");
        event.preventDefault();
      }
    }
    addEventListener("keydown", handler);
    addEventListener("keyup", handler);
    return pressed;
  }
}