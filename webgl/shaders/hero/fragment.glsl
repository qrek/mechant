uniform sampler2D uTexture;
uniform vec2 uOffset;
uniform float uStrength;

varying vec2 vUv;
varying vec2 vUvR;
varying vec2 vUvB;

const int samples = 10;

void main()	{
  vec2 center = vec2(.5, .5);
  float bStart = 1.0;
  float bWidth = 0.05;

  vec2 newUV = vUv - center;
  vec2 newUVR = vUvR - center;
  vec2 newUVB = vUvB - center;

  vec4 color = vec4(0.0);
  vec2 ra = vec2(0.0);
  vec2 ba = vec2(0.0);

  float precompute = bWidth * (1.0 / float(samples - 1)) * uStrength;

  for(int i = 0; i < samples; i++)
  {
    float scale = bStart + (float(i)* precompute);

    color += texture(uTexture, newUV * scale + center);
    ra += texture(uTexture, newUVR * scale + center).ra;
    ba += texture(uTexture, newUVB * scale + center).ba;
  }

  color /= float(samples);
  ra /= float(samples);
  ba /= float(samples);

//  gl_FragColor = vec4(color.rgb,1.);

//  vec3 color = texture2D( uTexture, vUv );
//  vec2 ra = texture2D(uTexture, vUvR).ra;
//  vec2 ba = texture2D(uTexture, vUvB).ba;

  gl_FragColor = vec4(ra.x, color.g, ba.x, max(max(ra.y,ba.y), 1.0));
}
