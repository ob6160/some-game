import twgl from 'twgl.js/dist/3.x/twgl-full';

import Renderable from './renderable';
import TileAtlas from './tileatlas';

const TOP = 1,
      BOTTOM = 2,
      LEFT = 4,
      RIGHT = 8,
      BACK = 16,
      FRONT = 32;

export default class Level extends Renderable {
  constructor(gl, width = 10, height = 10) {
    super(gl);

    this.width = width;
    this.height = height;

    this.map = [];

    this.atlas = new TileAtlas(gl, {
      src: "mcset.png",
      minMag: gl.NEAREST,
      wrap: gl.CLAMP_TO_EDGE,
    }, 16, 256, 256, 0, 0);
    this.uniforms['u_texture'] = this.atlas.texture;

    this.constructMap();
    this.generateVertices();
  }

  generateVertices() {
    let cubeCount = 0;
    let sideTextures = [16,16,85,6,6,16];

    for(let i = 0; i < this.width; i++) {
      for(let j = 0; j < this.height; j++) {
        let currentTile = this.map[i][j];
        let ii = i * 2;
        let jj = j * 2;
        if(currentTile === 1) {
          // By default we will render the top and bottom because we do not support multi-storey levels yet.
          let faceMask = 0;

          for(let k = 0; k < 9; k++) {
            // Skip over if we're on the centre or one of the corners
            if(k === 0 || k === 2 || k === 6 || k === 8 || k === 4) continue;

            let ki = (k % 3) - 1;
            let kj = Math.floor(k / 3) - 1;
            let kii = ki + i;
            let kjj = kj + j;

            let lookup = (this.map[kii]) ? this.map[kii][kjj] : 0;

            if(lookup !== 1) {
              switch(k) {
                case 1:
                  // Front
                  faceMask |= BACK;
                  break;
                case 3:
                  // Left
                  faceMask |= RIGHT;
                  break;
                case 5:
                  // Right
                  faceMask |= LEFT;
                  break;
                case 7:
                  // Back
                  faceMask |= FRONT;
                  break;
              }
            }
          }

          let tileData = this.tileRenderData(ii, jj, cubeCount, sideTextures, faceMask | TOP | BOTTOM);

          this.positionData.data = [].concat.apply([], [this.positionData.data, tileData.vertices]);
          this.indiceData.data = [].concat.apply([], [this.indiceData.data, tileData.indices]);
          this.texCoordData.data = [].concat.apply([], [this.texCoordData.data, tileData.texcoords]);
          this.normalData.data = [].concat.apply([], [this.normalData.data, tileData.normals]);

          cubeCount += tileData.faceCount;
        } else {
          let tileData = this.tileRenderData(ii, jj, cubeCount, sideTextures, TOP | BOTTOM);

          this.positionData.data = [].concat.apply([], [this.positionData.data, tileData.vertices]);
          this.indiceData.data = [].concat.apply([], [this.indiceData.data, tileData.indices]);
          this.texCoordData.data = [].concat.apply([], [this.texCoordData.data, tileData.texcoords]);
          this.normalData.data = [].concat.apply([], [this.normalData.data, tileData.normals]);

          cubeCount += tileData.faceCount;
        }
      }
    }
  }

  tileRenderData(xOffset, yOffset, indexBaseCount, sideTextures, discard = 63) {
    let finalVertices = [];
    let finalIndices = [];
    let finalTexCoords = [];
    let finalNormals = [];

    let sides = {
      top: !!(discard & TOP),
      bottom: !!(discard & BOTTOM),
      right: !!(discard & RIGHT),
      left: !!(discard & LEFT),
      front: !!(discard & FRONT),
      back: !!(discard & BACK),
    };

    let indexCounter = 0;
    let sideCounter = 0;

    for (let side in sides) {
      let cur_side = sides[side];
      let curTexCode = sideTextures[sideCounter];

      sideCounter++;

      if(!cur_side) continue;

      let sideData = this.cubeSideData(side, xOffset, yOffset, indexBaseCount, indexCounter, curTexCode);
      finalVertices = [].concat.apply([], [finalVertices, sideData.vertices]);
      finalIndices = [].concat.apply([], [finalIndices, sideData.indices]);
      finalTexCoords = [].concat.apply([], [finalTexCoords, sideData.texcoords]);
      finalNormals = [].concat.apply([], [finalNormals, sideData.normals]);

      indexCounter += 4;
    }

    return {
      vertices: finalVertices,
      indices: finalIndices,
      texcoords: finalTexCoords,
      normals: finalNormals,
      faceCount: indexCounter,
    };
  }

  cubeSideData(side, i, j, indexBaseCount, indexCounter = 0, texCode = 0) {
    let finalVertices = [];
    let finalIndices = [];
    let finalTexCoords = [];
    let finalNormals = [];

    let firstSideIndices = [0+indexBaseCount, 1+indexBaseCount, 2+indexBaseCount, 2+indexBaseCount, 3+indexBaseCount, 0+indexBaseCount];
    let otherSideIndices = [indexCounter+3+indexBaseCount, indexCounter+2+indexBaseCount, indexCounter+1+indexBaseCount, indexCounter+1+indexBaseCount, indexCounter+indexBaseCount, indexCounter+3+indexBaseCount];

    if(indexCounter === 0) {
      finalIndices = firstSideIndices;
    } else {
      finalIndices = otherSideIndices;
    }

    switch(side) {
      case 'left':
        finalVertices = [
          1.0+i, -1.0, 1.0+j,
          1.0+i, -1.0, -1.0+j,
          1.0+i, 1.0, -1.0+j,
          1.0+i, 1.0, 1.0+j,
        ];
        finalNormals = [
          1,0,0,
          1,0,0,
          1,0,0,
          1,0,0,
        ];
        break;
      case 'right':
        finalVertices = [
          -1.0+i, -1.0, -1.0+j,
          -1.0+i, -1.0, 1.0+j,
          -1.0+i, 1.0, 1.0+j,
          -1.0+i, 1.0, -1.0+j,
        ];
        finalNormals = [
            -1,0,0,
            -1,0,0,
            -1,0,0,
            -1,0,0,
        ];
        break;
      case 'bottom':
        finalVertices = [
          1.0+i, -1.0, 1.0+j,
          -1.0+i, -1.0, 1.0+j,
          -1.0+i, -1.0, -1.0+j,
          1.0+i, -1.0, -1.0+j,
        ];
        finalNormals = [
          0,-1,0,
          0,-1,0,
          0,-1,0,
          0,-1,0,
        ];
        break;
      case 'top':
        finalVertices = [
          -1.0+i, 1.0, 1.0+j,
          1.0+i, 1.0, 1.0+j,
          1.0+i, 1.0, -1.0+j,
          -1.0+i, 1.0, -1.0+j,
        ];
        finalNormals = [
          0,1,0,
          0,1,0,
          0,1,0,
          0,1,0,
        ];
        break;
      case 'front':
        finalVertices = [
          -1.0+i, -1.0, 1.0+j,
          1.0+i, -1.0, 1.0+j,
          1.0+i, 1.0, 1.0+j,
          -1.0+i, 1.0, 1.0+j,
        ];
        finalNormals = [
          0,0,1,
          0,0,1,
          0,0,1,
          0,0,1,
        ];
        break;
      case 'back':
        finalVertices = [
          1.0+i, -1.0, -1.0+j,
          -1.0+i, -1.0, -1.0+j,
          -1.0+i, 1.0, -1.0+j,
          1.0+i, 1.0, -1.0+j,
        ];
        finalNormals = [
          0,0,-1,
          0,0,-1,
          0,0,-1,
          0,0,-1,
        ];
        break;
      default:
        console.warn(`${side} is an invalid side!`);
    }

    finalTexCoords = this.atlas.clipTexCoords(texCode);

    return {
      vertices: finalVertices,
      indices: finalIndices,
      normals: finalNormals,
      texcoords: finalTexCoords,
    };
  }

  constructMap() {
    for(let i = 0; i < this.width; i++) {
      this.map[i] = new Int8Array(this.height);
      for(let j = 0; j < this.height; j++) {
        if(Math.random() < 0.1) {
          this.map[i][j] = 1;
        } else if(i === 0 || i === this.width - 1 || j === 0 || j === this.height - 1) {
          this.map[i][j] = 1;
        } else {
          this.map[i][j] = 0;
        }
      }
    }
  }
}