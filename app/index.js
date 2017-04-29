import twgl from 'twgl.js/dist/3.x/twgl-full';

const mat4 = twgl.m4;
const vec3 = twgl.v3;

// Class imports
import Camera from './camera';
import Level from './level';
import Input from './input';

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
      premultipliedAlpha: false,
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

    // this.gl.enable(this.gl.BLEND);
    // this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.gl.getExtension('OES_standard_derivatives');
    this.gl.getExtension('EXT_shader_texture_lod');

    let fps = 95.0;

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
        lockY: true,
      },
      display: {
        fps: fps,
        step: 1 / fps,
        dt: 0,
        last: Game.timestamp(),
      },
      arrowCodes: {
        37: "left",
        38: "up",
        39: "right",
        40: "down",
        87: "w",
        83: "s",
        68: "d",
        65: "a",
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

  static timestamp() {
    if (window.performance && window.performance.now)
      return window.performance.now();
    else
      return new Date().getTime();
  }

  gameLoop() {
    let now = Game.timestamp();
    let step = this.sceneSettings.display.step;
    let last = this.sceneSettings.display.last;

    let dt = this.sceneSettings.display.dt + Math.min(1, (now - last) / 1000);
    while(dt > step) {
      dt = dt - this.sceneSettings.display.step;
      this.update(step);
    }

    this.render(this.sceneSettings.display.dt);

    this.sceneSettings.display.dt = dt;
    this.sceneSettings.display.last = now;


    requestAnimationFrame(this.gameLoop.bind(this));
  }

  update(dt) {
    let currentPos = this.camera.position;
    let moveVector = this.movementVector(10.0, dt);

    let moveVectorX = moveVector.slice(0);
    let moveVectorZ = moveVector.slice(0);

    moveVectorX[1] = moveVectorX[2] = 0;
    moveVectorZ[0] = moveVectorZ[1] = 0;

    let tempPosX = vec3.add(currentPos, moveVectorX, []);
    let tempPosZ = vec3.add(currentPos, moveVectorZ, []);

    let collisionX = this.level.collision(tempPosX);
    let collisionZ = this.level.collision(tempPosZ);

    if(collisionX) moveVector[0] = 0;
    if(collisionZ) moveVector[2] = 0;

    moveVector[1] = 0;

    this.camera.moveBy(moveVector);
    this.camera.updateVectors(this.sceneSettings.camera.front, this.sceneSettings.camera.up, this.sceneSettings.camera.target);
  }

  movementVector(speed, dt) {
    let moveVector = vec3.create();

    let left     = this.inputHandler.left || this.inputHandler.a;
    let right    = this.inputHandler.right || this.inputHandler.d;
    let forward  = this.inputHandler.up || this.inputHandler.w;
    let backward = this.inputHandler.down || this.inputHandler.s;

    let vel = speed * dt;

    if(forward) {
      let forwardMovement = vec3.mulScalar(this.camera.front, vel);
      vec3.add(moveVector, forwardMovement, moveVector);
    }

    if(backward) {
      let backwardMovement = vec3.mulScalar(this.camera.front, -vel);
      vec3.add(moveVector, backwardMovement, moveVector);
    }

    if(right) {
      vec3.add(moveVector, vec3.mulScalar(this.camera.right, vel), moveVector);
    }

    if(left) {
      vec3.add(moveVector, vec3.mulScalar(this.camera.right, -vel), moveVector);
    }

    return moveVector;
  }

  render(dt) {
    let gl = this.gl;

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
  }

  setupEvents() {
    let canvas = this.gl.canvas;

    // Input Keys
    this.inputHandler = new Input(this.sceneSettings.arrowCodes);

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


    this.camera.updateVectors(front, this.sceneSettings.camera.up);
  }

  handlePointerlock(canvas) {
    this.handleMouseMove.bind(this);

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
gameInstance.gameLoop();