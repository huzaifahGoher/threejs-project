import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useThreeScene } from "../hooks/useThreeScene";
import { buildGlobeBorders } from "../utils/buildGlobeBorders";
import { buildDataPoints } from "../utils/buildDataPoints";
import Tooltip from "./Tooltip";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { Button, useTheme } from "@huzaifah191001/design-library";
import { toggleAnimation } from "../store/slices/animationSlice";

const ThreeScene = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { containerRef, sceneRef, cameraRef, onAnimate } = useThreeScene({
    cameraPosition: [0, 0, 3],
  });

  const isPlaying = useAppSelector((state) => state.animation.isPlaying);
  const isPlayingRef = useRef(isPlaying);

  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    country: "",
    value: 0,
  });

  const dataGroupRef = useRef<THREE.Group | null>(null);

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

    let borders: THREE.LineSegments | null = null;

    fetch("/data/countries.geojson")
      .then((res) => res.json())
      .then((geojson) => {
        borders = buildGlobeBorders(geojson, 1.001);
        scene.add(borders);
      });

    let dataGroup: THREE.Group | null = null;

    fetch("/data/population.json")
      .then((res) => res.json())
      .then((data) => {
        dataGroup = buildDataPoints(data, 1.0, 0.5);
        scene.add(dataGroup);
        dataGroupRef.current = dataGroup;
      });

    const wireframeGeometry = new THREE.SphereGeometry(1.002, 32, 32);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x4488ff,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    // scene.add(wireframe);

    const moonGeometry = new THREE.SphereGeometry(1.002, 32, 32);
    const moonMaterial = new THREE.MeshBasicMaterial({
      color: 0xeeeeee,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    // scene.add(moon);
    moon.position.set(8, 3, 5);

    onAnimate((delta) => {
      if (!isPlayingRef.current) return;

      globe.rotation.y += 0.1 * delta;
      if (borders) {
        borders.rotation.y += 0.1 * delta;
      }
      if (dataGroup) {
        dataGroup.rotation.y += 0.1 * delta;
      }
      wireframe.rotation.y += 0.1 * delta;
    });

    return () => {
      scene.remove(globe);
      scene.remove(wireframe);
      globeGeometry.dispose();
      globeMaterial.dispose();
      if (borders) {
        scene.remove(borders);
        borders.geometry.dispose();
        (borders.material as THREE.Material).dispose();
      }
      if (dataGroup) {
        scene.remove(dataGroup);
        dataGroup.traverse((point) => {
          if (point instanceof THREE.Mesh) {
            point.geometry.dispose();
            (point.material as THREE.Material).dispose();
          }
        });
      }
      wireframeGeometry.dispose();
      wireframeMaterial.dispose();
    };
  }, []);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const container = containerRef.current;
    const camera = cameraRef.current;

    if (!container || !camera) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      const dataGroup = dataGroupRef.current;
      if (!dataGroup) return;

      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(dataGroup.children);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        setTooltip({
          visible: true,
          x: event.clientX,
          y: event.clientY,
          country: hit.userData.country,
          value: hit.userData.value,
        });
      } else {
        setTooltip((prev) =>
          prev.visible ? { ...prev, visible: false } : prev,
        );
      }
    };

    container.addEventListener("mousemove", onMouseMove);
    return () => container.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
        <Tooltip {...tooltip} />
        <Button
          variant="filled"
          onClick={() => dispatch(toggleAnimation())}
          style={{
            position: "absolute",
            bottom: 50,
            right: 20,
            padding: "10px 20px",
            background: "rgba(0,0,0,0.7)",
            color: "#fff",
            borderColor: theme.colors.border,
            borderRadius: theme.borderRadius.md,
          }}
        >
          {isPlaying ? "Pause" : "Play"}
        </Button>
      </div>
    </div>
  );
};

export default ThreeScene;
