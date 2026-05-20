import * as THREE from "three";

const DEG2RAD = Math.PI / 180;

//formula for conversion
// x = r * cos(lat) * cos(lng)
// y = r * sin(lat)
// z = r * -cos(lat) * sin(lng)

/**
 * Conversion utility for converting latitude/longitube to a 3D vector point
 * @param latitude
 * @param longitude
 * @param radius
 */
export function latitudeLongitudeToVector3(
  latitude: number,
  longitude: number,
  radius: number,
): THREE.Vector3 {
  const phi = (90 - latitude) * DEG2RAD;
  const theta = (longitude + 180) * DEG2RAD;

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}
