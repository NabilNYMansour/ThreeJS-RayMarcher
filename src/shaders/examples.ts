import { glsl } from "./main";

export const monoOxide = glsl`float GetDis(vec3 pos) {
	float s1 = length(pos) - 1.;
	float s2 = length(pos - vec3(0, 1, 1)) - 0.5;

	return min(s1, s2);
}
vec3 GetAlbedo(vec3 pos) {
	float s1 = length(pos) - 1.;
	float s2 = length(pos - vec3(0, 1, 1)) - 0.5;

	if(s1 > s2) {
		return vec3(1, 1, 1);
	} else {
		return vec3(1, 0, 0);
	}
}
`

export const megnerSponge = glsl`#define DETAIL_ITER 2

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

float GetDis(vec3 pos) {
	float s1 = length(pos) - 1.;
	float s2 = length(pos - vec3(0, 1, 1)) - 0.5;

	return SDFmengerSponge(pos, 1.);
}
vec3 GetAlbedo(vec3 pos) {
	return vec3(1);
}
`