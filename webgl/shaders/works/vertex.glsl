uniform float uStrength;
uniform float uPower;
uniform vec2 uScale;
uniform vec2 uViewport;

varying vec2 vUv;
varying float vNoise;
varying vec3 vPosition;

void main() {
  vec4 pos = modelViewMatrix * vec4( position, 1.0 );

  float dist = distance(uv, vec2(0.5));

  pos.z += cos(pos.y / uViewport.y * PI + PI / 2.0) * (uPower * uStrength);
  pos.z += sin(pos.x / uViewport.x * PI + PI / 2.0) * (uPower * uStrength);

  vUv = uv;
  vNoise = dist;
  vPosition = pos.xyz;

  gl_Position = projectionMatrix * pos;
}
