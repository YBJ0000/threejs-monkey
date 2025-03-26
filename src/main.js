import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

let scene, camera, renderer, controls;
let currentModel = null;
let autoRotate = true;
let lastInteraction = 0;
const INTERACTION_TIMEOUT = 3000;
let rotationSpeed = 0.01; // 默认旋转速度

// 初始化场景
function init() {
  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x333333);

  // 创建相机
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 2.7;
  camera.position.y = 1;
  camera.position.x = 0;

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // 添加轨道控制器 (移动到渲染器创建之后)
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 1.5;  // 设置最小距离
  controls.maxDistance = 10; // 设置最大距离

  // 移除控制器事件监听，让旋转完全由按钮控制

  // 添加光源
  const ambientLight = new THREE.AmbientLight(0xfff0e0, 1.2);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffd7b3, 1.2);
  directionalLight.position.set(3, 4, 2);
  scene.add(directionalLight);

  // 添加补光
  const fillLight = new THREE.DirectionalLight(0xffe0cc, 0.5);
  fillLight.position.set(-2, 2, -2);
  scene.add(fillLight);

  // 窗口大小调整处理
  window.addEventListener('resize', onWindowResize, false);

  // 添加旋转控制按钮事件监听
  const rotateButton = document.getElementById('rotateButton');
  rotateButton.addEventListener('click', () => {
    autoRotate = !autoRotate;
    rotateButton.textContent = autoRotate ? 'Stop Rotation' : 'Start Rotation';
  });

  // 添加速度控制事件监听
  const speedControls = document.querySelectorAll('input[name="speed"]');
  speedControls.forEach(control => {
    control.addEventListener('change', (e) => {
      rotationSpeed = parseFloat(e.target.value);
    });
  });

  loadModel('./stuffed_monkey_toy_with_large_eyes.glb');
}

// 重写加载模型函数
function loadModel(path) {
  const loader = new GLTFLoader();

  loader.load(path, (gltf) => {
    if (currentModel) {
      scene.remove(currentModel);
    }

    currentModel = gltf.scene;

    // 设置材质属性
    currentModel.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.metalness = 0.1;  // 设置金属感为0.1
        child.material.roughness = 1.0;  // 设置粗糙度为1.0
        child.material.needsUpdate = true;
      }
    });

    // 调整模型大小和位置
    const box = new THREE.Box3().setFromObject(currentModel);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDim;
    currentModel.scale.multiplyScalar(scale);

    // 将模型居中
    const center = box.getCenter(new THREE.Vector3());
    currentModel.position.sub(center.multiplyScalar(scale));

    scene.add(currentModel);
  });
}

// 窗口大小调整处理
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// 动画循环
function animate() {
  requestAnimationFrame(animate);



  // 自动旋转
  if (autoRotate && currentModel) {
    currentModel.rotation.y += rotationSpeed;
  }

  controls.update();
  renderer.render(scene, camera);
}

// 初始化场景并开始渲染
init();
animate();