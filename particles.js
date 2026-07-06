// Three.js Interactive Particle Background Engine
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Generate custom space coordinates
const count = 25000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(count * 3);

for(let i = 0; i < count * 3; i += 3) {
    positions[i]     = (Math.random() - 0.5) * 12; // X
    positions[i + 1] = (Math.random() - 0.5) * 12; // Y
    positions[i + 2] = (Math.random() - 0.5) * 12; // Z
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) }
};

const vertexShader = `
    uniform float uTime;
    uniform vec2 uMouse;
    varying vec3 vPosition;
    void main() {
        vPosition = position;
        vec3 pos = position;

        float wave = sin(pos.x * 1.2 + uTime) * cos(pos.y * 1.2 + uTime) * 0.3;
        pos.z += wave;

        float dist = distance(pos.xy, uMouse * 4.5);
        if(dist < 1.8) {
            pos.z += (1.8 - dist) * 0.9;
        }

        vec4 modelViewPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * modelViewPosition;
        gl_PointSize = 6.0 / -modelViewPosition.z;
    }
`;

const fragmentShader = `
    varying vec3 vPosition;
    void main() {
        float dist = distance(gl_PointCoord, vec2(0.5));
        if(dist > 0.5) discard;

        // Custom cyber cyan glowing colors matching video style
        vec3 color = vec3(0.0, 0.89, 1.0);
        float alpha = 1.0 - (dist * 2.0);

        gl_FragColor = vec4(color, alpha * 0.7);
    }
`;

const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});

const points = new THREE.Points(geometry, material);
scene.add(points);

const mouse = new THREE.Vector2();
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

const animate = () => {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    uniforms.uTime.value = elapsedTime * 0.4;
    uniforms.uMouse.value.x += (mouse.x - uniforms.uMouse.value.x) * 0.05;
    uniforms.uMouse.value.y += (mouse.y - uniforms.uMouse.value.y) * 0.05;

    points.rotation.y = elapsedTime * 0.015;

    renderer.render(scene, camera);
};

animate();
