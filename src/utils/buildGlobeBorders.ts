import * as THREE from "three";
import { latitudeLongitudeToVector3 } from "./geoToSphere";

type GeoJSONFeature = {
  type: string;
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
  properties: {
    name?: string;
    ADMIN?: string;
  };
};

type GeoJSON = {
  type: string;
  features: GeoJSONFeature[];
};

export function buildGlobeBorders(
  geojson: GeoJSON,
  radius: number = 1.001,
): THREE.LineSegments {
  const positions: number[] = [];
  for (const feature of geojson.features) {
    const { type, coordinates } = feature.geometry;

    const polygons: number[][][][] | number[][][] =
      type === "MultiPolygon"
        ? (coordinates as number[][][][])
        : [coordinates as number[][][]];

    for (const polygon of polygons) {
      for (const ring of polygon) {
        for (let i = 0; i < ring.length - 1; i++) {
          const [lng1, lat1] = ring[i];
          const [lng2, lat2] = ring[i + 1];

          const p1 = latitudeLongitudeToVector3(lat1, lng1, radius);
          const p2 = latitudeLongitudeToVector3(lat2, lng2, radius);

          positions.push(p1.x, p1.y, p1.z);
          positions.push(p2.x, p2.y, p2.z);
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );

  const material = new THREE.LineBasicMaterial({
    color: 0x4488ff,
    transparent: true,
    opacity: 0.6,
  });

  return new THREE.LineSegments(geometry, material);
}
