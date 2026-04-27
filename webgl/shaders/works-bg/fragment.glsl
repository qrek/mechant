uniform sampler2D uMask;
uniform vec2 uScale;
uniform float uHover;
uniform float uStatus;
uniform float uOpacity;
uniform float uVisibility;

varying vec2 vUv;

vec2 computeUV( in vec2 uv, in float k, in float kcube ){
  vec2 t = uv - .5;
  float r2 = t.x * t.x + t.y * t.y;
  float f = 0.;

  if( kcube == 0.0){
    f = 1. + r2 * k;
  }else{
    f = 1. + r2 * ( k + kcube * sqrt( r2 ) );
  }

  vec2 nUv = f * t + .5;
  nUv.y = nUv.y;

  return nUv;
}

void main()	{
  vec4 color = vec4(1., 1., 1., 1.);

  float k = .0;
  float kcube = .1 * uHover;

  vec2 computedUV = computeUV(vUv, k, kcube);

  vec2 maskUV = vUv * (1. - uHover) + computeUV(vUv, k, kcube) * uHover;

  color.a *= texture2D(uMask, maskUV).g;

  if (maskUV.x < 0.0 || maskUV.x > 1.0 || maskUV.y < 0.0 || maskUV.y > 1.0) discard;

  gl_FragColor = vec4(color.rgb, color.a * uStatus * uOpacity * uVisibility);
}
