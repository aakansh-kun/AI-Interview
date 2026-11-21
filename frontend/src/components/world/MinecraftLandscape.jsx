import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createBlockTexture } from '../interviewer/skinTextures';

export default function MinecraftLandscape({ className = '', style = {} }) {
  const containerRef = useRef(null);
  const animFrameId = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1c2838'); // Morning dawn sky
    scene.fog = new THREE.FogExp2('#1a2938', 0.024);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 150);
    camera.position.set(0, 4.2, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Cinematic Shader-style Lighting
    // Ambient dawn light
    const ambientLight = new THREE.AmbientLight('#a5b4fc', 0.65);
    scene.add(ambientLight);

    // Morning golden sun streaming through valley
    const sunLight = new THREE.DirectionalLight('#fed7aa', 1.35);
    sunLight.position.set(-18, 16, -10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.camera.left = -20;
    sunLight.shadow.camera.right = 20;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    scene.add(sunLight);

    // Soft sky fill
    const skyFill = new THREE.DirectionalLight('#38bdf8', 0.4);
    skyFill.position.set(12, 10, 10);
    scene.add(skyFill);

    // Textures
    const grassTopTex = createBlockTexture('grass_top');
    const grassSideTex = createBlockTexture('grass_side');
    const stoneTex = createBlockTexture('stone');
    const pineLeavesTex = createBlockTexture('pine_leaves');
    const darkOakTex = createBlockTexture('dark_oak');

    // 3. BACKGROUND: Distant Stepped Block Mountains
    const mountainGroup = new THREE.Group();
    const mtnStoneMat = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.9 });
    const mtnSnowMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.8 });

    // Procedural mountain peaks
    const mountainPositions = [
      { x: -14, z: -35, height: 16, width: 14 },
      { x: -2,  z: -42, height: 22, width: 18 },
      { x: 12,  z: -38, height: 18, width: 15 },
      { x: 26,  z: -45, height: 24, width: 20 },
      { x: -28, z: -40, height: 20, width: 16 }
    ];

    mountainPositions.forEach(peak => {
      const steps = 7;
      for (let s = 0; s < steps; s++) {
        const tierWidth = peak.width * (1 - s / steps);
        const tierHeight = (peak.height / steps);
        const y = s * tierHeight;
        const isSnow = s >= steps - 2;
        const boxGeo = new THREE.BoxGeometry(tierWidth, tierHeight, tierWidth * 0.7);
        const box = new THREE.Mesh(boxGeo, isSnow ? mtnSnowMat : mtnStoneMat);
        box.position.set(peak.x, y, peak.z);
        box.castShadow = true;
        box.receiveShadow = true;
        mountainGroup.add(box);
      }
    });
    scene.add(mountainGroup);

    // 4. MIDGROUND & FOREGROUND: Stepped Grass Terrain
    const terrainGroup = new THREE.Group();
    const grassMat = new THREE.MeshStandardMaterial({ map: grassTopTex, roughness: 0.85 });
    const dirtMat = new THREE.MeshStandardMaterial({ color: '#573a21', roughness: 0.9 });

    // Valley floor
    for (let x = -30; x <= 30; x += 3) {
      for (let z = -25; z <= 15; z += 3) {
        // Natural valley curve
        const distFromCenter = Math.abs(x);
        const elevation = Math.sin(x * 0.15) * 0.8 + Math.cos(z * 0.12) * 0.6 + (distFromCenter > 8 ? (distFromCenter - 8) * 0.45 : 0);
        const h = Math.max(1, Math.round(elevation * 2) / 2);

        const blockGeo = new THREE.BoxGeometry(3, h, 3);
        const block = new THREE.Mesh(blockGeo, grassMat);
        block.position.set(x, h / 2 - 2, z);
        block.receiveShadow = true;
        terrainGroup.add(block);
      }
    }
    scene.add(terrainGroup);

    // 5. MIDGROUND: Cozy Minecraft Interview Cabin
    const cabinGroup = new THREE.Group();
    cabinGroup.position.set(3, 1.2, -8);

    // Stone foundation
    const foundation = new THREE.Mesh(
      new THREE.BoxGeometry(5.4, 0.8, 4.4),
      new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.8 })
    );
    foundation.position.y = 0.4;
    foundation.castShadow = true;
    foundation.receiveShadow = true;
    cabinGroup.add(foundation);

    // Dark oak walls
    const walls = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 2.6, 3.8),
      new THREE.MeshStandardMaterial({ map: darkOakTex, roughness: 0.75 })
    );
    walls.position.y = 2.1;
    walls.castShadow = true;
    walls.receiveShadow = true;
    cabinGroup.add(walls);

    // Glowing warm windows (glass panes emitting lantern light)
    const windowMat = new THREE.MeshStandardMaterial({
      color: '#fbbf24',
      emissive: '#f59e0b',
      emissiveIntensity: 1.8,
      roughness: 0.3
    });
    const win1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 0.1), windowMat);
    win1.position.set(-1.2, 2.2, 1.95);
    cabinGroup.add(win1);

    const win2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 0.1), windowMat);
    win2.position.set(1.2, 2.2, 1.95);
    cabinGroup.add(win2);

    // Cabin warm point light (lantern glow spilling out)
    const cabinLight = new THREE.PointLight('#f59e0b', 2.0, 10);
    cabinLight.position.set(0, 2.2, 2.5);
    cabinGroup.add(cabinLight);

    // Stepped dark oak roof
    for (let r = 0; r < 4; r++) {
      const roofLayer = new THREE.Mesh(
        new THREE.BoxGeometry(5.6 - r * 1.1, 0.5, 4.6 - r * 0.9),
        new THREE.MeshStandardMaterial({ map: darkOakTex, roughness: 0.7 })
      );
      roofLayer.position.y = 3.6 + r * 0.45;
      roofLayer.castShadow = true;
      cabinGroup.add(roofLayer);
    }

    scene.add(cabinGroup);

    // 6. Pine / Spruce Trees (Voxel Minecraft style)
    const treeGroup = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ map: darkOakTex, roughness: 0.8 });
    const leavesMat = new THREE.MeshStandardMaterial({ map: pineLeavesTex, roughness: 0.85 });

    function createPineTree(tx, tz, treeScale = 1.0) {
      const singleTree = new THREE.Group();
      singleTree.position.set(tx, 0, tz);

      // Trunk
      const trunkH = 3.5 * treeScale;
      const trunk = new THREE.Mesh(
        new THREE.BoxGeometry(0.6 * treeScale, trunkH, 0.6 * treeScale),
        trunkMat
      );
      trunk.position.y = trunkH / 2;
      trunk.castShadow = true;
      singleTree.add(trunk);

      // Stepped leaves tiers (pine cone shape)
      const tiers = [
        { y: trunkH * 0.55, size: 2.8 * treeScale, h: 0.8 * treeScale },
        { y: trunkH * 0.8,  size: 2.2 * treeScale, h: 0.8 * treeScale },
        { y: trunkH * 1.05, size: 1.5 * treeScale, h: 0.8 * treeScale },
        { y: trunkH * 1.3,  size: 0.9 * treeScale, h: 0.9 * treeScale }
      ];

      tiers.forEach(tier => {
        const leafBox = new THREE.Mesh(
          new THREE.BoxGeometry(tier.size, tier.h, tier.size),
          leavesMat
        );
        leafBox.position.y = tier.y;
        leafBox.castShadow = true;
        singleTree.add(leafBox);
      });

      return singleTree;
    }

    // Place pine trees across foreground and midground ridges
    const treeCoords = [
      { x: -8, z: 2, s: 1.2 },
      { x: -12, z: -3, s: 1.4 },
      { x: -5, z: -9, s: 1.1 },
      { x: 9, z: -5, s: 1.3 },
      { x: 13, z: 1, s: 1.2 },
      { x: 16, z: -11, s: 1.5 },
      { x: -16, z: -15, s: 1.6 },
      { x: 8, z: -15, s: 1.4 }
    ];

    treeCoords.forEach(c => {
      treeGroup.add(createPineTree(c.x, c.z, c.s));
    });
    scene.add(treeGroup);

    // 7. Drifting 3D Block Clouds in Sky
    const cloudGroup = new THREE.Group();
    const cloudMat = new THREE.MeshBasicMaterial({
      color: '#e2e8f0',
      transparent: true,
      opacity: 0.85
    });

    const clouds = [];
    for (let i = 0; i < 7; i++) {
      const w = 6 + (i % 3) * 3;
      const h = 1.2;
      const d = 4 + (i % 2) * 2;
      const cloud = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), cloudMat);
      cloud.position.set(-25 + i * 9, 14 + (i % 3) * 1.5, -20 - (i % 4) * 5);
      cloudGroup.add(cloud);
      clouds.push(cloud);
    }
    scene.add(cloudGroup);

    // 8. Mouse Parallax & Animation Loop
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onPointerMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('pointermove', onPointerMove);

    let clock = new THREE.Clock();

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smooth camera parallax
      targetX = mouseX * 1.2;
      targetY = 4.2 + mouseY * 0.6;
      camera.position.x += (targetX - camera.position.x) * 0.03;
      camera.position.y += (targetY - camera.position.y) * 0.03;
      camera.lookAt(1, 2.5, -8); // Keep gaze on the valley cabin and mountains

      // Drift clouds slowly
      clouds.forEach((cloud, idx) => {
        cloud.position.x += 0.015;
        if (cloud.position.x > 35) {
          cloud.position.x = -35;
        }
      });

      // Subtle cabin lantern flicker
      cabinLight.intensity = 1.9 + Math.sin(time * 5.0) * 0.15;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none z-0 ${className}`}
      style={style}
    />
  );
}
