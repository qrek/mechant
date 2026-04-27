uniform sampler2D uTexture;
uniform sampler2D uMask;
uniform vec2 uResolution;
uniform vec2 uViewport;
uniform vec2 uScale;
uniform vec2 uMouse;
uniform float uStatus;
uniform float uOpacity;
uniform float uHover;
uniform float uMouseDistance;

varying vec2 vUv;
varying float vNoise;
varying vec3 vPosition;

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

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

vec4 toLinear(vec4 sRGB)
{
  bvec4 cutoff = lessThan(sRGB, vec4(0.04045));
  vec4 higher = pow((sRGB + vec4(0.055))/vec4(1.055), vec4(2.4));
  vec4 lower = sRGB/vec4(12.92);

  return mix(higher, lower, cutoff);
}

void main()	{
  vec2 st = vec2(
    min((uScale.x / uScale.y) / (uResolution.x / uResolution.y), 1.),
    min((uScale.y / uScale.x) / (uResolution.y / uResolution.x), 1.)
  );

  vec2 newUV = vec2(vUv.x * st.x + (1. - st.x) * .5, vUv.y * st.y + (1. - st.y) * .5);

  float k = .0;
  float kcube = .2 * uHover;

  vec2 computedUV = computeUV(newUV, k, kcube);

  float dist = distance(vPosition.xy, uMouse.xy * .5 * uViewport);
  float prox = 1. - map(dist, 0., 1.35, 0., 1.);
  prox = clamp( prox, 0., 1.0 );

  vec2 shiftUV = vPosition.xy + uMouse.xy * .5 * uViewport;

  vec2 finalUV = mix(computedUV, shiftUV, prox * .01 * uHover);

  float r = texture2D(uTexture, finalUV.xy += (((prox *.1) * 0.25) * uHover) * uMouseDistance).r;
  float g = texture2D(uTexture, finalUV.xy += (((prox *.1) * -.2) * uHover) * uMouseDistance).g;
  float b = texture2D(uTexture, finalUV.xy += (((prox *.1) * -.05) * uHover) * uMouseDistance).b;

  float a = texture2D(uTexture, finalUV).a;

  vec4 color = vec4(r, g, b, a);

  vec2 maskUV = vUv * (1. - uHover) + computeUV(vUv, k, kcube) * uHover;

  color.a *= texture2D(uMask, maskUV).g;

  if (maskUV.x < 0.0 || maskUV.x > 1.0 || maskUV.y < 0.0 || maskUV.y > uStatus) discard;

  vec4 finalColor = toLinear(color);

  gl_FragColor = vec4(finalColor.rgb, finalColor.a * uStatus * uOpacity);
}
