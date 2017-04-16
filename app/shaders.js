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
// FXAA
export let postprocessShader = new Shader(
`

  attribute vec3 a_position;

  void main(void)
  {
    gl_Position = vec4(a_position, 1.0);
  }
`,
`
  precision highp float;
  uniform sampler2D u_texture;
  uniform vec2 u_viewportSize;
  
  /* Basic FXAA implementation based on the code on geeks3d.com with the
     modification that the texture2DLod stuff was removed since it's
     unsupported by WebGL. */
  
  #define FXAA_REDUCE_MIN   (1.0/ 256.0)
  #define FXAA_REDUCE_MUL   (1.0 / 16.0)
  #define FXAA_SPAN_MAX     16.0
  
  vec4 applyFXAA(vec2 fragCoord, sampler2D tex)
  {
      vec4 color;
      vec2 inverseVP = vec2(1.0 / u_viewportSize.x, 1.0 / u_viewportSize.y);
      vec3 rgbNW = texture2D(tex, (fragCoord + vec2(-1.0, -1.0)) * inverseVP).xyz;
      vec3 rgbNE = texture2D(tex, (fragCoord + vec2(1.0, -1.0)) * inverseVP).xyz;
      vec3 rgbSW = texture2D(tex, (fragCoord + vec2(-1.0, 1.0)) * inverseVP).xyz;
      vec3 rgbSE = texture2D(tex, (fragCoord + vec2(1.0, 1.0)) * inverseVP).xyz;
      vec3 rgbM  = texture2D(tex, fragCoord  * inverseVP).xyz;
      vec3 luma = vec3(0.299, 0.587, 0.114);
      float lumaNW = dot(rgbNW, luma);
      float lumaNE = dot(rgbNE, luma);
      float lumaSW = dot(rgbSW, luma);
      float lumaSE = dot(rgbSE, luma);
      float lumaM  = dot(rgbM,  luma);
      float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
      float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));
      
      vec2 dir;
      dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
      dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));
      
      float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *
                            (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);
      
      float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
      dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),
                max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
                dir * rcpDirMin)) * inverseVP;
        
      vec3 rgbA = 0.5 * (
          texture2D(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz +
          texture2D(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz);
      vec3 rgbB = rgbA * 0.5 + 0.25 * (
          texture2D(tex, fragCoord * inverseVP + dir * -0.5).xyz +
          texture2D(tex, fragCoord * inverseVP + dir * 0.5).xyz);
  
      float lumaB = dot(rgbB, luma);
      if ((lumaB < lumaMin) || (lumaB > lumaMax))
          color = vec4(rgbA, 1.0);
      else
          color = vec4(rgbB, 1.0);
      return color;
  }

  void main(void)
  {
      gl_FragColor = applyFXAA(gl_FragCoord.xy, u_texture);
  }
`
);


// Generic
export let levelShader = new Shader(
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
    
`,` #extension GL_EXT_shader_texture_lod : enable
    #extension GL_OES_standard_derivatives : enable
    precision highp float;
    
    varying vec2 v_texCoord;
    varying vec3 v_normal;

    uniform sampler2D u_texture;
  
    void main() {
      vec3 tempLightDirection = vec3(0.9, 0.5, 0.5);
      vec3 normal = normalize(v_normal);
    
      float lightIntensity = dot(normal, tempLightDirection);
    

      vec4 diffuseColor = texture2D(u_texture, v_texCoord);
      
      // if(diffuseColor.a < 0.5) discard;

      gl_FragColor = diffuseColor;
      
      gl_FragColor.rgb *= clamp(lightIntensity, 0.3, 0.9);
    }
`);