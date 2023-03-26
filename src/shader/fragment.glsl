uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.141592653589793238;

// NOISE
float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

float lines(vec2 uv, float offset){
    return smoothstep(
        0., 0.5 + offset, 
        abs(0.5*(sin(uv.x * 3.5) + offset*2.))
    );
}

mat2 rotate2D(float angle){
    return mat2(
        cos(angle), -sin(angle), 
        sin(angle), cos(angle)
    );
}

void main(){
    float n = noise(vPosition +time*0.5);

    vec3 baseFirst = vec3(120./255., 158./255., 113./255.);
    vec3 accent = vec3(0., 0., 0.);
    vec3 baseSecond = vec3(224./255., 148./255., 66./255.);
    vec3 lila = vec3(221./255., 214./255., 243./255.);
    vec3 yellow = vec3(225./255., 242./255., 204./255.);
    vec3 green = vec3(221./255., 239./255., 187./255.);
    vec3 orange = vec3(242./255., 162./255., 77./255.);
    vec3 blue = vec3(111./255., 168./255., 220./255.);
    vec3 pink = vec3(255./255., 183./255., 218./255.);
    vec3 darkOrange = vec3(180./255., 95./255., 6./255.);
    vec3 lightOrange = vec3(249./255., 203./255., 156./255.);
    vec3 white = vec3(255., 255., 255.);




    vec2 baseUV = rotate2D(n)* vPosition.xy;
    float basePattern = lines(baseUV, 0.5);
    float secondPattern = lines(baseUV, 0.1);

    vec3 baseColor = mix(blue, orange, basePattern);
    vec3 secondBaseColor = mix(baseColor, darkOrange, secondPattern);

    gl_FragColor = vec4(vec3(secondBaseColor), 1.);
}
