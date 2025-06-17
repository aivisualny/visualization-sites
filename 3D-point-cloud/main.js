import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class PointCloudViewer {
    constructor() {
        this.container = document.getElementById('viewer');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.controls = null;
        this.points = null;
        this.currentModel = 'car';

        this.init();
        this.setupLights();
        this.setupControls();
        this.createPointCloud();
        this.animate();

        // 윈도우 리사이즈 이벤트 처리
        window.addEventListener('resize', () => this.onWindowResize());
        
        // 모델 선택 버튼 이벤트 리스너
        document.querySelectorAll('.model-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentModel = e.target.dataset.model;
                document.querySelectorAll('.model-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.createPointCloud();
            });
        });
    }

    init() {
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setClearColor(0xffffff);
        this.container.appendChild(this.renderer.domElement);
        this.camera.position.z = 5;
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 1, 1);
        this.scene.add(directionalLight);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
    }

    // --- 실루엣 기반 점 생성 함수들 ---
    generateCarPoints() {
        const points = [];
        // 차체(직사각형)
        for (let i = 0; i < 400; i++) {
            const x = (Math.random() - 0.5) * 2.0;
            const y = (Math.random() - 0.5) * 0.6 - 0.3; // 아래쪽
            const z = (Math.random() - 0.5) * 0.5;
            points.push(new THREE.Vector3(x, y, z));
        }
        // 지붕(반원)
        for (let i = 0; i < 200; i++) {
            const theta = Math.PI * Math.random();
            const r = 0.9 + Math.random() * 0.1;
            const x = Math.cos(theta) * r * 0.7;
            const y = Math.sin(theta) * r * 0.5 + 0.2;
            const z = (Math.random() - 0.5) * 0.5;
            points.push(new THREE.Vector3(x, y, z));
        }
        // 바퀴(원)
        for (let i = 0; i < 100; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = 0.18 + Math.random() * 0.04;
            // 왼쪽 바퀴
            points.push(new THREE.Vector3(-0.6 + Math.cos(angle) * r, -0.6 + Math.sin(angle) * r, (Math.random() - 0.5) * 0.2));
            // 오른쪽 바퀴
            points.push(new THREE.Vector3(0.6 + Math.cos(angle) * r, -0.6 + Math.sin(angle) * r, (Math.random() - 0.5) * 0.2));
        }
        return points;
    }

    generateFacePoints() {
        const points = [];
        // 얼굴 타원
        for (let i = 0; i < 600; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const rx = 0.8, ry = 1.0, rz = 0.7;
            const x = rx * Math.sin(phi) * Math.cos(theta);
            const y = ry * Math.sin(phi) * Math.sin(theta);
            const z = rz * Math.cos(phi);
            points.push(new THREE.Vector3(x, y, z));
        }
        // 눈(좌)
        for (let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = 0.09 + Math.random() * 0.02;
            points.push(new THREE.Vector3(-0.3 + Math.cos(angle) * r, 0.25 + Math.sin(angle) * r, 0.4));
        }
        // 눈(우)
        for (let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = 0.09 + Math.random() * 0.02;
            points.push(new THREE.Vector3(0.3 + Math.cos(angle) * r, 0.25 + Math.sin(angle) * r, 0.4));
        }
        // 코(삼각형)
        for (let i = 0; i < 40; i++) {
            const t = Math.random();
            const s = Math.random();
            if (t + s > 1) { continue; }
            const x = -0.05 + 0.1 * t + 0.05 * s;
            const y = 0.05 - 0.2 * t;
            const z = 0.5;
            points.push(new THREE.Vector3(x, y, z));
        }
        // 입(곡선)
        for (let i = 0; i < 80; i++) {
            const t = (i / 80) * Math.PI;
            const x = Math.cos(t) * 0.25;
            const y = -0.3 + Math.sin(t) * 0.08;
            const z = 0.45;
            points.push(new THREE.Vector3(x, y, z));
        }
        return points;
    }

    generateStarPoints() {
        const points = [];
        // 별자리 선(예: W자형 카시오페이아)
        const starLine = [
            [-0.8, 0.2, 0],
            [-0.4, 0.5, 0],
            [0, 0.1, 0],
            [0.4, 0.6, 0],
            [0.8, 0.2, 0]
        ];
        // 선을 따라 점 찍기
        for (let i = 0; i < starLine.length - 1; i++) {
            const [x1, y1, z1] = starLine[i];
            const [x2, y2, z2] = starLine[i + 1];
            for (let t = 0; t < 1; t += 0.05) {
                const x = x1 * (1 - t) + x2 * t;
                const y = y1 * (1 - t) + y2 * t;
                const z = z1 * (1 - t) + z2 * t + (Math.random() - 0.5) * 0.05;
                points.push(new THREE.Vector3(x, y, z));
            }
        }
        // 별(선 위)
        for (const [x, y, z] of starLine) {
            for (let i = 0; i < 10; i++) {
                points.push(new THREE.Vector3(x + (Math.random() - 0.5) * 0.05, y + (Math.random() - 0.5) * 0.05, z + (Math.random() - 0.5) * 0.05));
            }
        }
        // 주변에 작은 별들
        for (let i = 0; i < 100; i++) {
            const x = (Math.random() - 0.5) * 2;
            const y = (Math.random() - 0.5) * 2;
            const z = (Math.random() - 0.5) * 0.5;
            points.push(new THREE.Vector3(x, y, z));
        }
        return points;
    }

    createPointCloud() {
        if (this.points) {
            this.scene.remove(this.points);
        }
        let geometry;
        let points = [];
        switch(this.currentModel) {
            case 'car':
                points = this.generateCarPoints();
                break;
            case 'face':
                points = this.generateFacePoints();
                break;
            case 'star':
                points = this.generateStarPoints();
                break;
        }
        geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.PointsMaterial({
            color: 0x3498db,
            size: 0.05,
            sizeAttenuation: true
        });
        this.points = new THREE.Points(geometry, material);
        this.scene.add(this.points);
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// 뷰어 초기화
new PointCloudViewer(); 