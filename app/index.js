import twgl from 'twgl.js/dist/3.x/twgl-full';

const mat4 = twgl.m4;
const vec3 = twgl.v3;

// Class imports
import Camera from './camera';
import Level from './level';

// Shader Imports
import { postprocessShader, levelShader } from './shaders'

class Game {
  constructor() {
    this.gl = null;

    this.twglDefaults = {
      attribPrefix: "a_",
    };

    this.glContextSetup = {
      preserveDrawingBuffer: false,
      antialiasing: true
    };

    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  setup(canvasID) {
    twgl.setDefaults(this.twglDefaults);

    this.gl = twgl.getWebGLContext(
        document.getElementById(canvasID),
        this.glContextSetup
    );

    window.game = {
      fxaa: false,
    };

    this.sceneSettings = {
      projection: {
        fov: 45 * Math.PI / 180,
        aspectRatio: this.aspectRatio,
        near: 0.1,
        far: 1000
      },
      camera: {
        position: [8, 0, 8],
        target: [0, 0, 100],
        up: [0, 1, 0],
        front: [0, 0, 0],
      }
    };

    // DOM Events
    this.setupEvents();

    // Camera
    this.camera = new Camera(
        this.sceneSettings.camera.position,
        this.sceneSettings.camera.target,
        this.sceneSettings.camera.up
    );

    // Postprocessing
    this.displayBuffer = twgl.primitives.createXYQuadBufferInfo(this.gl, 0, 0, 0);

    this.fxaaFBOBuffer = twgl.createFramebufferInfo(this.gl, undefined, this.gl.canvas.clientWidth, this.gl.canvas.clientHeight);
    twgl.bindFramebufferInfo(this.gl, null);

    // Scene
    this.level = new Level(this.gl);
    this.levelBufferInfo = this.level.constructBuffers(this.gl);

    // Shaders
    levelShader.setup(this.gl, this.sharedUniforms);
    postprocessShader.setup(this.gl, this.sharedUniforms);

    // Shared Shader Uniforms Init
    this.sharedUniforms = {
      u_projection: this.projection,
      u_view: this.camera.view,
      u_model: mat4.identity(),
      u_viewportSize: [this.gl.canvas.clientWidth, this.gl.canvas.clientHeight],
      u_texture: this.fxaaFBOBuffer.attachments[0],
    };

  }

  render() {
    let gl = this.gl;
    this.time = this.time + 1 || 0;

    if(window.game.fxaa) {
      twgl.bindFramebufferInfo(gl, this.fxaaFBOBuffer);
    }

    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.cullFace(gl.BACK);
    gl.enable(gl.DEPTH_TEST);

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let projection = this.projection;
    let view = this.camera.view;
    let model = mat4.identity();

    this.sharedUniforms.u_projection = projection;
    this.sharedUniforms.u_view = view;
    this.sharedUniforms.u_model = mat4.identity();

    this.level.render(gl, levelShader, this.sharedUniforms);

    if(window.game.fxaa) {
      twgl.bindFramebufferInfo(gl, null);
      gl.clearColor(0, 0.0, 0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(postprocessShader.program);

      twgl.setBuffersAndAttributes(gl, postprocessShader.programInfo, this.displayBuffer);
      this.sharedUniforms['u_texture'] = this.fxaaFBOBuffer.attachments[0];
      postprocessShader.uniforms = this.sharedUniforms;

      twgl.drawBufferInfo(gl, this.displayBuffer);
    }

    requestAnimationFrame(this.render.bind(this));
  }

  setupEvents() {
    let canvas = this.gl.canvas;

    // Pointerlock support
    {
      canvas.requestPointerLock = canvas.requestPointerLock ||
          canvas.mozRequestPointerLock;

      document.exitPointerLock = document.exitPointerLock ||
          document.mozExitPointerLock;

      canvas.onclick = () => {
        canvas.requestPointerLock();
      };

      // Hook pointer lock state change events for different browsers
      document.addEventListener('pointerlockchange', this.handlePointerlock.bind(this, canvas), false);
      document.addEventListener('mozpointerlockchange', this.handlePointerlock.bind(this, canvas), false);
    }
  }

  handleMouseMove(e) {
    let front = this.sceneSettings.camera.front;

    front[0] -= e.movementX * 0.001;
    front[1] -= e.movementY * 0.001;

    if(front[0] < -Math.PI)
      front[0] += Math.PI * 2;
    else if(front[0] > Math.PI)
      front[0] -= Math.PI * 2;

    if(front[1] < (-Math.PI / 2) + 0.1)
      front[1] = (-Math.PI / 2) + 0.1;
    if(front[1] > (Math.PI / 2) - 0.1)
      front[1] = (Math.PI / 2) - 0.1;

    let newLookAt = vec3.create();
    newLookAt[0] = Math.sin(front[0]) * Math.cos(front[1]);
    newLookAt[1] = Math.sin(front[1]);
    newLookAt[2] = Math.cos(front[0]) * Math.cos(front[1]);

    vec3.add(this.sceneSettings.camera.position, newLookAt, this.sceneSettings.camera.target);

    this.camera.cameraInfo = this.camera;
  }

  handlePointerlock(canvas) {
    let boundMove = this.handleMouseMove.bind(this);

    if (document.pointerLockElement === canvas ||
        document.mozPointerLockElement === canvas) {
      console.log('The pointer lock status is now locked');
      document.addEventListener("mousemove", this.handleMouseMove, false);
    } else {
      console.log('The pointer lock status is now unlocked');
      document.removeEventListener("mousemove", this.handleMouseMove, false);
    }
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