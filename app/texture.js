import twgl from 'twgl.js/dist/3.x/twgl-full';

export default class Texture {
  constructor(gl, options) {
    this.options = options;
    this.texture = twgl.createTexture(gl, this.options);

    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    let ext = gl.getExtension("EXT_texture_filter_anisotropic");
    let max = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    gl.texParameteri(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, max);

  }
}