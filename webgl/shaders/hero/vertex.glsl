uniform vec2 uOffset;
uniform vec2 uResolution;
uniform float uStrength;

varying vec2 vUv;
varying vec2 vUvR;
varying vec2 vUvB;


void main() {
  vec4 pos = modelViewMatrix * vec4( position, 1.0 );

  vUv = uv;

  vec2 shift = vec2(uOffset.x * uStrength, uOffset.y * uStrength) * vec2(1.0, uResolution.x / uResolution.y);

  vUvR = uv + shift;
  vUvB = uv - shift;

  gl_Position = projectionMatrix * pos;
}
