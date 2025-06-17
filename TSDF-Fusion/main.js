import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Three.js 기본 설정
const viewer = document.getElementById('viewer');
const width = viewer.clientWidth || viewer.offsetWidth || 600;
const height = viewer.clientHeight || viewer.offsetHeight || 600;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
renderer.setSize(width, height);
viewer.appendChild(renderer.domElement);

// 배경색 (CSS에서 관리하므로 Three.js에서는 제거하거나 투명하게 설정)
scene.background = null; // 배경을 완전히 투명하게 설정하여 CSS 배경이 보이도록

// 조명
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
dirLight.position.set(1, 2, 2);
scene.add(dirLight);

// 카메라 위치 및 OrbitControls 설정
camera.position.set(0, 0, 4);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // 부드러운 카메라 움직임
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 1;
controls.maxDistance = 10;

// TSDF 복셀 그리드 설정
const gridSize = 18; // 격자 크기
const voxelSize = 0.13; // 복셀 크기
const voxels = [];
const geometry = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);

// TSDF 값 생성 (구 형태)
function generateTSDFValue(x, y, z) {
    const distance = Math.sqrt(x * x + y * y + z * z);
    // console.log(`x: ${x.toFixed(2)}, y: ${y.toFixed(2)}, z: ${z.toFixed(2)}, distance: ${distance.toFixed(2)}`); // 디버깅용
    return Math.max(0, 1 - distance / 1.2); // 1.2로 조정해 구가 더 잘 보이게
}

// 복셀 생성 (TSDF 값이 0보다 크면 추가)
for (let x = -gridSize/2; x < gridSize/2; x++) {
    for (let y = -gridSize/2; y < gridSize/2; y++) {
        for (let z = -gridSize/2; z < gridSize/2; z++) {
            const tsdfValue = generateTSDFValue(x * voxelSize, y * voxelSize, z * voxelSize);
            if (tsdfValue > 0) {
                const material = new THREE.MeshPhongMaterial({
                    color: 0x3498db, // CSS highlight 색상과 유사하게 변경
                    transparent: true,
                    opacity: tsdfValue * 0.8 + 0.2 // 더 선명하게
                });
                const voxel = new THREE.Mesh(geometry, material);
                voxel.position.set(x * voxelSize, y * voxelSize, z * voxelSize);
                voxel.visible = false; // 다시 애니메이션을 위해 처음엔 안 보이게
                scene.add(voxel);
                voxels.push(voxel);
            }
        }
    }
}
console.log(`총 생성된 복셀 수: ${voxels.length}`); // 생성된 복셀 수 확인

// 애니메이션: 복셀이 점점 채워짐
let currentVoxelIndex = 0;
const totalVoxels = voxels.length;
const animationSpeed = 40; // 한 프레임에 나타날 복셀 수

function animate() {
    requestAnimationFrame(animate);
    // 복셀을 점진적으로 보이게
    for (let i = 0; i < animationSpeed && currentVoxelIndex < totalVoxels; i++) {
        if (voxels[currentVoxelIndex]) { // 복셀이 존재하는지 확인
            voxels[currentVoxelIndex].visible = true;
        }
        currentVoxelIndex++;
    }
    // OrbitControls 업데이트
    controls.update();
    renderer.render(scene, camera);
}

// 반응형 처리
window.addEventListener('resize', () => {
    const newWidth = viewer.clientWidth || viewer.offsetWidth || 600;
    const newHeight = viewer.clientHeight || viewer.offsetHeight || 600;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
});

// 애니메이션 시작
animate(); 