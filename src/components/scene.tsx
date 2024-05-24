import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { fragCode, uniformCode, vertCode } from '../shaders/main';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { coneMarcher, other, rayMarcher } from '../shaders/engine';

interface SceneProps {
    shaderCode: string;
    isMobile: boolean;
    useConeMarching: boolean;
}

export const Scene = ({ shaderCode, isMobile, useConeMarching }: SceneProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [renderer, setRenderer] = useState<THREE.WebGLRenderer>();
    const material = useRef<THREE.ShaderMaterial>();
    const [resizeFactor, _] = useState<number>(isMobile ? 2 : 1);

    useEffect(() => {
        if (canvasRef.current && renderer) {
            // Create scene, camera, and set renderer
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            renderer.setSize(window.innerWidth / resizeFactor, window.innerHeight / resizeFactor);

            // Set background color
            const backgroundColor = new THREE.Color(0x3399ee);
            renderer.setClearColor(backgroundColor, 1);

            // Position camera
            camera.position.z = 5;

            // Add orbit controls
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.maxDistance = 10;
            controls.minDistance = 2;
            controls.autoRotate = isMobile;
            controls.autoRotateSpeed = 0.5;
            controls.enableDamping = true;

            // Add directional light
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(1, 1, 1);
            scene.add(light);

            // Uniforms
            let uniforms = {
                u_eps: { value: 0.001 },
                u_maxDis: { value: 1000 },
                u_maxSteps: { value: 100 },

                u_clearColor: { value: backgroundColor },

                u_camPos: { value: camera.position },
                u_camToWorldMat: { value: camera.matrixWorld },
                u_camInvProjMat: { value: camera.projectionMatrixInverse },
                u_camPlaneSubdivisions: { value: Math.trunc(camera.aspect * 32) },
                u_camTanFov: { value: Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) },

                u_lightDir: { value: light.position },
                u_lightColor: { value: light.color },

                u_diffIntensity: { value: 0.5 },
                u_specIntensity: { value: 3 },
                u_ambientIntensity: { value: 0.15 },

                u_time: { value: 0 },

                u_shininess: { value: 16 },

                u_useConeMarching: { value: useConeMarching },
            };

            // add screen plane
            let geometry = new THREE.PlaneGeometry(1, 1, Math.trunc(camera.aspect * 32), 32);
            material.current = new THREE.ShaderMaterial({
                vertexShader: uniformCode + shaderCode + coneMarcher + vertCode,
                fragmentShader: uniformCode  + shaderCode + rayMarcher + other + fragCode,
            });
            material.current.uniforms = uniforms;
            const screenPlane = new THREE.Mesh(geometry, material.current);

            // Get the wdith and height of the near plane
            const nearPlaneWidth = camera.near * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect * 2;
            const nearPlaneHeight = nearPlaneWidth / camera.aspect;
            screenPlane.scale.set(nearPlaneWidth, nearPlaneHeight, 1);

            scene.add(screenPlane);

            // Handle window resize
            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();

                const nearPlaneWidth = camera.near * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect * 2;
                const nearPlaneHeight = nearPlaneWidth / camera.aspect;
                screenPlane.scale.set(nearPlaneWidth, nearPlaneHeight, 1);

                geometry.dispose();
                geometry = new THREE.PlaneGeometry(1, 1, Math.trunc(camera.aspect * 32), 32);

                screenPlane.geometry = geometry;
                if (material.current) material.current.uniforms.u_camPlaneSubdivisions.value = Math.trunc(camera.aspect * 32);
                if (renderer) renderer.setSize(window.innerWidth / resizeFactor, window.innerHeight / resizeFactor);
            });

            // Stats
            const stats = new Stats();
            stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
            document.body.appendChild(stats.dom);

            // Render loop
            let cameraForwardPos = new THREE.Vector3(0, 0, -1);
            const VECTOR3ZERO = new THREE.Vector3(0, 0, 0);

            // time start
            let time = Date.now();
            const animate = () => {
                stats.begin();
                requestAnimationFrame(animate);

                // Update screen plane position and rotation
                cameraForwardPos = camera.position.clone().add(camera.getWorldDirection(VECTOR3ZERO).multiplyScalar(camera.near));
                screenPlane.position.copy(cameraForwardPos);
                screenPlane.rotation.copy(camera.rotation);

                if (renderer) {
                    renderer.render(scene, camera);
                }

                // Update uniforms
                uniforms.u_time.value = (Date.now() - time) / 1000;

                // Update controls
                controls.update();

                stats.end();
            };

            animate();

            // Cleanup
            return () => {
                if (renderer) renderer.dispose();
            };


        }
    }, [canvasRef.current]);

    useEffect(() => {
        if (canvasRef.current) {
            const webGLRenderer = new THREE.WebGLRenderer({
                canvas: canvasRef.current,
            });

            webGLRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            webGLRenderer.setClearColor(new THREE.Color("black"), 0.9);

            setRenderer(webGLRenderer);
        }
    }, [canvasRef.current]);

    useEffect(() => { // Update shader code (assuming it compiles correctly)
        if (material.current) {
            material.current.vertexShader = uniformCode + shaderCode + coneMarcher + vertCode;
            material.current.fragmentShader = uniformCode + shaderCode + rayMarcher + other + fragCode;
            material.current.needsUpdate = true;
        }
    }, [shaderCode])

    useEffect(() => { // Update cone marching
        if (material.current) {
            material.current.uniforms.u_useConeMarching.value = useConeMarching;
        }
    }, [useConeMarching]);

    return <div className='canvas-wrapper'>
        <canvas style={{ scale: resizeFactor.toString() }} ref={canvasRef} />
    </div>;
};

export default Scene;