import './style.css';

import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import gsap from 'gsap';

//scene
const scene = new THREE.Scene();

//camera 
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 7.5;

// HDRI loader
const rgbeLoader = new RGBELoader();
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr', function(texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    // scene.background = texture;
});

//gltf model loader
const loader = new GLTFLoader();
let model;

loader.load(
    './DamagedHelmet.gltf',
    function (gltf) {
        model = gltf.scene;
        model.scale.set(2, 2, 2);
        scene.add(model);
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('An error happened:', error);
    }
);

//renderer
const canvas = document.querySelector("canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha:true, });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// Post processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0030; // Increased RGB shift effect
composer.addPass(rgbShiftPass);

//controls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;

window.addEventListener('mousemove', (e) => {
   if(model){
    const rotationX = (e.clientX / window.innerWidth - 0.5)* (Math.PI*0.2);
    const rotationY = (e.clientY / window.innerHeight - 0.5)* (Math.PI*0.2);
    gsap.to(model.rotation, {
      x: rotationY,
      y: rotationX,
      duration: 0.9,
      ease: "power2.out"
    });
   }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    composer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight);
  
   
});

//animation
function animate() {
    window.requestAnimationFrame(animate);
    // controls.update();
    
    // if (model) {
    //     model.rotation.y += 0.005; // Slow rotation
    //     // Animate RGB shift amount
    //     rgbShiftPass.uniforms['amount'].value = 0.005 + Math.sin(Date.now() * 0.001) * 0.003;
    // }
    
    composer.render();
}
animate();
