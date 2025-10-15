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
    
    // === วาดพื้นดินสองฝั่ง === 
        const groundWidth = 20; // ความกว้างของพื้นดิน
        const groundHeight = 40; // ความยาวของพื้นดิน
        const groundDepth = 1; // ความหนาของพื้นดิน
        const groundY = -2; // ตำแหน่งแกน Y ของพื้นดิน

    // ดินฝั่งซ้าย (ใช้ BoxGeometry)
        const leftGroundGeometry = new THREE.BoxGeometry(groundWidth, groundDepth, groundHeight); // ใช้ BoxGeometry สำหรับพื้นดิน
        const leftGroundMaterial = new THREE.MeshStandardMaterial({ color: 0x8B5A2B }); 
        const leftGround = new THREE.Mesh(leftGroundGeometry, leftGroundMaterial); // สร้าง Mesh
        leftGround.position.set(-12, groundY - groundDepth/2, 0); // วางพื้นดิน
        leftGround.castShadow = true; // ให้พื้นดินสร้างเงา
        leftGround.receiveShadow = true; // ให้พื้นดินรับเงา
        M3D.scene.add(leftGround); // เพิ่มพื้นดินลงใน Scene

    // ดินฝั่งขวา (ใช้ BoxGeometry)
        const rightGroundGeometry = new THREE.BoxGeometry(groundWidth, groundDepth, groundHeight); // ใช้ BoxGeometry สำหรับพื้นดิน
        const rightGroundMaterial = new THREE.MeshStandardMaterial({ color: 0xA0522D }); 
        const rightGround = new THREE.Mesh(rightGroundGeometry, rightGroundMaterial); // สร้าง Mesh
        rightGround.position.set(12, groundY - groundDepth/2, 0);
        rightGround.castShadow = true; // ให้พื้นดินสร้างเงา
        rightGround.receiveShadow = true; // ให้พื้นดินรับเงา
        M3D.scene.add(rightGround); // เพิ่มพื้นดินลงใน Scene

    // ดินตรงกลางด้านล่าง 
        const centerGroundDepth = groundDepth / 2; // ความหนาของดินตรงกลาง
        const centerGroundWidth = 4; // ความกว้างของดินตรงกลาง
        const centerGroundHeight = groundHeight; // ความยาวของดินตรงกลาง
        const centerGroundY = groundY - groundDepth/2 - centerGroundDepth/2; // ตำแหน่งแกน Y ของดินตรงกลาง
        const centerGroundGeometry = new THREE.BoxGeometry(centerGroundWidth, centerGroundDepth, centerGroundHeight); // ใช้ BoxGeometry สำหรับดินตรงกลาง
        const centerGroundMaterial = new THREE.MeshStandardMaterial({ color: 0xC2B280 }); 
        const centerGround = new THREE.Mesh(centerGroundGeometry, centerGroundMaterial); // สร้าง Mesh
        centerGround.position.set(0, centerGroundY, 0); // วางดินตรงกลาง
        centerGround.castShadow = false; // ให้พื้นดินสร้างเงา
        centerGround.receiveShadow = true; // ให้พื้นดินรับเงา
        M3D.scene.add(centerGround); // เพิ่มดินตรงกลางลงใน Scene

    // === แม่น้ำ ===
        const riverDepth = centerGroundDepth; // ความหนาของแม่น้ำ
        const riverWidth = centerGroundWidth; // ความกว้างของแม่น้ำ
        const riverHeight = groundHeight; // ความยาวของแม่น้ำ
        const riverY = centerGroundY + centerGroundDepth/2;  // ตำแหน่งแกน Y ของแม่น้ำ (วางบนดินตรงกลาง)
        const riverGeometry = new THREE.BoxGeometry(riverWidth, riverDepth, riverHeight); // ใช้ BoxGeometry สำหรับแม่น้ำ
        const riverMaterial = new THREE.MeshStandardMaterial({ color: 0x4FC3F7, transparent: true, opacity: 0.85 });    
        const river = new THREE.Mesh(riverGeometry, riverMaterial); // สร้าง Mesh
        river.position.set(0, riverY, 0); // ให้แม่น้ำอยู่บนดินตรงกลาง
        river.castShadow = false; // แม่น้ำไม่สร้างเงา
        river.receiveShadow = false; // แม่น้ำไม่รับเงา
        M3D.scene.add(river); // เพิ่มแม่น้ำลงใน Scene

    // === หญ้าด้านบนของพื้นดิน ===
        const grassThickness = 0.1; // ความหนาของหญ้า
        const grassOffsetY = groundDepth / 2 + grassThickness / 2 + -0.5; // ตำแหน่งแกน Y ของหญ้า (วางบนพื้นดิน)

    // หญ้าฝั่งซ้าย
        const leftGrassGeometry = new THREE.BoxGeometry(groundWidth, grassThickness, groundHeight); // ใช้ BoxGeometry สำหรับหญ้า
        const leftGrassMaterial = new THREE.MeshStandardMaterial({ color: 0x55c157 }); 
        const leftGrass = new THREE.Mesh(leftGrassGeometry, leftGrassMaterial); // สร้าง Mesh
        leftGrass.position.set(-12, groundY + grassOffsetY, 0); // วางหญ้าบนพื้นดิน
        leftGrass.castShadow = true; // หญ้าสร้างเงา
        leftGrass.receiveShadow = true; // หญ้ารับเงา
        M3D.scene.add(leftGrass); // เพิ่มหญ้าลงใน Scene

    // หญ้าฝั่งขวา
        const rightGrassGeometry = new THREE.BoxGeometry(groundWidth, grassThickness, groundHeight); // ใช้ BoxGeometry สำหรับหญ้า
        const rightGrassMaterial = new THREE.MeshStandardMaterial({ color: 0x55c157 }); 
        const rightGrass = new THREE.Mesh(rightGrassGeometry, rightGrassMaterial); // สร้าง Mesh
        rightGrass.position.set(12, groundY + grassOffsetY, 0); // วางหญ้าบนพื้นดิน
        rightGrass.castShadow = true; // หญ้าสร้างเงา
        rightGrass.receiveShadow = true; // หญ้ารับเงา
        M3D.scene.add(rightGrass); // เพิ่มหญ้าลงใน Scene

    // === ภูเขา 3 ลูก ===
        const mountainData = [
            { posX: -13 , posZ: -11, posY: -12, radius: 9, heightScale: 1, color: 0x006400 }, // ภูเขาลูกที่ 1
            { posX: 2, posZ: -11, posY: -13, radius: 10, heightScale: 1, color: 0x1a4f08 }, // ภูเขาลูกที่ 2
            { posX: 14, posZ: -12, posY: -9, radius: 8, heightScale: 0.8, color: 0x1a4f08 }, // ภูเขาลูกที่ 3
        ];

        mountainData.forEach(m => {
            // ใช้ SphereGeometry เฉพาะครึ่งวงกลม (thetaLength: Math.PI/2)
            const geometry = new THREE.SphereGeometry(m.radius, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2); // ครึ่งวงกลม
            // ปรับความยาว (แกน Y) ด้วย scale
            const heightScale = m.heightScale || 1; // ค่าปรับความสูง (ถ้าไม่มีใช้ 1)
            geometry.scale(1, heightScale, 1); // ปรับความสูงของภูเขา
            const material = new THREE.MeshStandardMaterial({ color: m.color }); // สีของภูเขา
            const mountain = new THREE.Mesh(geometry, material); // สร้าง Mesh
            // วางให้ฐานอยู่บนพื้น
            mountain.position.set(m.posX, m.posY + m.radius * heightScale, m.posZ); // วางภูเขา
            mountain.castShadow = true; // ภูเขาสร้างเงา
            mountain.receiveShadow = true; // ภูเขารับเงา
            M3D.scene.add(mountain); // เพิ่มภูเขาลงใน Scene
        });


    // === ดินสำหรับทุ่งนา  ===
        const riceFieldWidth = groundWidth * 0.80; // ความกว้างของทุ่งนา
        const riceFieldHeight = groundHeight * 0.30; // ความยาวของทุ่งนา
        const riceFieldDepth = 0.60; // ความหนาของทุ่งนา
        const riceFieldY = groundY + groundDepth/2 + grassThickness + riceFieldDepth/2 + -1; // ตำแหน่งแกน Y ของทุ่งนา
        const riceFieldGeometry = new THREE.BoxGeometry(riceFieldWidth, riceFieldDepth, riceFieldHeight); // ใช้ BoxGeometry สำหรับทุ่งนา
        const riceFieldMaterial = new THREE.MeshStandardMaterial({ color: 0xa37f51 }); // สีเขียวอ่อนทุ่งนา
        const riceField = new THREE.Mesh(riceFieldGeometry, riceFieldMaterial); // สร้าง Mesh
        riceField.position.set(12.5, riceFieldY, 10); // วางทุ่งนาบนหญ้า
        riceField.castShadow = false; // ทุ่งนาไม่สร้างเงา
        riceField.receiveShadow = true; // ทุ่งนารับเงา
        M3D.scene.add(riceField); // เพิ่มทุ่งนาลงใน Scene

    // === ต้นข้าว ===
        function addRicePlant(x, z, yBase, scale=1) {  
            const group = new THREE.Group(); // กลุ่มของใบข้าว
            const bladeHeight = 1 * scale; // ความสูงของใบข้าว
            const bladeRadius = 0.20 * scale; // ความกว้างของใบข้าว
            const color = 0xFFFF00
            for (let i = 0; i < 3; i++) { // ใบข้าว 3 ใบ
                const geometry = new THREE.ConeGeometry(bladeRadius, bladeHeight, 10); // ใช้ ConeGeometry สำหรับใบข้าว
                const material = new THREE.MeshStandardMaterial({ color }); // สีของใบข้าว
                const blade = new THREE.Mesh(geometry, material); // สร้าง Mesh
                blade.position.y = bladeHeight/2; // วางใบข้าวให้ฐานอยู่ที่ y=0
                blade.castShadow = true; // ใบข้าวสร้างเงา
                blade.receiveShadow = true; // ใบข้าวรับเงา
                blade.rotation.z = (i-1) * Math.PI/8; // -1,0,1 => -22.5, 0, 22.5 deg ใบข้าวแต่ละใบเอียงไม่เท่ากัน
                blade.rotation.y = Math.random() * Math.PI * 2; // หมุนใบข้าวรอบแกน Y แบบสุ่ม
                group.add(blade); // เพิ่มใบข้าวลงในกลุ่ม
            }
            group.position.set(x, yBase + -1 * scale, z); // ปรับตำแหน่งให้ฐานอยู่ที่ yBase
            M3D.scene.add(group); // เพิ่มกลุ่มใบข้าวลงใน Scene
        }
  
    // เรียงต้นข้าวเป็นแถว
        const riceRowCount = 10; // จำนวนแถว
        const riceColCount = 10; // จำนวนต้นข้าวต่อแถว
        const riceRowStartX = 15 - groundWidth/2 + 0.5; // เว้นขอบซ้าย 0.5
        const riceRowEndX = 10 + groundWidth/2 - 0.5; // เว้นขอบขวา 0.5
        const riceRowStartZ = 5; // เว้นขอบบน 0.5
        const riceRowEndZ = 15; // เว้นขอบล่าง 0.5
        const riceRowY = groundY + groundDepth/2 + grassThickness + 0.01; // วางบนหญ้า
        for (let row = 0; row < riceRowCount; row++) { 
            const z = riceRowStartZ + (riceRowEndZ - riceRowStartZ) * (row/(riceRowCount-1));  // ตำแหน่งแกน Z ของแถว
            for (let col = 0; col < riceColCount; col++) {
                const x = riceRowStartX + (riceRowEndX - riceRowStartX) * (col/(riceColCount-1)); // ตำแหน่งแกน X ของต้นข้าว
                addRicePlant(x, z, riceRowY, 1); // เพิ่มต้นข้าวลงใน Scene
            }
        }

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
        'assets/house.glb', // URL ของโมเดล 3D ที่จะโหลด (Backend / Server / Remote host)
        function(gltf) { // Function ทำงานเมื่อโหลดโมเดล 3D สำเร็จ, gltf คือข้อมูลโมเดลที่โหลดมา (json)
            const model = gltf.scene; // เข้าถึงโมเดลที่โหลดมา
            model.position.set(-12, -1.90, 8); // กำหนดตำแหน่งของโมเดลในฉาก
            model.scale.set(0.40, 0.40, 0.40); // ปรับขนาดโมเดล
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
            console.log((xhr.loaded / xhr.total * 100) + '% house loaded'); // แสดงเปอร์เซ็นต์การโหลดโมเดล
        },
        function(error) { // Function ทำงานเมื่อโหลดโมเดล 3D ไม่สำเร็จ
            console.error('An error happened while loading the model:', error); // แสดงข้อผิดพลาดหากโหลดโมเดลไม่สำเร็จ
        }
    );

    // model tree
    loader.load(
        'assets/tree.glb', // URL ของโมเดล 3D ที่จะโหลด (Backend / Server / Remote host)
        function(gltf) { // Function ทำงานเมื่อโหลดโมเดล 3D สำเร็จ, gltf คือข้อมูลโมเดลที่โหลดมา (json)
            const model = gltf.scene; // เข้าถึงโมเดลที่โหลดมา
            model.position.set(-10, -1.90, 6); // กำหนดตำแหน่งของโมเดลในฉาก
            model.scale.set(0.40, 0.40, 0.40); // ปรับขนาดโมเดล
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
            console.log((xhr.loaded / xhr.total * 100) + '% tree loaded'); // แสดงเปอร์เซ็นต์การโหลดโมเดล
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
        sunLight.position.set(0, 30, 20); // กำหนดตำแหน่งของแสง
        sunLight.castShadow = true; // ให้แสงสร้างเงา
        sunLight.shadow.mapSize.width = 2048; // ความละเอียดของ shadow map
        sunLight.shadow.mapSize.height = 2048; // ความละเอียดของ shadow map
        M3D.scene.add(sunLight); // เพิ่มแสงลงใน Scene

        const ambient = new THREE.AmbientLight(0xffffff, 0.4); // แสงรอบทิศทาง
        M3D.scene.add(ambient); // เพิ่มแสงลงใน Scene
    
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
    
        // ### กำหนดค่าสำหรับการเคลื่อนไหว ###
        const cloudSpeed = 0.05; // ความเร็วในการเคลื่อนที่ของเมฆ (ปรับค่าได้)
        const leftBoundary = -25; // จุดด้านซ้ายสุดที่เมฆจะหายไป
        const rightBoundary = 25; // จุดด้านขวาที่เมฆจะกลับมาเกิดใหม่
        // ### เคลื่อนที่เมฆในแต่ละเฟรม ###
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