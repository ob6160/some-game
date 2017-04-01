import twgl from 'twgl.js/dist/3.x/twgl-full';

import Renderable from './renderable';

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


          let faceCount = 4;
          // By default we will render the top and bottom because we do not support multi-storey levels yet.
          let faceMask = TOP;

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
              faceCount += 4;
            }
          }

          this.positionData.data = this.positionData.data.concat(this.cubeVerts(ii, jj, faceMask));
          this.indiceData.data = this.indiceData.data.concat(this.cubeIndices(cubeCount, faceMask));

          this.texCoordData.data = this.texCoordData.data.concat(this.cubeTexCoords(faceMask));

          cubeCount += faceCount;
        } else {
          let faceMask = TOP | BOTTOM;

          this.positionData.data = this.positionData.data.concat(this.cubeVerts(ii, jj, faceMask));
          this.indiceData.data = this.indiceData.data.concat(this.cubeIndices(cubeCount, faceMask));
          this.texCoordData.data = this.texCoordData.data.concat(this.cubeTexCoords(faceMask));

          cubeCount += 8;
        }
      }
    }
  }

  cubeVerts(i, j, discard = 63) {
    let final = [];

    if(discard & TOP) {
      final = final.concat([
        -1.0+i, 1.0, 1.0+j,
        1.0+i, 1.0, 1.0+j,
        1.0+i, 1.0, -1.0+j,
        -1.0+i, 1.0, -1.0+j,
      ]);
    }

    if(discard & BOTTOM) {
      final = final.concat([
        1.0+i, -1.0, 1.0+j,
        -1.0+i, -1.0, 1.0+j,
        -1.0+i, -1.0, -1.0+j,
        1.0+i, -1.0, -1.0+j,
      ]);
    }

    if(discard & RIGHT) {
      final = final.concat([
        -1.0+i, -1.0, -1.0+j,
        -1.0+i, -1.0, 1.0+j,
        -1.0+i, 1.0, 1.0+j,
        -1.0+i, 1.0, -1.0+j,
      ]);
    }

    if(discard & LEFT) {
      final = final.concat([
        1.0+i, -1.0, 1.0+j,
        1.0+i, -1.0, -1.0+j,
        1.0+i, 1.0, -1.0+j,
        1.0+i, 1.0, 1.0+j,
      ])
    }

    if(discard & FRONT) {
      final = final.concat([
        -1.0+i, -1.0, 1.0+j,
        1.0+i, -1.0, 1.0+j,
        1.0+i, 1.0, 1.0+j,
        -1.0+i, 1.0, 1.0+j,
      ])
    }

    if(discard & BACK) {
      final = final.concat([
        1.0+i, -1.0, -1.0+j,
        -1.0+i, -1.0, -1.0+j,
        -1.0+i, 1.0, -1.0+j,
        1.0+i, 1.0, -1.0+j,
      ])
    }

    return final;
  }

  cubeTexCoords(discard = 63) {
    let final = [];

    if(discard & TOP) {
      final = final.concat([
        0, 1,
        1, 1,
        1, 0,
        0, 0,
      ]);
    }

    if(discard & BOTTOM) {
      final = final.concat([
        0, 1,
        1, 1,
        1, 0,
        0, 0,
      ]);
    }

    if(discard & RIGHT) {
      final = final.concat([
        0, 1,
        1, 1,
        1, 0,
        0, 0,
      ]);
    }

    if(discard & LEFT) {
      final = final.concat([
        0, 1,
        1, 1,
        1, 0,
        0, 0,
      ])
    }

    if(discard & FRONT) {
      final = final.concat([
        0, 1,
        1, 1,
        1, 0,
        0, 0,
      ])
    }

    if(discard & BACK) {
      final = final.concat([
        0, 1,
        1, 1,
        1, 0,
        0, 0,
      ])
    }

    return final;
  }

  cubeIndices(count, discard = 63) {
    let final = [];
    let counter = 0;

    if(discard & TOP) {
      final = final.concat([
        // Front face
        0+count, 1+count, 2+count, 2+count, 3+count, 0+count,
      ]);
    }

    if(discard & BOTTOM) {
      counter += 4;
      final = final.concat([
        // Right face
        counter+3+count, counter+2+count, counter+1+count, counter+1+count, counter+count, counter+3+count,
      ]);

    }

    if(discard & RIGHT) {
      counter += 4;
      final = final.concat([
        // Back face
        counter+3+count, counter+2+count, counter+1+count, counter+1+count, counter+count, counter+3+count,
      ]);

    }

    if(discard & LEFT) {
      counter += 4;
      final = final.concat([
        // Left face
        counter+3+count, counter+2+count, counter+1+count, counter+1+count, counter+count, counter+3+count,
      ])

    }

    if(discard & FRONT) {
      counter += 4;
      final = final.concat([
        // Top Face
        counter+3+count, counter+2+count, counter+1+count, counter+1+count, counter+count, counter+3+count,
      ])

    }

    if(discard & BACK) {
      counter += 4;
      final = final.concat([
        // Bottom Face
        counter+3+count, counter+2+count, counter+1+count, counter+1+count, counter+count, counter+3+count,
      ])
    }

    return final;
  }

  constructMap() {
    for(let i = 0; i < this.width; i++) {
      this.map[i] = [];
      for(let j = 0; j < this.height; j++) {
        if(Math.random() < 0.3) {
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