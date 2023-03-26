import * as THREE from 'three'
import fragment from '/shader/fragment.glsl';
import fragment1 from '/shader/fragment1.glsl';
import vertex from '/shader/vertex.glsl';
import vertex1 from '/shader/vertex1.glsl';

import * as dat from 'lil-gui'
import { SphereGeometry } from 'three';

import {DotScreenShader} from './CustomShader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

/**
 * Base
 */

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Mouse
const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (event) =>
{
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1
})

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    composer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 1)
scene.add(camera)


/**
 * Meshes
 */

// First mesh

const geometry = new THREE.SphereGeometry(1, 32, 32)

const material = new THREE.ShaderMaterial({
    extensions: {
        derivatives: '#extension GL_OES_standard_derivatives : enable',
    },
    side: THREE.DoubleSide,
    uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector4() },
    },
    vertexShader: vertex,
    fragmentShader: fragment,
});

const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Second mesh

const smallGeometry = new SphereGeometry(0.4, 32, 32);

const smallMaterial = new THREE.ShaderMaterial({
    extensions: {
        derivatives: '#extension GL_OES_standard_derivatives : enable',
    },
    side: THREE.DoubleSide,
    uniforms: {
        time: { value: 0 },
        tCube: { value: 0 },
        resolution: { value: new THREE.Vector4() },
        mRefractionRatio: { value: 1.02},
        mFresnelBias: { value: 0.1},
        mFresnelScale: { value: 4.},
        mFresnelPower: { value: 2.}
    },
    vertexShader: vertex1,
    fragmentShader: fragment1,
});

const smallMesh = new THREE.Mesh(smallGeometry, smallMaterial);
scene.add(smallMesh);


// Cube texture

const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
    format: THREE.RGBAFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
    encoding: THREE.sRGBEncoding,
});

const cubeCamera = new THREE.CubeCamera(0.1, 10, cubeRenderTarget);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Debug
const gui = new dat.GUI()
gui.add(smallMaterial.uniforms.mRefractionRatio, 'value').min(0).max(3).step(0.01).name('mRefractionRatio')
gui.add(smallMaterial.uniforms.mFresnelBias, 'value').min(0).max(3).step(0.01).name('mFresnelBias')
gui.add(smallMaterial.uniforms.mRefractionRatio, 'value').min(0).max(3).step(0.01).name('mFresnelScale')
gui.add(smallMaterial.uniforms.mRefractionRatio, 'value').min(0).max(3).step(0.01).name('mFresnelPower')
gui.hide()

// Post processing
const composer = new EffectComposer( renderer );
composer.addPass( new RenderPass( scene, camera ) );

const effect1 = new ShaderPass( DotScreenShader );
effect1.uniforms[ 'scale' ].value = 4;
composer.addPass( effect1 );


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Updtate material
    material.uniforms.time.value = elapsedTime

    // Cube texture
    smallMesh.visible = false;
    cubeCamera.update(renderer, scene);
    smallMesh.visible = true;
    smallMaterial.uniforms.tCube.value = cubeRenderTarget.texture;

    // Mouse effect
    smallMesh.position.x = -mouse.x *0.05
    smallMesh.position.y = -mouse.y *0.05

    mesh.position.x = mouse.x *0.2
    mesh.position.y = mouse.y *0.2

    // Render
    renderer.render(scene, camera)
    composer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()