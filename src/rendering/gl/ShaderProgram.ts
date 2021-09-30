import {vec4, vec3, mat4} from 'gl-matrix';
import Drawable from './Drawable';
import {gl} from '../../globals';

var activeProgram: WebGLProgram = null;

export class Shader {
  shader: WebGLShader;

  constructor(type: number, source: string) {
    this.shader = gl.createShader(type);
    gl.shaderSource(this.shader, source);
    gl.compileShader(this.shader);

    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(this.shader);
    }
  }
};

class ShaderProgram {
  prog: WebGLProgram;

  attrPos: number;
  attrNor: number;
  attrCol: number;

  unifModel: WebGLUniformLocation;
  unifModelInvTr: WebGLUniformLocation;
  unifViewProj: WebGLUniformLocation;
  unifColor: WebGLUniformLocation;
  unifTime: WebGLUniformLocation;
  unifHeightsInfo: WebGLUniformLocation;
  unifCamPos: WebGLUniformLocation;
  unifShader: WebGLUniformLocation;
  unifOctave: WebGLUniformLocation;
  unifBias: WebGLUniformLocation;
  unifFreq: WebGLUniformLocation;
  unifHeight: WebGLUniformLocation;
  unifSpeed: WebGLUniformLocation;

  constructor(shaders: Array<Shader>) {
    this.prog = gl.createProgram();

    for (let shader of shaders) {
      gl.attachShader(this.prog, shader.shader);
    }
    gl.linkProgram(this.prog);
    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(this.prog);
    }

    this.attrPos = gl.getAttribLocation(this.prog, "vs_Pos");
    this.attrNor = gl.getAttribLocation(this.prog, "vs_Nor");
    this.attrCol = gl.getAttribLocation(this.prog, "vs_Col");
    this.unifModel      = gl.getUniformLocation(this.prog, "u_Model");
    this.unifModelInvTr = gl.getUniformLocation(this.prog, "u_ModelInvTr");
    this.unifViewProj   = gl.getUniformLocation(this.prog, "u_ViewProj");
    this.unifColor      = gl.getUniformLocation(this.prog, "u_Color");
    this.unifTime       = gl.getUniformLocation(this.prog, "u_Time");
    this.unifHeightsInfo  = gl.getUniformLocation(this.prog, "u_HeightsInfo");
    this.unifCamPos       = gl.getUniformLocation(this.prog, "u_CamPos");
    this.unifShader = gl.getUniformLocation(this.prog, "u_Shader");

    this.unifOctave = gl.getUniformLocation(this.prog, "u_Octave");
    this.unifBias = gl.getUniformLocation(this.prog, "u_Bias");
    this.unifFreq = gl.getUniformLocation(this.prog, "u_Freq");
    this.unifHeight = gl.getUniformLocation(this.prog, "u_Height");
    this.unifSpeed = gl.getUniformLocation(this.prog, "u_Speed");
  }

  use() {
    if (activeProgram !== this.prog) {
      gl.useProgram(this.prog);
      activeProgram = this.prog;
    }
  }

  setModelMatrix(model: mat4) {
    this.use();
    if (this.unifModel !== -1) {
      gl.uniformMatrix4fv(this.unifModel, false, model);
    }

    if (this.unifModelInvTr !== -1) {
      let modelinvtr: mat4 = mat4.create();
      mat4.transpose(modelinvtr, model);
      mat4.invert(modelinvtr, modelinvtr);
      gl.uniformMatrix4fv(this.unifModelInvTr, false, modelinvtr);
    }
  }

  setViewProjMatrix(vp: mat4) {
    this.use();
    if (this.unifViewProj !== -1) {
      gl.uniformMatrix4fv(this.unifViewProj, false, vp);
    }
  }

  setGeometryColor(color: vec4) {
    this.use();
    if (this.unifColor !== -1) {
      gl.uniform4fv(this.unifColor, color);
    }
  }

  setTime(t: number) {
    this.use();
    if (this.unifTime !== -1) {
      gl.uniform1f(this.unifTime, t);
    }
  }

  setHeightsInfo(heightsInfo: vec4){
    this.use();
    if (this.unifHeightsInfo !== -1)
      gl.uniform4fv(this.unifHeightsInfo, heightsInfo);
  }

  setCamInfo(camPos: vec3) {
    this.use();
    if (this.unifCamPos !== -1) {
      gl.uniform3fv(this.unifCamPos, camPos);
    }
  }

  setShader(Shader: number) {
    this.use();
    if (this.unifShader !== -1) {
        gl.uniform1i(this.unifShader, Shader);
    }
  }

  setOctaves(octaves: number) {
    this.use();
    if (this.unifShader !== -1) {
        gl.uniform1i(this.unifOctave, octaves);
    }
  }

  setBias(Bias: number) {
    this.use();
    if (this.unifShader !== -1) {
        gl.uniform1f(this.unifBias, Bias);
    }
  }

  setFrequency(frequency: number) {
    this.use();
    if (this.unifShader !== -1) {
        gl.uniform1f(this.unifFreq, frequency);
    }
  }

  setTerrainHeight(height: number) {
    this.use();
    if (this.unifShader !== -1) {
        gl.uniform1f(this.unifHeight, height);
    }
  }

  setSpeed(speed: number) {
    this.use();
    if (this.unifShader !== -1) {
        gl.uniform1f(this.unifSpeed, speed);
    }
  }

  draw(d: Drawable) {
    this.use();

    if (this.attrPos != -1 && d.bindPos()) {
      gl.enableVertexAttribArray(this.attrPos);
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
    }

    if (this.attrNor != -1 && d.bindNor()) {
      gl.enableVertexAttribArray(this.attrNor);
      gl.vertexAttribPointer(this.attrNor, 4, gl.FLOAT, false, 0, 0);
    }

    d.bindIdx();
    gl.drawElements(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0);

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
    if (this.attrNor != -1) gl.disableVertexAttribArray(this.attrNor);
  }
};

export default ShaderProgram;
