import twgl from 'twgl.js/dist/3.x/twgl-full';
const mat4 = twgl.m4;
const vec3 = twgl.v3;

export default class Camera {
  constructor(position, target, up, lockY = true) {
    this.position = position;
    this.target = target;
    this.up = up;
    this.lockY = lockY;
  }

  set cameraInfo(info) {
    let {position, target, up} = info;
    this.position = position;
    this.target = target;
    this.up = up;
  }

  updateVectors(front, up) {
    let newLookAt = vec3.create();
    newLookAt[0] = Math.sin(front[0]) * Math.cos(front[1]);
    newLookAt[1] = Math.sin(front[1]);
    newLookAt[2] = Math.cos(front[0]) * Math.cos(front[1]);

    if(this.lockY) newLookAt[1] = 0;

    let tempLook = newLookAt.slice();
    tempLook[1] = 0;
    this.front = vec3.normalize(tempLook);
    this.right = vec3.normalize(vec3.cross(this.front, up));
    this.up    = vec3.normalize(vec3.cross(this.right, this.front));

    vec3.add(this.position, newLookAt, this.target);
  }

  moveBy(vector) {
    vec3.add(this.position, vector, this.position);
  }

  get view() {
    return mat4.inverse(this.lookAt);
  }

  get lookAt() {
    return mat4.lookAt(this.position, this.target, this.up);
  }
}