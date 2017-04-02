import twgl from 'twgl.js/dist/3.x/twgl-full';

export default class Renderable {
  constructor() {
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