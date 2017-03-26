import twgl from 'twgl.js/dist/3.x/twgl-full';
const mat4 = twgl.m4;

export default class Camera {
  constructor(position, target, up) {
    this.position = position;
    this.target = target;
    this.up = up;
  }

  set cameraInfo(info) {
    let {position, target, up} = info;
    this.position = position;
    this.target = target;
    this.up = up;
  }

  get view() {
    return mat4.inverse(this.lookAt);
  }

  get lookAt() {
    return mat4.lookAt(this.position, this.target, this.up);
  }
}