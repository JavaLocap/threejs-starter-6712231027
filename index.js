import * as THREE from 'three'; // three จากที่กำหนดใน importmap
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import Stats from 'three/addons/libs/stats.module.js';
import { M3D, createLabel2D, FPS } from './utils-module.js';

document.addEventListener("DOMContentLoaded", main);

function main() {
    // ใช้ M3D ที่นำเข้ามา
    document.body.appendChild(M3D.renderer.domElement);
    document.body.appendChild(M3D.cssRenderer.domElement);

    M3D.renderer.setClearColor(0x333333); // กำหนดสีพื้นหลังของ renderer (canvas)
    M3D.renderer.setPixelRatio(window.devicePixelRatio); // ปรับความละเอียดของ renderer ให้เหมาะสมกับหน้าจอ
    M3D.renderer.shadowMap.enabled = true; // เปิดใช้งาน shadow map
    M3D.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // กำหนดประเภทของ shadow map
    M3D.renderer.physicallyCorrectLights = true; // เปิดใช้งานการคำนวณแสงแบบฟิสิกส์
    M3D.renderer.outputEncoding = THREE.sRGBEncoding; // กำหนดการเข้ารหัสสีของ renderer
    M3D.renderer.setAnimationLoop(animate); // ตั้งค่า animation loop

    // Prepaire objects here
    // TODO: วาดฉากทิวทัศน์ 3D ด้วย Three.js
    // ต้องมีครบ 6 อย่าง: ภูเขา, พระอาทิตย์, ท้องนา, ต้นไม้, บ้าน/กระท่อม, แม่น้ำ
    // องค์ประกอบอื่น ๆ เพิ่มเติมได้ตามต้องการ (เช่น ท้องฟ้า, ก้อนเมฆ ฯลฯ)
    
    // วาดพื้นดินสองฝั่ง (ซ้าย-ขวา) แบบ 3D
    const groundWidth = 20; // ความกว้างของพื้นดิน
    const groundHeight = 40; // ความยาวของพื้นดิน
    const groundDepth = 1; // ความหนาของพื้นดิน
    const groundY = -2; // ตำแหน่งแกน Y ของพื้นดิน

    // ฝั่งซ้าย (ใช้ BoxGeometry)
    const leftGroundGeometry = new THREE.BoxGeometry(groundWidth, groundDepth, groundHeight);
    const leftGroundMaterial = new THREE.MeshStandardMaterial({ color: 0x8B5A2B }); // สีน้ำตาล
    const leftGround = new THREE.Mesh(leftGroundGeometry, leftGroundMaterial);
    leftGround.position.set(-12, groundY - groundDepth/2, 0); 
    leftGround.castShadow = false;
    leftGround.receiveShadow = true;
    M3D.scene.add(leftGround);

    // ฝั่งขวา (ใช้ BoxGeometry)
    const rightGroundGeometry = new THREE.BoxGeometry(groundWidth, groundDepth, groundHeight);
    const rightGroundMaterial = new THREE.MeshStandardMaterial({ color: 0xA0522D }); // สีน้ำตาล
    const rightGround = new THREE.Mesh(rightGroundGeometry, rightGroundMaterial);
    rightGround.position.set(12, groundY - groundDepth/2, 0);
    rightGround.castShadow = false;
    rightGround.receiveShadow = true;
    M3D.scene.add(rightGround);

    // ดินตรงกลาง 
    const centerGroundDepth = groundDepth / 2;
    const centerGroundWidth = 4;
    const centerGroundHeight = groundHeight;
    const centerGroundY = groundY - groundDepth/2 - centerGroundDepth/2;
    const centerGroundGeometry = new THREE.BoxGeometry(centerGroundWidth, centerGroundDepth, centerGroundHeight);
    const centerGroundMaterial = new THREE.MeshStandardMaterial({ color: 0xC2B280 });
    const centerGround = new THREE.Mesh(centerGroundGeometry, centerGroundMaterial);
    centerGround.position.set(0, centerGroundY, 0);
    centerGround.castShadow = false;
    centerGround.receiveShadow = true;
    M3D.scene.add(centerGround);

    // หญ้าด้านบนของพื้นดิน
    const grassThickness = 0.1; // ความหนาของหญ้า
    const grassOffsetY = groundDepth / 2 + grassThickness / 2 + -0.5;


    // หญ้าฝั่งซ้าย
    const leftGrassGeometry = new THREE.BoxGeometry(groundWidth, grassThickness, groundHeight); // ใช้ BoxGeometry สำหรับหญ้า
    const leftGrassMaterial = new THREE.MeshStandardMaterial({ color: 0x55c157 }); // สีเขียว
    const leftGrass = new THREE.Mesh(leftGrassGeometry, leftGrassMaterial);
    leftGrass.position.set(-12, groundY + grassOffsetY, 0); // วางหญ้าบนพื้นดิน
    leftGrass.castShadow = false;
    leftGrass.receiveShadow = true;
    M3D.scene.add(leftGrass);

    // หญ้าฝั่งขวา
    const rightGrassGeometry = new THREE.BoxGeometry(groundWidth, grassThickness, groundHeight); // ใช้ BoxGeometry สำหรับหญ้า
    const rightGrassMaterial = new THREE.MeshStandardMaterial({ color: 0x55c157 }); // สีเขียว
    const rightGrass = new THREE.Mesh(rightGrassGeometry, rightGrassMaterial); 
    rightGrass.position.set(12, groundY + grassOffsetY, 0); // วางหญ้าบนพื้นดิน
    rightGrass.castShadow = false;
    rightGrass.receiveShadow = true;
    M3D.scene.add(rightGrass);

    // === แม่น้ำอยู่ตรงกลางระหว่างดินซ้ายขวา (centerGround) ===
    const riverDepth = centerGroundDepth; // ให้แม่น้ำสูงเท่าดินตรงกลาง
    const riverWidth = centerGroundWidth;
    const riverHeight = groundHeight;
    const riverY = centerGroundY + centerGroundDepth/2; 
    const riverGeometry = new THREE.BoxGeometry(riverWidth, riverDepth, riverHeight);
    const riverMaterial = new THREE.MeshStandardMaterial({ color: 0x4FC3F7, transparent: true, opacity: 0.85 });
    const river = new THREE.Mesh(riverGeometry, riverMaterial);
    river.position.set(0, riverY, 0);
    river.castShadow = false;
    river.receiveShadow = false;
    M3D.scene.add(river);

    // === ภูเขา 3 ลูก ===
    const mountainData = [
        { posX: -13 , posZ: -11, posY: -12, radius: 9, height: 1, color: 0x006400 }, 
        { posX: 2, posZ: -11, posY: -13, radius: 10, height: 1, color: 0x1a4f08 },
        { posX: 14, posZ: -12, posY: -11, radius: 8, height: 0.8, color: 0x1a4f08 },
    ];

    mountainData.forEach(m => {
        // ใช้ SphereGeometry เฉพาะครึ่งวงกลม (thetaLength: Math.PI/2)
        const geometry = new THREE.SphereGeometry(m.radius, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2);
        // ปรับความยาว (แกน Y) ด้วย scale
        const heightScale = m.heightScale || 1;
        geometry.scale(1, heightScale, 1);
        const material = new THREE.MeshStandardMaterial({ color: m.color });
        const mountain = new THREE.Mesh(geometry, material);
        // วางให้ฐานอยู่บนพื้น
        mountain.position.set(m.posX, m.posY + m.radius * heightScale, m.posZ);
        mountain.castShadow = true;
        mountain.receiveShadow = true;
        M3D.scene.add(mountain);
    });

	// ###############################################################
	// GLTFLoader สำหรับโหลดโมเดล 3D
	// model sun
	const loader = new GLTFLoader(); // สร้าง GLTFLoader
	loader.load(
		'assets/sun.glb', // URL ของโมเดล 3D ที่จะโหลด (Backend / Server / Remote host)
		function(gltf) { // Function ทำงานเมื่อโหลดโมเดล 3D สำเร็จ, gltf คือข้อมูลโมเดลที่โหลดมา (json)
			const model = gltf.scene; // เข้าถึงโมเดลที่โหลดมา
			model.position.set(-5, 10, -16); // กำหนดตำแหน่งของโมเดลในฉาก
			model.scale.set(35, 35, 35); // ปรับขนาดโมเดล
			model.traverse((child) => { // วนลูปผ่านทุกส่วนของโมเดล (ในกรณีที่โมเดลมีหลายส่วนหรือ Mesh ย่อย)
				if (child.isMesh) { // ถ้า child เป็น Mesh
					child.castShadow = true; // ให้ Mesh สร้างเงา
					//child.receiveShadow = true; // ให้ Mesh รับเงา
					//console.log('Mesh found:', child.name); // แสดงชื่อของ Mesh ที่พบในโมเดล
				}
			});
			M3D.scene.add(model); // เพิ่มโมเดลลงใน Scene
		},
		function(xhr) { // Function ทำงานเมื่อการโหลดโมเดล 3D กำลังดำเนินการ
			console.log((xhr.loaded / xhr.total * 100) + '% sun loaded'); // แสดงเปอร์เซ็นต์การโหลดโมเดล
		},
		function(error) { // Function ทำงานเมื่อโหลดโมเดล 3D ไม่สำเร็จ
			console.error('An error happened while loading the model:', error); // แสดงข้อผิดพลาดหากโหลดโมเดลไม่สำเร็จ
		}
	);

	// model Home
	loader.load(
		'assets/Home.glb', // URL ของโมเดล 3D ที่จะโหลด (Backend / Server / Remote host)
		function(gltf) { // Function ทำงานเมื่อโหลดโมเดล 3D สำเร็จ, gltf คือข้อมูลโมเดลที่โหลดมา (json)
			const model = gltf.scene; // เข้าถึงโมเดลที่โหลดมา
			model.position.set(-15, -1.90, 9); // กำหนดตำแหน่งของโมเดลในฉาก
			model.scale.set(0.22, 0.22, 0.22); // ปรับขนาดโมเดล
			model.traverse((child) => { // วนลูปผ่านทุกส่วนของโมเดล (ในกรณีที่โมเดลมีหลายส่วนหรือ Mesh ย่อย)
				if (child.isMesh) { // ถ้า child เป็น Mesh
					child.castShadow = true; // ให้ Mesh สร้างเงา
					//child.receiveShadow = true; // ให้ Mesh รับเงา
					//console.log('Mesh found:', child.name); // แสดงชื่อของ Mesh ที่พบในโมเดล
				}
			});
			M3D.scene.add(model); // เพิ่มโมเดลลงใน Scene
		},
		function(xhr) { // Function ทำงานเมื่อการโหลดโมเดล 3D กำลังดำเนินการ
			console.log((xhr.loaded / xhr.total * 100) + '% Home loaded'); // แสดงเปอร์เซ็นต์การโหลดโมเดล
		},
		function(error) { // Function ทำงานเมื่อโหลดโมเดล 3D ไม่สำเร็จ
			console.error('An error happened while loading the model:', error); // แสดงข้อผิดพลาดหากโหลดโมเดลไม่สำเร็จ
		}
	);

	// model bridge
	loader.load(
		'assets/bridge.glb', // URL ของโมเดล 3D ที่จะโหลด (Backend / Server / Remote host)
		function(gltf) { // Function ทำงานเมื่อโหลดโมเดล 3D สำเร็จ, gltf คือข้อมูลโมเดลที่โหลดมา (json)
			const model = gltf.scene; // เข้าถึงโมเดลที่โหลดมา
			model.position.set(-2.5, -1.70, 11); // กำหนดตำแหน่งของโมเดลในฉาก
			model.scale.set(0.60, 0.20, 0.30); // ปรับขนาดโมเดล
			model.traverse((child) => { // วนลูปผ่านทุกส่วนของโมเดล (ในกรณีที่โมเดลมีหลายส่วนหรือ Mesh ย่อย)
				if (child.isMesh) { // ถ้า child เป็น Mesh
					child.castShadow = true; // ให้ Mesh สร้างเงา
					//child.receiveShadow = true; // ให้ Mesh รับเงา
					//console.log('Mesh found:', child.name); // แสดงชื่อของ Mesh ที่พบในโมเดล
				}
			});
			M3D.scene.add(model); // เพิ่มโมเดลลงใน Scene
		},
		function(xhr) { // Function ทำงานเมื่อการโหลดโมเดล 3D กำลังดำเนินการ
			console.log((xhr.loaded / xhr.total * 100) + '% bridge loaded'); // แสดงเปอร์เซ็นต์การโหลดโมเดล
		},
		function(error) { // Function ทำงานเมื่อโหลดโมเดล 3D ไม่สำเร็จ
			console.error('An error happened while loading the model:', error); // แสดงข้อผิดพลาดหากโหลดโมเดลไม่สำเร็จ
		}
	);

	// โมเดลเมฆ (cloud) เคลื่อนที่
	const clouds = []; // เก็บโมเดล cloud ที่โหลดมา
  	// model Cloud
	loader.load(
		'assets/cloud.glb', // URL ของโมเดล 3D ที่จะโหลด (Backend / Server / Remote host)
		function(gltf) { // Function ทำงานเมื่อโหลดโมเดล 3D สำเร็จ, gltf คือข้อมูลโมเดลที่โหลดมา (json)
			const model = gltf.scene; // เข้าถึงโมเดลที่โหลดมา
			model.position.set(-10, 9, -13); // กำหนดตำแหน่งของโมเดลในฉาก
			model.scale.set(1.6, 1.6, 1.6); // ปรับขนาดโมเดล
			model.traverse((child) => { // วนลูปผ่านทุกส่วนของโมเดล (ในกรณีที่โมเดลมีหลายส่วนหรือ Mesh ย่อย)
				if (child.isMesh) { // ถ้า child เป็น Mesh
					child.castShadow = true; // ให้ Mesh สร้างเงา
					//child.receiveShadow = true; // ให้ Mesh รับเงา
					//console.log('Mesh found:', child.name); // แสดงชื่อของ Mesh ที่พบในโมเดล
				}
			});
			M3D.scene.add(model); // เพิ่มโมเดลลงใน Scene
			clouds.push(model); // เก็บโมเดล cloud ลงใน array
			
		},
		function(xhr) { // Function ทำงานเมื่อการโหลดโมเดล 3D กำลังดำเนินการ
			console.log((xhr.loaded / xhr.total * 100) + '% cloud loaded'); // แสดงเปอร์เซ็นต์การโหลดโมเดล
		},
		function(error) { // Function ทำงานเมื่อโหลดโมเดล 3D ไม่สำเร็จ
			console.error('An error happened while loading the model:', error); // แสดงข้อผิดพลาดหากโหลดโมเดลไม่สำเร็จ
		}
	);
	// model Cloud 2
	loader.load(
		'assets/cloud.glb', // URL ของโมเดล 3D ที่จะโหลด (Backend / Server / Remote host)
		function(gltf) { // Function ทำงานเมื่อโหลดโมเดล 3D สำเร็จ, gltf คือข้อมูลโมเดลที่โหลดมา (json)
			const model = gltf.scene; // เข้าถึงโมเดลที่โหลดมา
			model.position.set(11, 8, -13); // กำหนดตำแหน่งของโมเดลในฉาก
			model.scale.set(1, 1.20, 1); // ปรับขนาดโมเดล
			model.traverse((child) => { // วนลูปผ่านทุกส่วนของโมเดล (ในกรณีที่โมเดลมีหลายส่วนหรือ Mesh ย่อย)
				if (child.isMesh) { // ถ้า child เป็น Mesh
					child.castShadow = true; // ให้ Mesh สร้างเงา
					//child.receiveShadow = true; // ให้ Mesh รับเงา
					//console.log('Mesh found:', child.name); // แสดงชื่อของ Mesh ที่พบในโมเดล
				}
			});
			M3D.scene.add(model); // เพิ่มโมเดลลงใน Scene
			clouds.push(model); // เก็บโมเดล cloud ลงใน array
		},
		function(xhr) { // Function ทำงานเมื่อการโหลดโมเดล 3D กำลังดำเนินการ
			console.log((xhr.loaded / xhr.total * 100) + '% cloud loaded'); // แสดงเปอร์เซ็นต์การโหลดโมเดล
		},
		function(error) { // Function ทำงานเมื่อโหลดโมเดล 3D ไม่สำเร็จ
			console.error('An error happened while loading the model:', error); // แสดงข้อผิดพลาดหากโหลดโมเดลไม่สำเร็จ
		}
	);
	
	// ###############################################################

    // lights
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(0, 30, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    M3D.scene.add(sunLight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    M3D.scene.add(ambient);
    
    // Stats
    const stats = new Stats(); // สร้าง Stats เพื่อตรวจสอบประสิทธิภาพ
    document.body.appendChild(stats.dom); // เพิ่ม Stats ลงใน body ของ HTML

    // GUI
	const gui = new GUI(); // สร้าง GUI สำหรับปรับแต่งค่าต่างๆ 




    function animate() {
        M3D.controls.update();
        stats.update();
        FPS.update();
		// UPDATE state of objects here
        // TODO: อัปเดตสถานะของวัตถุต่างๆ ที่ต้องการในแต่ละเฟรม (เช่น การเคลื่อนที่, การหมุน ฯลฯ)
	
		// ### 3. กำหนดค่าสำหรับการเคลื่อนไหว ###
    	const cloudSpeed = 0.01; // ความเร็วในการเคลื่อนที่ของเมฆ (ปรับค่าได้)
    	const leftBoundary = -25; // จุดด้านซ้ายสุดที่เมฆจะหายไป
    	const rightBoundary = 25; // จุดด้านขวาที่เมฆจะกลับมาเกิดใหม่
        // การเคลื่อนไหวของเมฆ 
        clouds.forEach(cloud => {
            // ขยับเมฆไปทางซ้ายในแต่ละเฟรม
            cloud.position.x -= cloudSpeed;

            // ตรวจสอบว่าเมฆเคลื่อนที่เลยขอบเขตด้านซ้ายไปหรือยัง
            if (cloud.position.x < leftBoundary) {
                // ถ้าใช่, ให้ย้ายตำแหน่งกลับไปเริ่มต้นที่ด้านขวา
                cloud.position.x = rightBoundary;
            }
        });

        // RENDER scene and camera
        M3D.renderer.render(M3D.scene, M3D.camera); // เรนเดอร์ฉาก
        M3D.cssRenderer.render(M3D.scene, M3D.camera); // เรนเดอร์ CSS2DRenderer
        console.log(`FPS: ${FPS.fps}`); // แสดงค่า FPS ในคอนโซล
    }
}