import * as THREE from 'three';
import TWEEN from 'three/examples/jsm/libs/tween.module';
import init from './init';

import './style.css';

const { sizes, camera, scene, canvas, controls, renderer } = init();

camera.position.z = 28;

// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshBasicMaterial({
// 	color: 'gray',
// 	wireframe: true,
// });
// const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);

const group = new THREE.Group();
const geometries = [
	new THREE.BoxGeometry( 1, 1, 1, 10, 10, 10 ),
	new THREE.CircleGeometry(1, 20, 0, Math.PI),
	new THREE.PlaneGeometry(1, 1, 20, 20),
	new THREE.ConeGeometry(1, 2, 32, 1, true, 0, 20),
	new THREE.CylinderGeometry(1.4, 1, 2, 16),
	new THREE.RingGeometry(.5, 1, 32, 10),
	new THREE.TorusGeometry(1, 0.5, 16),
	new THREE.TorusKnotGeometry(1, 0.25, 100, 16, 2, 5),
	new THREE.DodecahedronGeometry(1, 10)
]
let index = 0;
let activeIndex = -1;
for(let i = -5; i <= 5; i += 5) {
	for(let j = -5; j <=5; j += 5) {
		const material = new THREE.MeshBasicMaterial({
			color: 'gray',
			wireframe: true,
		});

		const mesh = new THREE.Mesh(geometries[index], material);
		mesh.position.set(i, j, 10);
		mesh.index = index;
		mesh.basePosition = new THREE.Vector3(i, j, 10);
		group.add(mesh);
		index += 1;
	}
}
scene.add(group);

const clock = new THREE.Clock();

const tick = () => {
	const delta = clock.getDelta();

	if(activeIndex !== -1) {
		group.children[activeIndex].rotation.y += delta * 0.5;
	}
	controls.update();
	TWEEN.update();
	renderer.render(scene, camera);
	window.requestAnimationFrame(tick);

};
tick();

const resetActive = () => {
	group.children[activeIndex].material.color.set('gray');
	new TWEEN.Tween(group.children[activeIndex].position).to({
		x: group.children[activeIndex].basePosition.x, 
		y: group.children[activeIndex].basePosition.y,
		z: group.children[activeIndex].basePosition.z
	}, Math.random() * 1000 + 1000 ).easing(TWEEN.Easing.Exponential.InOut).start()

	activeIndex = -1;
}

const raycaster = new THREE.Raycaster();
const handleClick = (event) => {
	const pointer = new THREE.Vector2();
	pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
	pointer.y= -(event.clientY / window.innerHeight) * 2 + 1;
	raycaster.setFromCamera(pointer, camera);
	const intersections = raycaster.intersectObjects(group.children);

	if(activeIndex !== -1) {
		resetActive();
	}

	for(let i = 0; i < intersections.length; i += 1) {
		intersections[i].object.material.color.set('purple')
		activeIndex = intersections[i].object.index;

		new TWEEN.Tween(intersections[i].object.position).to({
			x: 0, 
			y: 0,
			z: 25
		}, Math.random() * 1000 + 1000 ).easing(TWEEN.Easing.Exponential.InOut).start()

	}
}

window.addEventListener('click', handleClick)
/** Базовые обпаботчики событий длы поддержки ресайза */
window.addEventListener('resize', () => {
	// Обновляем размеры
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Обновляем соотношение сторон камеры
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Обновляем renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.render(scene, camera);
});

window.addEventListener('dblclick', () => {
	if (!document.fullscreenElement) {
		canvas.requestFullscreen();
	} else {
		document.exitFullscreen();
	}
});
