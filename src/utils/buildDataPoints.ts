import * as THREE from 'three';
import { latitudeLongitudeToVector3 } from './geoToSphere';


type DataPoint = {
    country: string;
    lat: number;
    lng: number;
    value: number;
}

export function buildDataPoints(
    data: DataPoint[],
    radius: number = 1.0,
    maxHeight: number = 0.5
) : THREE.Group {
    const group = new THREE.Group();

    const values = data.map((d) => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    for(const point of data){
        const normalized = (point.value - minValue) / (maxValue - minValue);
        const height = 0.02 + normalized * maxHeight;

        const geometry = new THREE.CylinderGeometry(0.01, 0.01, height, 8);

        geometry.translate(0, height / 2, 0);

        const color = new THREE.Color().lerpColors(
            new THREE.Color(0x4488ff),
            new THREE.Color(0xff4444),
            normalized
        );

        const material = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.8
        });

        const mesh = new THREE.Mesh(geometry, material);

        const position = latitudeLongitudeToVector3(point.lat, point.lng, radius);
        mesh.position.copy(position);

        // mesh.lookAt(0,0,0);
        // mesh.rotateX(Math.PI / 2);
        const normal = position.clone().normalize();
        mesh.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            normal
        )

        mesh.userData = {country: point.country, value: point.value};

        group.add(mesh);
    }

    return group;
}