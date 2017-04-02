import twgl from 'twgl.js/dist/3.x/twgl-full';

import Renderable from './renderable';

const TOP = 1,
      BOTTOM = 2,
      LEFT = 4,
      RIGHT = 8,
      BACK = 16,
      FRONT = 32;

export default class Level extends Renderable {
  constructor(gl, width = 100, height = 100) {
    super(gl);

    this.width = width;
    this.height = height;

    this.map = [];
    this.constructMap();
    this.generateVertices();

    // TODO: Handle textures properly.
    this.textures = twgl.createTextures(gl, {
      // a power of 2 image
      wall: { src: "wall.jpg", mag: gl.NEAREST },
      wall2: { src: "wall2.jpg", mag: gl.NEAREST },
      wall3: { src: "wall3.jpg", mag: gl.NEAREST },
    });
  }

  generateVertices() {
    let cubeCount = 0;

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

          let tileData = this.tileRenderData(ii, jj, cubeCount, faceMask);

          this.positionData.data = [].concat.apply([], [this.positionData.data, tileData.vertices]);
          this.indiceData.data = [].concat.apply([], [this.indiceData.data, tileData.indices]);
          this.texCoordData.data = [].concat.apply([], [this.texCoordData.data, tileData.texcoords]);

          cubeCount += tileData.faceCount;
        } else {
          let tileData = this.tileRenderData(ii, jj, cubeCount, TOP | BOTTOM);

          this.positionData.data = [].concat.apply([], [this.positionData.data, tileData.vertices]);
          this.indiceData.data = [].concat.apply([], [this.indiceData.data, tileData.indices]);
          this.texCoordData.data = [].concat.apply([], [this.texCoordData.data, tileData.texcoords]);

          cubeCount += tileData.faceCount;
        }
      }
    }
  }

  tileRenderData(xOffset, yOffset, indexBaseCount, discard = 63) {
    let finalVertices = [];
    let finalIndices = [];
    let finalTexCoords = [];

    let sides = {
      top: !!(discard & TOP),
      bottom: !!(discard & BOTTOM),
      right: !!(discard & RIGHT),
      left: !!(discard & LEFT),
      front: !!(discard & FRONT),
      back: !!(discard & BACK),
    };

    let indexCounter = 0;

    for (let side in sides) {
      let cur_side = sides[side];
      if(!cur_side) continue;

      let sideData = this.cubeSideData(side, xOffset, yOffset, indexBaseCount, indexCounter);
      finalVertices = [].concat.apply([], [finalVertices, sideData.vertices]);
      finalIndices = [].concat.apply([], [finalIndices, sideData.indices]);
      finalTexCoords = [].concat.apply([], [finalTexCoords, sideData.texcoords]);

      indexCounter += 4;
    }

    return {
      vertices: finalVertices,
      indices: finalIndices,
      texcoords: finalTexCoords,
      faceCount: indexCounter,
    };
  }

  cubeSideData(side, i, j, indexBaseCount, indexCounter = 0) {
    let finalVertices = [];
    let finalIndices = [];
    let finalTexCoords = [];

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
        finalTexCoords = [
          0, 1,
          1, 1,
          1, 0,
          0, 0,
        ];
        break;
      case 'right':
        finalVertices = [
          -1.0+i, -1.0, -1.0+j,
          -1.0+i, -1.0, 1.0+j,
          -1.0+i, 1.0, 1.0+j,
          -1.0+i, 1.0, -1.0+j,
        ];
        finalTexCoords = [
          0, 1,
          1, 1,
          1, 0,
          0, 0,
        ];
        break;
      case 'bottom':
        finalVertices = [
          1.0+i, -1.0, 1.0+j,
          -1.0+i, -1.0, 1.0+j,
          -1.0+i, -1.0, -1.0+j,
          1.0+i, -1.0, -1.0+j,
        ];
        finalTexCoords = [
          0, 1,
          1, 1,
          1, 0,
          0, 0,
        ];
        break;
      case 'top':
        finalVertices = [
          -1.0+i, 1.0, 1.0+j,
          1.0+i, 1.0, 1.0+j,
          1.0+i, 1.0, -1.0+j,
          -1.0+i, 1.0, -1.0+j,
        ];
        finalTexCoords = [
          0, 1,
          1, 1,
          1, 0,
          0, 0,
        ];
        break;
      case 'front':
        finalVertices = [
          -1.0+i, -1.0, 1.0+j,
          1.0+i, -1.0, 1.0+j,
          1.0+i, 1.0, 1.0+j,
          -1.0+i, 1.0, 1.0+j,
        ];
        finalTexCoords = [
          0, 1,
          1, 1,
          1, 0,
          0, 0,
        ];
        break;
      case 'back':
        finalVertices = [
          1.0+i, -1.0, -1.0+j,
          -1.0+i, -1.0, -1.0+j,
          -1.0+i, 1.0, -1.0+j,
          1.0+i, 1.0, -1.0+j,
        ];
        finalTexCoords = [
          0, 1,
          1, 1,
          1, 0,
          0, 0,
        ];
        break;
      default:
        console.warn(`${side} is an invalid side!`);
    }

    return {
      vertices: finalVertices,
      indices: finalIndices,
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