// Cube parameters
const positions = [-1, 0, 1];
const layersY = [1, 2, 3];
const layersZ = [-2, -3, -4];
const cubeSize = 0.95;
const model = '#cube-model';
// Slices definitions, with their centers and match functions
const sliceDefs = {
  U:  {center: [0,3,-3],  match: (x,y,z) => y===3, axis: 'y', angle: -90},      // Top row
  D:  {center: [0,1,-3],  match: (x,y,z) => y===1, axis: 'y', angle: -90},     // Bottom row
  L:  {center: [-1,2,-3], match: (x,y,z) => x===-1, axis: 'x', angle: 90},    // Left column
  R:  {center: [1,2,-3],  match: (x,y,z) => x===1, axis: 'x', angle: 90},      // Right column
  F:  {center: [0,2,-2],  match: (x,y,z) => z===-2, axis: 'z', angle: -90},     // Front slice
  B:  {center: [0,2,-4],  match: (x,y,z) => z===-4, axis: 'z', angle: -90},    // Back slice
  
  MH:  {center: [0,2,-3],  match: (x,y,z) => x===0, axis: 'x', angle: 90},
  MV:  {center: [0,2,-3],  match: (x,y,z) => y===2, axis: 'y', angle: -90},
  MZ:  {center: [0,2,-3],  match: (x,y,z) => z===-3, axis: 'z', angle: -90},

  UR:  {center: [0,3,-3],  match: (x,y,z) => y===3, axis: 'y', angle: 90},      // Top row
  DR:  {center: [0,1,-3],  match: (x,y,z) => y===1, axis: 'y', angle: 90},     // Bottom row
  LR:  {center: [-1,2,-3], match: (x,y,z) => x===-1, axis: 'x', angle: -90},    // Left column
  RR:  {center: [1,2,-3],  match: (x,y,z) => x===1, axis: 'x', angle: -90},      // Right column
  FR:  {center: [0,2,-2],  match: (x,y,z) => z===-2, axis: 'z', angle: 90},     // Front slice
  BR:  {center: [0,2,-4],  match: (x,y,z) => z===-4, axis: 'z', angle: 90},    // Back slice
  
  MHR:  {center: [0,2,-3],  match: (x,y,z) => x===0, axis: 'x', angle: -90},
  MVR:  {center: [0,2,-3],  match: (x,y,z) => y===2, axis: 'y', angle: 90},
  MZR:  {center: [0,2,-3],  match: (x,y,z) => z===-3, axis: 'z', angle: 90},
};
// Create all cubelets under cube-cluster, no duplicates
const cluster = document.getElementById('cube-cluster');
let cubelets = [];
for (let y of layersY) {
  for (let x of positions) {
    for (let z of layersZ) {
      let cubelet = document.createElement('a-entity');
      cubelet.setAttribute('gltf-model', model);
      cubelet.setAttribute('position', `${x} ${y} ${z}`);
      cubelet.setAttribute('scale', `${cubeSize} ${cubeSize} ${cubeSize}`);
      cubelet.setAttribute('rotation', `0 0 0`);
      cubelet.setAttribute('data-x', x);
      cubelet.setAttribute('data-y', y);
      cubelet.setAttribute('data-z', z);
      cluster.appendChild(cubelet);
      cubelets.push(cubelet);
    }
  }
}
// Utility: Convert string rotation to object
function parseRotation(rot) {
  if (typeof rot === 'string') {
    let arr = rot.trim().split(/\s+/).map(Number);
    return {x: arr[0]||0, y: arr[1]||0, z: arr[2]||0};
  }
  return rot || {x:0, y:0, z:0};
}
let rotating = false;
// Rotate slice animation
async function rotationLogic(face) {
    if(rotating) {
        return;
    }
    rotating = true;
    const sliceDef = sliceDefs[face];
    if (!sliceDef) return;
    const {center, match, axis, angle} = sliceDef;
    // Find affected cubelets
    let affected = cubelets.filter(cubelet => {
      const x = parseInt(cubelet.getAttribute('data-x'));
      const y = parseInt(cubelet.getAttribute('data-y'));
      const z = parseInt(cubelet.getAttribute('data-z'));
      return match(x,y,z);
    });
    // For each affected cubelet, animate rotation about the slice center
    affected.forEach(cubelet => {
      // Get current position and rotation
      let pos = cubelet.getAttribute('position');
      let rot = parseRotation(cubelet.getAttribute('rotation'));
      // Compute position relative to slice center
      let rel = {
        x: pos.x - center[0],
        y: pos.y - center[1],
        z: pos.z - center[2]
      };
      // Rotate rel position around axis by angle
      let rad = angle * Math.PI/180;
      let newRel = {...rel};
      if (axis === 'x') {
        newRel.y = rel.y * Math.cos(rad) - rel.z * Math.sin(rad);
        newRel.z = rel.y * Math.sin(rad) + rel.z * Math.cos(rad);
      } else if (axis === 'y') {
        newRel.x = rel.x * Math.cos(rad) - rel.z * Math.sin(rad);
        newRel.z = rel.x * Math.sin(rad) + rel.z * Math.cos(rad);
      } else if (axis === 'z') {
        newRel.x = rel.x * Math.cos(rad) - rel.y * Math.sin(rad);
        newRel.y = rel.x * Math.sin(rad) + rel.y * Math.cos(rad);
      }
      // Compute new world position
      let newPos = {
        x: center[0] + Math.round(newRel.x),
        y: center[1] + Math.round(newRel.y),
        z: center[2] + Math.round(newRel.z)
      };
      // Animate position
      cubelet.setAttribute('animation__pos', {
        property: 'position',
        to: `${newPos.x} ${newPos.y} ${newPos.z}`,
        dur: 600,
        easing: 'easeInOutQuad'
      });
      // Animate rotation (just axis for visual)
      let newRot = {...rot};
      if (axis === 'x') {
        newRot.x += angle;
      } else if (axis === 'y') {
        newRot.y += -angle;
      } else if (axis === 'z') {
        newRot.z += -angle;
      }
      cubelet.setAttribute('animation__rot', {
        property: 'rotation',
        to: `${newRot.x} ${newRot.y} ${newRot.z}`,
        dur: 600,
        easing: 'easeInOutQuad'
      });
      // Update stored position/rotation after animation completes
      setTimeout(() => {
        cubelet.setAttribute('position', `${newPos.x} ${newPos.y} ${newPos.z}`);
        cubelet.setAttribute('rotation', `${newRot.x} ${newRot.y} ${newRot.z}`);
        cubelet.setAttribute('data-x', newPos.x);
        cubelet.setAttribute('data-y', newPos.y);
        cubelet.setAttribute('data-z', newPos.z);
        // Remove animation so further clicks work
        cubelet.removeAttribute('animation__pos');
        cubelet.removeAttribute('animation__rot');
        rotating = false;
      }, 650);
    });
}

async function rotateSlice(face) {
    resp = await rotationLogic(face);
}
window.rotateSlice = rotateSlice;