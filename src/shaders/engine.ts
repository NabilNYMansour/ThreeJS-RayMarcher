import { glsl } from "./main";

export const marcher = glsl`
//---------------Main marcher---------------//
struct March {
    float disTravelled;
    int steps;
};
March RayMarch(vec3 ro, vec3 rdn)
{
    float d = 0.;
    float cd;
    vec3 p;
    float eps = u_eps;

    March m;
    int i = 0;
    for (; i < u_maxSteps; ++i) {
        p = ro + d * rdn;
        cd = GetDis(p);

        if (d >= u_maxDis) {
            d = u_maxDis;
            break;
        }

        if (cd < 0.) { // Quick hack
            d += cd * 10.;
        }
        else {
            if (cd < eps) break;
            d += cd;
        }
    }

    m.disTravelled = d;
    m.steps = i;
    return m;
}
`

export const utils = glsl`
//---------------Utils---------------//
float gt(float v1, float v2)
{
    return step(v2, v1);
}
float lt(float v1, float v2)
{
    return step(v1, v2);
}
float between(float val, float start, float end)
{
    return gt(val, start) * lt(val, end);
}
float eq(float v1, float v2, float e)
{
    return between(v1, v2 - e, v2 + e);
}
float s_gt(float v1, float v2, float e)
{
    return smoothstep(v2 - e, v2 + e, v1);
}
float s_lt(float v1, float v2, float e)
{
    return smoothstep(v1 - e, v1 + e, v2);
}
float s_between(float val, float start, float end, float epsilon)
{
    return s_gt(val, start, epsilon) * s_lt(val, end, epsilon);
}
float s_eq(float v1, float v2, float e, float s_e)
{
    return s_between(v1, v2 - e, v2 + e, s_e);
}

//---------------Space folding---------------//
////////////////////////////////////////////////////////////////////
/// From https://github.com/HackerPoet/PySpace but slightly edited.
////////////////////////////////////////////////////////////////////
void planeFold(inout vec4 z, vec3 n, float d) {
    z.xyz -= 2.0 * min(0.0, dot(z.xyz, n) - d) * n;
}
void absFold(inout vec4 z, vec3 c) {
    z.xyz = abs(z.xyz - c) + c;
}
void sierpinskiFold(inout vec4 z) {
    z.xy -= min(z.x + z.y, 0.0);
    z.xz -= min(z.x + z.z, 0.0);
    z.yz -= min(z.y + z.z, 0.0);
}
void mengerFold(inout vec4 z) {
    float a = min(z.x - z.y, 0.0);
    z.x -= a;
    z.y += a;
    a = min(z.x - z.z, 0.0);
    z.x -= a;
    z.z += a;
    a = min(z.y - z.z, 0.0);
    z.y -= a;
    z.z += a;
}
float sphereFold(vec4 z, float minR, float maxR, float bloatFactor) { // bloat = 1 will not change size.
    float r2 = dot(z.xyz, z.xyz);
    return max(maxR / max(minR, r2), bloatFactor);
}
float spikeySphereFold(vec4 z, float minR, float maxR, float bloatFactor, float spikeFactor) {
    float r2 = dot(z.xyz, z.xyz);
    r2 = r2 * spikeFactor + max(abs(z.x), max(abs(z.y), abs(z.z))) * (1.0 - spikeFactor);
    return max(maxR / max(minR, r2), bloatFactor);
}
void boxFold(inout vec4 z, vec3 r) {
    z.xyz = clamp(z.xyz, -r, r) * 2.0 - z.xyz;
}
void rotX(inout vec4 z, float s, float c) {
    z.yz = vec2(c * z.y + s * z.z, c * z.z - s * z.y);
}
void rotY(inout vec4 z, float s, float c) {
    z.xz = vec2(c * z.x - s * z.z, c * z.z + s * z.x);
}
void rotZ(inout vec4 z, float s, float c) {
    z.xy = vec2(c * z.x + s * z.y, c * z.y - s * z.x);
}
void rotX(inout vec4 z, float a) {
    rotX(z, sin(a), cos(a));
}
void rotY(inout vec4 z, float a) {
    rotY(z, sin(a), cos(a));
}
void rotZ(inout vec4 z, float a) {
    rotZ(z, sin(a), cos(a));
}

//---------------Distance estimators---------------//
////////////////////////////////////////////////
/// From https://github.com/HackerPoet/PySpace.
////////////////////////////////////////////////
float de_box3(vec3 p, vec3 b)
{
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}
float de_sphere(vec4 p, float r) {
    return (length(p.xyz) - r) / p.w;
}
float de_box(vec4 p, vec3 s) {
    vec3 a = abs(p.xyz) - s;
    return (min(max(max(a.x, a.y), a.z), 0.0) + length(max(a, 0.0))) / p.w;
}
float de_tetrahedron(vec4 p, float r) {
    float md = max(max(-p.x - p.y - p.z, p.x + p.y - p.z),
        max(-p.x + p.y + p.z, p.x - p.y + p.z));
    return (md - r) / (p.w * sqrt(3.0));
}
float de_inf_cross(vec4 p, float r) {
    vec3 q = p.xyz * p.xyz;
    return (sqrt(min(min(q.x + q.y, q.x + q.z), q.y + q.z)) - r) / p.w;
}
float de_inf_cross_xy(vec4 p, float r) {
    vec3 q = p.xyz * p.xyz;
    return (sqrt(min(q.x, q.y) + q.z) - r) / p.w;
}
float de_inf_line(vec4 p, vec3 n, float r) {
    return (length(p.xyz - n * dot(p.xyz, n)) - r) / p.w;
}
`

export const other = glsl`
//---------------Get normal of SDF---------------//
vec3 GetNormal(vec3 pos) // from https://iquilezles.org/articles/normalsSDF/
{
	vec3 n = vec3(0, 0, 0);
	vec3 e;
	for(int i = 0; i < 4; i++) {
		e = 0.5773 * (2.0 * vec3((((i + 3) >> 1) & 1), ((i >> 1) & 1), (i & 1)) - 1.0);
		n += e * GetDis(pos + e * u_eps);
	}
	return normalize(n);
}
`