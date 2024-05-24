import * as THREE from 'three';

export const glsl = (x: any) => x[0]; // Dummy function to enable syntax highlighting for glsl code

// Shaders
export const uniformCode = glsl`
precision mediump float;

uniform vec3 u_clearColor;

uniform float u_eps;
uniform float u_maxDis;
uniform int u_maxSteps;

uniform vec3 u_camPos;
uniform mat4 u_camToWorldMat;
uniform mat4 u_camInvProjMat;
uniform float u_camTanFov;
uniform float u_camPlaneSubdivisions;

uniform vec3 u_lightDir;
uniform vec3 u_lightColor;

uniform float u_diffIntensity;
uniform float u_specIntensity;
uniform float u_shininess;
uniform float u_ambientIntensity;

uniform float u_time;

uniform bool u_useConeMarching;
`;


export const vertCode = glsl`
// to send to fragment shader
out vec2 vUv;
flat out float vDisTravelled;
flat out int vSteps;

void main() {
    // Compute view direction in world space
    vec4 worldPos = modelViewMatrix * vec4(position, 1.0);
    vec3 viewDir = normalize(-worldPos.xyz);

    // Output vertex position
    gl_Position = projectionMatrix * worldPos;

    // Output UV
    vUv = uv;

    // Cone marching
    vDisTravelled = 0.;
    vSteps = 0;
    if (u_useConeMarching) {
        vec3 cro = u_camPos; // cone ray origin
        vec3 crd = (u_camInvProjMat * vec4(uv*2.-1., 0, 1)).xyz; // cone ray direction
        crd = (u_camToWorldMat * vec4(crd, 0)).xyz;
        crd = normalize(crd);
        March result = coneMarch(cro, crd); // cone march
        vDisTravelled = result.dis; // update distance travelled
        vSteps = result.steps; // update steps taken
    }
}`

export const fragCode = glsl`
in vec2 vUv;
flat in float vDisTravelled;
flat in int vSteps;

void main() {
    if (vDisTravelled >= u_maxDis) {
        gl_FragColor = vec4(u_clearColor,1);
        return;
    }
    vec2 uv = vUv.xy;

    vec3 ro = u_camPos;
    vec3 rd = (u_camInvProjMat * vec4(uv*2.-1., 0, 1)).xyz;
    rd = (u_camToWorldMat * vec4(rd, 0)).xyz;
    rd = normalize(rd);

    float disTravelled = RayMarch(vDisTravelled, vSteps, ro, rd); // use normalized ray
    vec3 hp = ro + disTravelled * rd;
    vec3 n = GetNormal(hp);

    if (disTravelled >= u_maxDis) { // if ray doesn't hit anything
        gl_FragColor = vec4(u_clearColor* (u_useConeMarching ? 2. : 1.),1);
    } else { // if ray hits something
        float dotNL = dot(n, u_lightDir);
        float diff = max(dotNL, 0.0) * u_diffIntensity;
        float spec = pow(diff, u_shininess) * u_specIntensity;
        float ambient = u_ambientIntensity;

        vec3 color = u_lightColor * (sceneCol(hp) * (spec + ambient + diff));
        gl_FragColor = vec4(color,1);
    }
}
`;

export const checkShaderComplied = (vertCode: string, fragCode: string): { compiled: boolean, errorInfoList: string[] } => {
    // Disable console logs from three.js
    const log = console.log;
    console.log = () => { };
    const warn = console.warn;
    console.warn = () => { };
    const error = console.error;
    console.error = () => { };

    const tempMaterial = new THREE.ShaderMaterial({
        vertexShader: vertCode,
        fragmentShader: fragCode,

    });

    const tempRenderer = new THREE.WebGLRenderer();
    const tempScene = new THREE.Scene();
    const tempCamera = new THREE.PerspectiveCamera();

    const tempMesh = new THREE.Mesh(new THREE.PlaneGeometry(), tempMaterial);

    tempScene.add(tempMesh);

    let compiled = true;

    tempRenderer.render(tempScene, tempCamera);

    let errorInfo = ""

    if (tempRenderer.info.programs) {
        tempRenderer.info.programs.forEach((program: any) => {
            if (program.diagnostics && !program.diagnostics.runnable) {
                errorInfo += program.diagnostics.fragmentShader.log;
                compiled = false;
            }
        });
    }

    tempRenderer.dispose();
    tempMaterial.dispose();

    // Enable console logs
    console.log = log;
    console.warn = warn;
    console.error = error;

    // Modify errorInfo to show correct line numbers
    let errorInfoList = errorInfo.split("\n");
    if (errorInfo !== "") {
        const lines = 220; // done manually
        const regex = /ERROR: (\d+):(\d+)/;
        errorInfoList = errorInfoList.slice(0, errorInfoList.length - 1);
        errorInfoList = errorInfoList.map(
            (error: string) => "> " + error.replace(regex, (_, p1, p2) => "ERROR: " + p1 + ":" + (parseInt(p2, 10) - lines))
        );
    }

    return { compiled: compiled, errorInfoList: errorInfoList };
}