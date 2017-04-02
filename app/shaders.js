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
    attribute vec2 a_texcoord;
    attribute vec3 a_normal;
    
    uniform mat4 u_projection;
 		uniform mat4 u_view;
    uniform mat4 u_model;
    
    varying vec2 v_texCoord;
    varying vec3 v_normal;
    
    highp mat4 transpose(in highp mat4 inMatrix) {
      highp vec4 i0 = inMatrix[0];
      highp vec4 i1 = inMatrix[1];
      highp vec4 i2 = inMatrix[2];
      highp vec4 i3 = inMatrix[3];
  
      highp mat4 outMatrix = mat4(
                   vec4(i0.x, i1.x, i2.x, i3.x),
                   vec4(i0.y, i1.y, i2.y, i3.y),
                   vec4(i0.z, i1.z, i2.z, i3.z),
                   vec4(i0.w, i1.w, i2.w, i3.w)
                   );
  
      return outMatrix;
  }
    void main() {
      v_texCoord = a_texcoord;

      gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);
      
      // Pass the normal to the fragment shader
      v_normal = mat3(transpose(u_projection)) * a_normal;
    }
    
`,
`
    precision mediump float;
    varying vec2 v_texCoord;
    varying vec3 v_normal;
    
    uniform sampler2D u_texture;
    
    void main() {
      vec3 tempLightDirection = vec3(0.9, 0.5, 0.5);
      vec3 normal = normalize(v_normal);
    
      float lightIntensity = dot(normal, tempLightDirection);
    
      vec4 diffuseColor = texture2D(u_texture, v_texCoord);
      
      gl_FragColor = diffuseColor;
      
      gl_FragColor.rgb *= clamp(lightIntensity, 0.3, 0.8);
    }
`);