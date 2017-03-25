import twgl from 'twgl.js/dist/3.x/twgl-full';

const mat4 = twgl.m4;
const vec3 = twgl.v3;

// Class imports
import Camera from './camera';

// Shader Imports
import { generic } from './shaders'

class Game {
  constructor() {
    this.gl = null;

    this.twglDefaults = {
      attribPrefix: "a_",
    };

    this.glContextSetup = {
      preserveDrawingBuffer: true
    };
  }

  setup(canvasID) {
    twgl.setDefaults(this.twglDefaults);

    this.gl = twgl.getWebGLContext(
        document.getElementById(canvasID),
        this.glContextSetup
    );

    this.sceneSettings = {
      projection: {
        fov: 30 * Math.PI / 180,
        aspectRatio: this.aspectRatio,
        near: 0.1,
        far: 1000
      },
      camera: {
        eye: [0, 0, -10],
        target: [0, 0, 0],
        up: [0, 1, 0]
      }
    };

    // Camera
    this.camera = new Camera(
        this.sceneSettings.camera.eye,
        this.sceneSettings.camera.target,
        this.sceneSettings.camera.up
    );

    // Shaders
    generic.setup(this.gl, this.sharedUniforms);

    // Shared Shader Uniforms Init
    this.sharedUniforms = {
      u_projection: this.projection,
      u_view: this.camera.view,
      u_model: mat4.identity()
    };


    var arrays = {
      position: [1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1],
      normal:   [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1],
      texcoord: [1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
      indices:  [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23],
    };
    this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, arrays);
  }

  render() {
    let gl = this.gl;
    this.time = this.time + 1 || 0;

    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let projection = this.projection;
    let view = this.camera.view;
    let model = mat4.identity();

    this.sharedUniforms.u_projection = projection;
    this.sharedUniforms.u_view = view;

    this.sharedUniforms.u_model = mat4.identity();
    this.sharedUniforms.u_model = mat4.multiply(mat4.rotateX(this.sharedUniforms.u_model, this.time * 0.01), mat4.translation(vec3.create(Math.sin(this.time/100),0,0)));



    gl.useProgram(generic.program);

    twgl.setBuffersAndAttributes(gl, generic.programInfo, this.bufferInfo);
    generic.uniforms = this.sharedUniforms;

    gl.drawElements(gl.TRIANGLES, this.bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);


    requestAnimationFrame(this.render.bind(this));
  }

  handleResize() {

  }

  get aspectRatio() {
    return this.gl.canvas.clientWidth / this.gl.canvas.clientHeight
  }

  get projection() {
    this.sceneSettings.projection.aspectRatio = this.aspectRatio;

    return mat4.perspective(
        this.sceneSettings.projection.fov,
        this.sceneSettings.projection.aspectRatio,
        this.sceneSettings.projection.near,
        this.sceneSettings.projection.far
    );
  }

}


let gameInstance = new Game();
gameInstance.setup("c");
gameInstance.render();