import twgl from 'twgl.js/dist/3.x/twgl-full';

export default class Texture {
  constructor(gl, options) {
    this.options = options;

    this.texture = twgl.createTexture(gl, this.options);
  }
}