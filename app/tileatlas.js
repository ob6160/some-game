import twgl from 'twgl.js/dist/3.x/twgl-full';

import Texture from './texture';

export default class TileAtlas extends Texture {
  constructor(gl, texOptions, tileSize = 16, width = 256, height = 256, paddingX = 0, paddingY = 0) {
    super(gl, texOptions);

    this.tileSize = tileSize;

    this.width = width;
    this.height = height;
    this.paddingX = paddingX;
    this.paddingY = paddingY;

  }

  get scaleX() {
    return this.tileSize / this.width;
  }

  get scaleY() {
    return this.tileSize / this.height;
  }

  /**
   * Returns the clipped proportion for the specified tile id.
   *
   * @param id
   */
  clipTile(id) {
    let smallest = (this.scaleX < this.scaleY) ? this.scaleY : this.scaleX;

    let x = (id * this.scaleX) % 1;
    let y = Math.floor(id * smallest) * this.scaleY;

    return [x, y];
  }

  clipTexCoords(tileID) {
    let clipTile = this.clipTile(tileID);
    let x = clipTile[0] + (this.paddingX * this.scaleX * this.scaleY);
    let y = clipTile[1] + (this.paddingY * this.scaleX * this.scaleY);

    let padAmount = 0.005;

    return [
      x + padAmount, (y + this.scaleY) - padAmount,
      (x + this.scaleX - padAmount), (y + this.scaleY) - padAmount,
      x + this.scaleX - padAmount, y + padAmount,
      x + padAmount, y + padAmount
    ];

  }
}