import { glsl } from "./main";

export const rayMarcher = glsl`
float rayMarch(float startDis, int stepsTaken, vec3 ro, vec3 rdn)
{
    float d = startDis;
    float cd;
    vec3 p;

    for (int i = stepsTaken; i < u_maxSteps; ++i) {
        p = ro + d * rdn;
        cd = scene(p);

        if (cd < u_eps || d >= u_maxDis) break;
        d += cd;
    }

    return d;
}
`

export const coneMarcher = glsl`
struct March {
    float dis;
    int steps;
};
March coneMarch(vec3 cro, vec3 crd)
{
    float d = 0.; // total distance travelled
    float cd; // current scene distance
    float ccr; // current cone radius
    vec3 p; // current position of ray
    int i = 0; // steps iter

    for (;i < u_maxSteps; ++i) { // main loop
        p = cro + d * crd; // calculate new position
        cd = scene(p); // get scene distance
        ccr = (d * u_camTanFov) / 16.; // calculate cone radius
        
        // if current distance is less than cone radius with some padding or our distance is too big, break loop
        if (cd < ccr*1.25 || d >= u_maxDis) break;

        // otherwise, add new scene distance to total distance
        d += cd;
    }

    return March(d, i); // finally, return scene distance
}
`

export const other = glsl`
//---------------Get normal of SDF---------------//
vec3 sceneNormal(vec3 p) // from https://iquilezles.org/articles/normalsSDF/
{
	vec3 n = vec3(0, 0, 0);
	vec3 e;
	for(int i = 0; i < 4; i++) {
		e = 0.5773 * (2.0 * vec3((((i + 3) >> 1) & 1), ((i >> 1) & 1), (i & 1)) - 1.0);
		n += e * scene(p + e * u_eps);
	}
	return normalize(n);
}
`