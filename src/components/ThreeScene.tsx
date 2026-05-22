import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useThreeScene } from "../hooks/useThreeScene";
import { buildGlobeBorders } from "../utils/buildGlobeBorders";
import { buildDataPoints } from "../utils/buildDataPoints";
import { updateDataPointTargets } from "../utils/updateDataPoints";
import Tooltip from "./Tooltip";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { Button, useTheme } from "@huzaifah191001/design-library";
import { toggleAnimation } from "../store/slices/animationSlice";
import ControlPanel from "./ControlPanel";

const ThreeScene = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { containerRef, sceneRef, cameraRef, onAnimate, rendererRef } = useThreeScene({
    cameraPosition: [0, 0, 3],
  });

  const isPlaying = useAppSelector((state) => state.animation.isPlaying);
  const { minPopulation, heightMultiplier } = useAppSelector(
    (state) => state.control,
  );
  const mode = useAppSelector((state) => state.theme.mode);
  const isPlayingRef = useRef(isPlaying);
  const minPopulationRef = useRef(minPopulation);
  const heightMultiplierRef = useRef(heightMultiplier);

  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    country: "",
    value: 0,
  });

  const dataGroupRef = useRef<THREE.Group | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const bordersRef = useRef<THREE.LineSegments | null>(null);

  useEffect(() => {
    const renderer = rendererRef.current;
    const globe = globeRef.current;

    if(!renderer || !globe) return;

    if(mode === "dark"){
      renderer.setClearColor(0x0a0a0f);
      (globe.material as THREE.MeshStandardMaterial).color.set(0x1a1a22);
    } else {
      renderer.setClearColor(0xf0f0f5);
      (globe.material as THREE.MeshStandardMaterial).color.set(0x334455);
    }
  }, [mode])

  // === SCENE SETUP (runs once) ===
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Lighting
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const hemiSphereLight = new THREE.HemisphereLight(0x4488ff, 0x002244, 0.3);
    scene.add(hemiSphereLight);

    // Globe
    const globeGeometry = new THREE.SphereGeometry(1, 64, 64);
    const globeMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.8,
      metalness: 0.1,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);
    globeRef.current = globe;

    // Borders
    fetch("/data/countries.geojson")
      .then((res) => res.json())
      .then((geojson) => {
        const borders = buildGlobeBorders(geojson, 1.001);
        scene.add(borders);
        bordersRef.current = borders;
      });

    // Data points (built once, never destroyed)
    fetch("/data/population.json")
      .then((res) => res.json())
      .then((data) => {
        const dataGroup = buildDataPoints(data, 1.0);
        scene.add(dataGroup);
        dataGroupRef.current = dataGroup;
        // Set initial targets
        updateDataPointTargets(
          dataGroup,
          minPopulationRef.current,
          heightMultiplierRef.current,
        );
      });

    // Animation loop
    onAnimate((delta) => {
      // Rotation only when playing
      if (isPlayingRef.current) {
        globe.rotation.y += 0.1 * delta;
        if (bordersRef.current) bordersRef.current.rotation.y += 0.1 * delta;
        if (dataGroupRef.current) dataGroupRef.current.rotation.y += 0.1 * delta;
      }

      // Smooth scale animation — always runs (even when paused)
      if (dataGroupRef.current) {
        for (const child of dataGroupRef.current.children) {
          const mesh = child as THREE.Mesh;
          const targetScaleY = mesh.userData.targetScaleY ?? 0.001;
          mesh.scale.y += (targetScaleY - mesh.scale.y) * 0.1;

          const targetOpacity = mesh.userData.targetOpacity ?? 0.8;
          const mat = mesh.material as THREE.MeshBasicMaterial;
          mat.opacity += (targetOpacity - mat.opacity) * 0.1;

          // Hide completely when shrunk
          mesh.visible = mat.opacity > 0.01;
        }
      }
    });

    return () => {
      scene.remove(globe, directionalLight, ambientLight, hemiSphereLight);
      globeGeometry.dispose();
      globeMaterial.dispose();
      if (bordersRef.current) {
        scene.remove(bordersRef.current);
        bordersRef.current.geometry.dispose();
        (bordersRef.current.material as THREE.Material).dispose();
      }
      if (dataGroupRef.current) {
        scene.remove(dataGroupRef.current);
        dataGroupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            (child.material as THREE.Material).dispose();
          }
        });
      }
    };
  }, []);

  // === UPDATE TARGETS (reacts to slider changes, no rebuild) ===
  useEffect(() => {
    minPopulationRef.current = minPopulation;
    heightMultiplierRef.current = heightMultiplier;

    if (dataGroupRef.current) {
      updateDataPointTargets(
        dataGroupRef.current,
        minPopulation,
        heightMultiplier,
      );
    }
  }, [minPopulation, heightMultiplier]);

  // === SYNC isPlaying ref ===
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // === RAYCASTING ===
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
        <ControlPanel />
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
