import { glsl } from "./main";

export const monoOxide = glsl`float scene(vec3 pos) {
	float s1 = length(pos) - 1.;
    // you can use the variable 'u_time' to access the time
    vec3 s2Pos = pos - vec3(cos(u_time), sin(u_time), 0)*2.;  
	float s2 = length(s2Pos) - 0.25;

	return min(s1, s2);
}
vec3 sceneCol(vec3 pos) {
	float s1 = length(pos) - 1.;
    vec3 s2Pos = pos - vec3(cos(u_time), sin(u_time), 0)*2.;
	float s2 = length(s2Pos) - 0.25;

	if(s1 > s2) {
		return vec3(1,0,0);
	} else {
		return vec3(0.6);
	}
}`

export const megnerSponge = glsl`#define DETAIL_ITER 2

// You can also define seperate SDF functions and then 
// use them inside the dis and color functions
float SDFbox(vec3 p, vec3 b)
{
    vec3 q = abs(p) - b;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float SDFmengerSponge(vec3 pos, float os) {
    float b = SDFbox(pos, vec3(os, os, os));
    float s = os/3.;

    float c = os/3.;
    vec3 pmod;

    for (int i = 0; i < DETAIL_ITER; i++) {
        s /= 3.;
        pmod = mod(pos + c, c * 2.) - c;
        b = max(b, -SDFbox(pmod, vec3(os, s, s)));
        b = max(b, -SDFbox(pmod, vec3(s, os, s)));
        b = max(b, -SDFbox(pmod, vec3(s, s, os)));
        c /= 3.;
    }

    s = os / 3.;
    os += 1.;

    b = max(b, -SDFbox(pos, vec3(os, s, s)));
    b = max(b, -SDFbox(pos, vec3(s, os, s)));
    b = max(b, -SDFbox(pos, vec3(s, s, os)));

    return b;
}

float scene(vec3 pos) {
	return SDFmengerSponge(pos, 1.);
}
vec3 sceneCol(vec3 pos) {
	return vec3(1);
}`

export const infiniteSpheres = glsl`float scene(vec3 pos) {
    return length(mod(pos, 5.)-2.5) - 1.;
}
// from https://iquilezles.org/articles/normalsSDF/
vec3 PointNormal(vec3 pos) 
{
	vec3 n = vec3(0, 0, 0);
	vec3 e;
	for(int i = 0; i < 4; i++) {
		e = 0.5773 * 
            (
                2.0 * vec3((((i + 3) >> 1) & 1), 
                ((i >> 1) & 1), 
                (i & 1)) - 1.0
            );
		n += e * scene(pos + e * u_eps);
	}
	return normalize(n);
}
vec3 sceneCol(vec3 pos) {
    return PointNormal(pos);
}`

export const howTo = glsl`float scene(vec3 pos) {
    // In this function you want to return the distance from 
    // the position to the object.
    // For example, if you want to create a sphere
    //  at the origin with radius 1, you would do:
    return distance(pos, vec3(0,0,0)) - 1.0; 
    // or length(pos) - 1.
}
vec3 sceneCol(vec3 pos) {
    // In this function you want to return
    // the color of the object at the position.
    // For example, if you want to color the sphere red, 
    // you would do:
    return vec3(1,0,0);
}`