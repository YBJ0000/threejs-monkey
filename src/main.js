import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

let scene, camera, renderer, controls;
let currentModel = null;
let autoRotate = true;
let lastInteraction = 0;
const INTERACTION_TIMEOUT = 3000; // 3秒后恢复自动旋转

// 初始化场景
function init() {
  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x333333);

  // 创建相机
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 2.7;
  camera.position.y = 1;
  camera.position.x = -2;


  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // 添加轨道控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // 添加控制器事件监听
  controls.addEventListener('start', () => {
    autoRotate = false;
  });

  controls.addEventListener('end', () => {
    lastInteraction = Date.now();
  });

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

  // 添加按钮事件监听
  // 修改这两行
  document.getElementById('pbr-model').addEventListener('click', () => loadModel('./Pbr/base.obj'));
  document.getElementById('shaded-model').addEventListener('click', () => loadModel('./Shaded/base.obj'));
  
  // 默认加载PBR模型
  loadModel('./Pbr/base.obj');
}

// 加载模型
function loadModel(path) {
  const textureLoader = new THREE.TextureLoader();
  const objLoader = new OBJLoader();

  // 根据路径判断是PBR还是Shaded模型
  const isPBR = path.includes('Pbr');
  const basePath = path.substring(0, path.lastIndexOf('/') + 1);

  if (isPBR) {
    // 加载PBR贴图
    const diffuseMap = textureLoader.load(basePath + 'texture_diffuse.png');
    const normalMap = textureLoader.load(basePath + 'texture_normal.png');
    const metallicMap = textureLoader.load(basePath + 'texture_metallic.png');
    const roughnessMap = textureLoader.load(basePath + 'texture_roughness.png');

    objLoader.load(path, (object) => {
      if (currentModel) {
        scene.remove(currentModel);
      }
      currentModel = object;

      // 为模型的每个部分应用PBR材质
      object.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            map: diffuseMap,
            normalMap: normalMap,
            metalnessMap: metallicMap,
            roughnessMap: roughnessMap,
            metalness: 1.0,
            roughness: 1.0
          });
        }
      });

      // 调整模型大小和位置
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      object.scale.multiplyScalar(scale);

      // 将模型居中
      const center = box.getCenter(new THREE.Vector3());
      object.position.sub(center.multiplyScalar(scale));

      scene.add(object);
    });
  } else {
    // 加载Shaded贴图
    const shadedMap = textureLoader.load(basePath + 'shaded.png');

    objLoader.load(path, (object) => {
      if (currentModel) {
        scene.remove(currentModel);
      }
      currentModel = object;

      // 为模型的每个部分应用基础材质
      object.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            map: shadedMap,
            metalness: 0.0,
            roughness: 0.5
          });
        }
      });

      // 调整模型大小和位置
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      object.scale.multiplyScalar(scale);

      // 将模型居中
      const center = box.getCenter(new THREE.Vector3());
      object.position.sub(center.multiplyScalar(scale));

      scene.add(object);
    });
  }
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

  // 检查是否应该恢复自动旋转
  if (!autoRotate && Date.now() - lastInteraction > INTERACTION_TIMEOUT) {
    autoRotate = true;
  }

  // 自动旋转
  if (autoRotate && currentModel) {
    currentModel.rotation.y += 0.01;
  }

  controls.update();
  renderer.render(scene, camera);
}

// 初始化场景并开始渲染
init();
animate();