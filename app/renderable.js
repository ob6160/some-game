import twgl from 'twgl.js/dist/3.x/twgl-full';

export default class Renderable {
  constructor(uniforms) {
    this.uniforms = uniforms || {};

    this.positionData = {
      numComponents: 3, data: [],
    };

    this.indiceData = {
      numComponents: 3, data: [],
    };

    this.texCoordData = {
      numComponents: 2, data: [],
    };

    this.normalData = {
      numComponents: 3, data: [],
    };
  }

  constructBuffers(gl) {
    this.bufferInfo = twgl.createBufferInfoFromArrays(gl, this.bufferDefinitions);
    return this.bufferInfo;
  }

  render(gl, shader, uniforms) {
    let mergedUniforms = Object.assign({}, uniforms, this.uniforms);

    gl.useProgram(shader.program);

    twgl.setBuffersAndAttributes(gl, shader.programInfo, this.bufferInfo);
    shader.uniforms = mergedUniforms;

    gl.drawElements(gl.TRIANGLES, this.bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);

  }

  set bufferData({position = [], texcoord = [], normal = [], indices = []}) {
    this.positionData = position;
    this.texCoordData = texcoord;
    this.normalData = normal;
    this.indiceData = indices;

    this.constructBuffers(gl);
  }

  get bufferDefinitions() {
    return {
      position: this.positionData,
      texcoord: this.texCoordData,
      normal: this.normalData,
      indices: this.indiceData,
    }
  }
}