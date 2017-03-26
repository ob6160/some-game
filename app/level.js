import twgl from 'twgl.js/dist/3.x/twgl-full';

import Renderable from './renderable';

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
          this.positionData.data = this.positionData.data.concat(this.cubeVerts(ii, jj));
          this.texCoordData.data = this.texCoordData.data.concat(this.cubeTexCoords());
          this.indiceData.data = this.indiceData.data.concat(this.cubeIndices(cubeCount));

          cubeCount += 24;
        }
      }
    }
  }

  cubeVerts(i, j) {
    return [
      -1.0+i, -1.0, 1.0+j,
      1.0+i, -1.0, 1.0+j,
      1.0+i, 1.0, 1.0+j,
      -1.0+i, 1.0, 1.0+j,
      1.0+i, -1.0, 1.0+j,
      1.0+i, -1.0, -1.0+j,
      1.0+i, 1.0, -1.0+j,
      1.0+i, 1.0, 1.0+j,
      1.0+i, -1.0, -1.0+j,
      -1.0+i, -1.0, -1.0+j,
      -1.0+i, 1.0, -1.0+j,
      1.0+i, 1.0, -1.0+j,
      -1.0+i, -1.0, -1.0+j,
      -1.0+i, -1.0, 1.0+j,
      -1.0+i, 1.0, 1.0+j,
      -1.0+i, 1.0, -1.0+j,
      -1.0+i, 1.0, 1.0+j,
      1.0+i, 1.0, 1.0+j,
      1.0+i, 1.0, -1.0+j,
      -1.0+i, 1.0, -1.0+j,
      1.0+i, -1.0, 1.0+j,
      -1.0+i, -1.0, 1.0+j,
      -1.0+i, -1.0, -1.0+j,
      1.0+i, -1.0, -1.0+j,
    ];
  }

  cubeTexCoords() {
    return [
      0, 1,
      1, 1,
      1, 0,
      0, 0,
      0, 1,
      1, 1,
      1, 0,
      0, 0,
      0, 1,
      1, 1,
      1, 0,
      0, 0,
      0, 1,
      1, 1,
      1, 0,
      0, 0,
      0, 1,
      1, 1,
      1, 0,
      0, 0,
      0, 1,
      1, 1,
      1, 0,
      0, 0,
    ];
  }

  cubeIndices(count) {
    return [
      // Font face
      0+count, 1+count, 2+count, 2+count, 3+count, 0+count,
      // Right face
      7+count, 6+count, 5+count, 5+count, 4+count, 7+count,
      // Back face
      11+count, 10+count, 9+count, 9+count, 8+count, 11+count,
      // Left face
      15+count, 14+count, 13+count, 13+count, 12+count, 15+count,
      // Top Face
      19+count, 18+count, 17+count, 17+count, 16+count, 19+count,
      // Bottom Face
      23+count, 22+count, 21+count, 21+count, 20+count, 23+count,
    ];
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