import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// Initialize renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.AgXToneMapping;
document.body.appendChild(renderer.domElement);

// Create scene
const scene = new THREE.Scene();

// Create camera and orbit controls
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);
camera.position.set(-5, 2.5, -3.5);
scene.add(camera);

const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI * 0.5;
controls.minDistance = 3;
controls.maxDistance = 8;

// Add lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// Bloom parameters
const params = {
	threshold: 0,
	strength: 0.8,
	radius: 0,
	exposure: 5
};

const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
	new THREE.Vector2(window.innerWidth, window.innerHeight),
	params.strength,
	params.radius,
	params.threshold
);

const outputPass = new OutputPass();

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);
composer.addPass(outputPass);

// Materials
const holdoutMaterial = new THREE.MeshBasicMaterial({
	colorWrite: false,
});

const blueGlowMaterial = new THREE.MeshBasicMaterial({
	color: 0x007fff
});

// Monkey mesh
const loader = new GLTFLoader();
loader.load('./assets/monkey.glb', (gltf) => {
	const model = gltf.scene;

	// Access the "Suzanne" group
	const suzanneGroup = model.getObjectByName('Suzanne');

	if (suzanneGroup) {
		// Loop through children of "Suzanne"
		suzanneGroup.children.forEach((mesh) => {
			if (mesh.isMesh) {
				switch (mesh.name) {
					case 'Suzanne_1':
						mesh.material = holdoutMaterial;
						break;
					case 'Suzanne_2':
						mesh.material = blueGlowMaterial;
						break;
				}
			}
		});
	}

	scene.add(model);
}, undefined, (error) => {
	console.error('Error loading GLTF model:', error);
});

function animate() {
	requestAnimationFrame(animate);
	composer.render();
}

// Start the animation loop
animate();

// Handle window resize
window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	composer.setSize(window.innerWidth, window.innerHeight);
});
