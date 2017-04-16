import twgl from 'twgl.js/dist/3.x/twgl-full';

export default class Texture {
  constructor(gl, options) {
    this.options = options;
    this.texture = twgl.createTexture(gl, this.options);

    let ext = gl.getExtension("EXT_texture_filter_anisotropic");
    let max_anisotropy = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, max_anisotropy);

  }
}