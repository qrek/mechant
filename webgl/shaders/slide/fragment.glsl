uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uScale;

uniform vec2 uOffsetR;
uniform vec2 uOffsetG;
uniform vec2 uOffsetB;

varying vec2 vUv;

vec3 rgbShift(sampler2D tImage, vec2 uv, vec2 offsetR, vec2 offsetG, vec2 offsetB) {
  float r = texture2D(tImage, uv + offsetR).r;
  float g = texture2D(tImage, uv + offsetG).g;
  float b = texture2D(tImage, uv + offsetB).b;

  return vec3(r,g,b);
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

  vec3 color = rgbShift( uTexture, newUV, uOffsetR, uOffsetG, uOffsetB );
//  if (diffuseColor.a < 1.0) discard;
//
//  if (newUV.x < 0.0 || newUV.x > 1.0 || newUV.y < 0.0 || newUV.y > 1.0) discard;

  gl_FragColor = toLinear(vec4(color, 1.0));
}
