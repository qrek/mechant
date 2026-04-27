uniform float uStrength;
uniform float uPower;
uniform vec2 uScale;
uniform vec2 uViewport;

varying vec2 vUv;

void main() {
  vec4 pos = modelViewMatrix * vec4( position, 1.0 );

//  pos.z += sin(pos.y / uViewport.y * PI + PI / 2.0) * (uPower * uStrength);
  pos.z += sin(pos.x / uViewport.x * PI + PI / 2.0) * (uPower * uStrength);

  vUv = uv;

  gl_Position = projectionMatrix * pos;
}
