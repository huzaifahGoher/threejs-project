import * as THREE from "three";

/**
 * Updates target scale for each spike based on current filter/height settings.
 * Call this when sliders change. The animation loop will lerp toward targets.
 * @param group
 * @param minPopulation
 * @param heightMultiplier
 */
export function updateDataPointTargets(
  group: THREE.Group,
  minPopulation: number,
  heightMultiplier: number,
) {
  const children = group.children as THREE.Mesh[];

  const values = children.map((c) => c.userData.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  for (const mesh of children) {
    const value = mesh.userData.value as number;
    const normalized = (value - minValue) / range;

    if (value < minPopulation) {
      mesh.userData.targetScaleY = 0.001;
      mesh.userData.targetOpacity = 0;
    } else {
      const height = 0.02 + normalized * heightMultiplier;
      mesh.userData.targetScaleY = height;
      mesh.userData.targetOpacity = 0.8;
    }

    // Multi-stop gradient: green → yellow → orange → red → magenta
    // Avoids blue (border color) for clear visibility
    const colorStops = [
      new THREE.Color(0x00e676), // green (low)
      new THREE.Color(0xffeb3b), // yellow
      new THREE.Color(0xff9800), // orange
      new THREE.Color(0xf44336), // red
      new THREE.Color(0xe040fb), // magenta (high)
    ];

    const segments = colorStops.length - 1;
    const scaledT = normalized * segments;
    const index = Math.min(Math.floor(scaledT), segments - 1);
    const localT = scaledT - index;

    const color = new THREE.Color().lerpColors(
      colorStops[index],
      colorStops[index + 1],
      localT,
    );

    (mesh.material as THREE.MeshBasicMaterial).color.copy(color);
  }
}
