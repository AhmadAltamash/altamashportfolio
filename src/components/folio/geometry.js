import * as THREE from "three";

export function roundedRectShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  const rad = Math.min(r, w / 2 - 0.001, h / 2 - 0.001);
  s.moveTo(x + rad, y);
  s.lineTo(x + w - rad, y);
  s.quadraticCurveTo(x + w, y, x + w, y + rad);
  s.lineTo(x + w, y + h - rad);
  s.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  s.lineTo(x + rad, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - rad);
  s.lineTo(x, y + rad);
  s.quadraticCurveTo(x, y, x + rad, y);
  return s;
}

export function roundedPlaneGeometry(w, h, r) {
  const geo = new THREE.ShapeGeometry(roundedRectShape(w, h, r), 12);
  const pos = geo.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uvs[i * 2] = pos.getX(i) / w + 0.5;
    uvs[i * 2 + 1] = pos.getY(i) / h + 0.5;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  return geo;
}

export function roundedCardGeometry(w, h, d, r) {
  const bevel = Math.min(0.012, d * 0.22);
  const geo = new THREE.ExtrudeGeometry(roundedRectShape(w, h, r), {
    depth: d,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: Math.min(0.01, r * 0.18),
    bevelSegments: 2,
    curveSegments: 10,
  });
  geo.translate(0, 0, -d / 2);
  geo.computeVertexNormals();
  return geo;
}
