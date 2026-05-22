import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

interface UseThreeSceneOptions {
  cameraPosition?: [number, number, number];
  cameraStartPosition?: [number, number, number];
  enableDamping?: boolean;
  dampingFactor?: number;
}

export function useThreeScene(options: UseThreeSceneOptions = {}) {
  const {
    cameraPosition = [0, 0, 3],
    cameraStartPosition = [0, 0, 8],
    enableDamping = true,
    dampingFactor = 0.05,
  } = options;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const controlRef = useRef<OrbitControls | null>(null);
  const frameIDRef = useRef(0);
  const animateCallbackFnRef = useRef<(delta: number) => void | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(...cameraStartPosition);
    cameraRef.current = camera;

    let introComplete = false;
    const targetPosition = new THREE.Vector3(...cameraPosition);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = enableDamping;
    controls.dampingFactor = dampingFactor;
    controls.minPolarAngle = Math.PI * 0.1;
    controls.maxPolarAngle = Math.PI * 0.9;
    controlRef.current = controls;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });
    resizeObserver.observe(container);

    const clock = new THREE.Timer();
    const animate = () => {
      frameIDRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      controls.update();

      if(!introComplete){
        camera.position.lerp(targetPosition, 0.02);
        if(camera.position.distanceTo(targetPosition) < 0.01){
          camera.position.copy(targetPosition);
          introComplete = true;
        }
      }

      if (animateCallbackFnRef.current) {
        animateCallbackFnRef.current(delta);
      }
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameIDRef.current);
      renderer.dispose();
      container.removeChild(renderer.domElement);
      controls.dispose();
      resizeObserver.disconnect();
    };
  }, []);

  const onAnimate = (callback: (delta: number) => void) => {
    animateCallbackFnRef.current = callback;
  };

  return {
    containerRef,
    sceneRef,
    rendererRef,
    cameraRef,
    controlRef,
    onAnimate,
  };
}
