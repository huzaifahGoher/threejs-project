import { useEffect } from "react";
import * as THREE from "three";
import { useThreeScene } from "../hooks/useThreeScene";

const ThreeScene = () => {
  const { containerRef, sceneRef, onAnimate } = useThreeScene();

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const hemiSphereLight = new THREE.HemisphereLight(0x4488ff, 0x002244, 0.3);
    scene.add(hemiSphereLight);

    const globeGeometry = new THREE.SphereGeometry(1, 64, 64);
    const globeMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.8,
      metalness: 0.1,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    const wireframeGeometry = new THREE.SphereGeometry(1.002, 32, 32);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x4488ff,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    scene.add(wireframe);

    const moonGeometry = new THREE.SphereGeometry(1.002, 32, 32);
    const moonMaterial = new THREE.MeshBasicMaterial({
      color: 0xeeeeee,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moon);
    moon.position.set(8, 3, 5);

    onAnimate((delta) => {
      globe.rotation.y += 0.1 * delta;
      wireframe.rotation.y += 0.1 * delta;
    });

    return () => {
      scene.remove(globe, wireframe);
      globeGeometry.dispose();
      globeMaterial.dispose();
      wireframeGeometry.dispose();
      wireframeMaterial.dispose();
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

export default ThreeScene;
