import twgl from 'twgl.js/dist/3.x/twgl-full'

export default class Shader {

  constructor(vert, frag) {
    this.programInfo = null;
    this.vert = vert;
    this.frag = frag;
  }

  setup(gl, uniformBindings = {}) {
    this.programInfo = twgl.createProgramInfo(gl, [this.vert, this.frag]);

    this.uniforms = uniformBindings;
  }

  set uniforms(uniformBindings) {
    this.uniformBindings = uniformBindings;
    twgl.setUniforms(this.programInfo, this.uniformBindings);
  }

  get program() {
    let program = null;
    if(this.programInfo) {
      program = this.programInfo.program;
    }

    return program;
  }
}

// Shader Instances

// Generic
export let generic = new Shader(
`
    attribute vec3 a_position;
    
    uniform mat4 u_projection;
 		uniform mat4 u_view;
    uniform mat4 u_model;
    
    varying vec3 position;
    
    void main() {
      gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);
      position = a_position;
    }
`,
`
    precision mediump float;
    varying vec3 position;
    
    void main() {
      
      gl_FragColor = vec4(position, 1.0);
    }
`);