import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { generateCharacterSkinTexture, createBlockTexture } from '../interviewer/skinTextures';

export default function MinecraftInterviewRoom3D({
  characterId = 'arjun',
  interviewerState = 'IDLE', // IDLE, SPEAKING, LISTENING, THINKING, FOLLOW_UP, COMPLETED
  speechActive = false,
  className = ''
}) {
  const containerRef = useRef(null);
  const animFrameId = useRef(null);

  const stateRef = useRef({
    state: interviewerState,
    speechActive: speechActive,
    normalTex: null,
    blinkTex: null,
    speakTex: null,
    headMesh: null,
    headGroup: null,
    leftArm: null,
    rightArm: null,
    lanternLight: null,
    charGroup: null
  });

  useEffect(() => {
    stateRef.current.state = interviewerState;
    stateRef.current.speechActive = speechActive;
  }, [interviewerState, speechActive]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#161e29');
    scene.fog = new THREE.FogExp2('#141c28', 0.035);

    // Camera positioned across desk looking directly at interviewer (40-50% focal height)
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 80);
    camera.position.set(0, 1.45, 3.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Shader-inspired Lighting System
    // Cool ambient room light
    const ambientLight = new THREE.AmbientLight('#93c5fd', 0.55);
    scene.add(ambientLight);

    // Cool daylight streaming through window
    const windowSun = new THREE.DirectionalLight('#e0f2fe', 0.85);
    windowSun.position.set(4, 3, -1);
    windowSun.castShadow = true;
    scene.add(windowSun);

    // Warm lantern light with soft shadow & flickering
    const lanternLight = new THREE.PointLight('#f59e0b', 1.6, 7);
    lanternLight.position.set(-1.6, 2.3, 0.4);
    lanternLight.castShadow = true;
    scene.add(lanternLight);
    stateRef.current.lanternLight = lanternLight;

    // Soft front fill light for interviewer visibility
    const faceFill = new THREE.DirectionalLight('#ffffff', 0.4);
    faceFill.position.set(0, 1.6, 3.2);
    scene.add(faceFill);

    // 3. Environment: Office Geometry & Textures
    const oakPlanksTex = createBlockTexture('oak_planks');
    const darkOakTex = createBlockTexture('dark_oak');
    const stoneTex = createBlockTexture('stone');
    const bookshelfTex = createBlockTexture('bookshelf');

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.MeshStandardMaterial({ map: oakPlanksTex, roughness: 0.85 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.6;
    floor.receiveShadow = true;
    scene.add(floor);

    // Back Wall
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(12, 6, 0.3),
      new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.9 })
    );
    backWall.position.set(0, 2, -2.6);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Window opening in back wall
    const windowFrame = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 2.2, 0.2),
      new THREE.MeshStandardMaterial({ color: '#181b22', roughness: 0.7 })
    );
    windowFrame.position.set(2.4, 2.2, -2.48);
    scene.add(windowFrame);

    // Window daylight sky
    const windowSky = new THREE.Mesh(
      new THREE.PlaneGeometry(3.0, 2.0),
      new THREE.MeshBasicMaterial({ color: '#38bdf8' })
    );
    windowSky.position.set(2.4, 2.2, -2.46);
    scene.add(windowSky);

    // Distant block mountain peaks visible outside window
    const mtnMat = new THREE.MeshBasicMaterial({ color: '#1e293b' });
    const mtnSnowMat = new THREE.MeshBasicMaterial({ color: '#e2e8f0' });
    for (let m = 0; m < 5; m++) {
      const mh = 0.5 + (m % 3) * 0.4;
      const mbox = new THREE.Mesh(
        new THREE.BoxGeometry(0.8 + m * 0.2, mh, 0.1),
        m === 2 ? mtnSnowMat : mtnMat
      );
      mbox.position.set(1.5 + m * 0.45, 1.4 + mh / 2, -2.42);
      scene.add(mbox);
    }

    // Left Wall Bookshelves
    const bookshelf = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 4, 3.4),
      new THREE.MeshStandardMaterial({ map: bookshelfTex, roughness: 0.8 })
    );
    bookshelf.position.set(-3.2, 1.4, -0.6);
    bookshelf.castShadow = true;
    bookshelf.receiveShadow = true;
    scene.add(bookshelf);

    // Wooden Desk in Foreground
    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 0.8, 1.9),
      new THREE.MeshStandardMaterial({ map: darkOakTex, roughness: 0.7 })
    );
    desk.position.set(0, -0.2, 1.15);
    desk.castShadow = true;
    desk.receiveShadow = true;
    scene.add(desk);

    // Desk Props: Quill, document sheets, coffee mug
    const papers = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.02, 1.0),
      new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.6 })
    );
    papers.position.set(-0.9, 0.21, 1.0);
    papers.rotation.y = 0.12;
    papers.receiveShadow = true;
    scene.add(papers);

    const mug = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.28, 0.22),
      new THREE.MeshStandardMaterial({ color: '#00E5C3', roughness: 0.4, metalness: 0.1 })
    );
    mug.position.set(1.2, 0.35, 1.1);
    mug.castShadow = true;
    scene.add(mug);

    // Hanging Iron Lantern
    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(-1.6, 2.3, 0.4);

    const chain = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.7, 0.04),
      new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.8, roughness: 0.3 })
    );
    chain.position.y = 0.35;
    lanternGroup.add(chain);

    const lanternCore = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.42, 0.32),
      new THREE.MeshStandardMaterial({
        color: '#f59e0b',
        emissive: '#f59e0b',
        emissiveIntensity: 1.8,
        roughness: 0.2
      })
    );
    lanternGroup.add(lanternCore);
    scene.add(lanternGroup);

    // 4. Interviewer Character (Chest / Shoulders Upward Across Desk)
    const normalTex = generateCharacterSkinTexture(characterId, false, 0);
    const blinkTex = generateCharacterSkinTexture(characterId, true, 0);
    const speakTex = generateCharacterSkinTexture(characterId, false, 0.7);

    stateRef.current.normalTex = normalTex;
    stateRef.current.blinkTex = blinkTex;
    stateRef.current.speakTex = speakTex;

    const skinMat = new THREE.MeshStandardMaterial({ map: normalTex, roughness: 0.85 });

    const charRoot = new THREE.Group();
    charRoot.position.set(0, 0.2, 0); // Positioned behind desk
    stateRef.current.charGroup = charRoot;

    // Torso (0.8 x 1.2 x 0.4)
    const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.4), skinMat);
    torsoMesh.position.set(0, 0.55, 0);
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    charRoot.add(torsoMesh);

    // Head (0.8 x 0.8 x 0.8)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.55, 0);

    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), skinMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);
    stateRef.current.headMesh = headMesh;

    // Hair outer layer
    const hairLayer = new THREE.Mesh(
      new THREE.BoxGeometry(0.86, 0.45, 0.86),
      new THREE.MeshStandardMaterial({ map: normalTex, roughness: 0.9, transparent: true })
    );
    hairLayer.position.set(0, 0.2, 0);
    headGroup.add(hairLayer);

    charRoot.add(headGroup);
    stateRef.current.headGroup = headGroup;

    // Right Arm (resting near desk)
    const armGeo = new THREE.BoxGeometry(0.4, 1.2, 0.4);
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(-0.6, 1.05, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, skinMat);
    rightArmMesh.position.set(0, -0.5, 0);
    rightArmMesh.rotation.x = 0.25;
    rightArmMesh.castShadow = true;
    rightArmGroup.add(rightArmMesh);
    charRoot.add(rightArmGroup);
    stateRef.current.rightArm = rightArmGroup;

    // Left Arm
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(0.6, 1.05, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, skinMat);
    leftArmMesh.position.set(0, -0.5, 0);
    leftArmMesh.rotation.x = 0.25;
    leftArmMesh.castShadow = true;
    leftArmGroup.add(leftArmMesh);
    charRoot.add(leftArmGroup);
    stateRef.current.leftArm = leftArmGroup;

    scene.add(charRoot);

    // 5. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const state = stateRef.current.state;
      const isSpeaking = state === 'SPEAKING' || stateRef.current.speechActive;

      // Subtle lantern flicker
      if (stateRef.current.lanternLight) {
        stateRef.current.lanternLight.intensity = 1.55 + Math.sin(time * 6.0) * 0.08;
      }

      // Blinking cycle
      const blinkCycle = time % 3.6;
      const isBlinking = blinkCycle > 3.45 && blinkCycle < 3.6;

      if (headMesh && headMesh.material) {
        if (isBlinking) {
          headMesh.material.map = stateRef.current.blinkTex;
        } else if (isSpeaking) {
          const mouthOpen = Math.sin(time * 15) > 0;
          headMesh.material.map = mouthOpen ? stateRef.current.speakTex : stateRef.current.normalTex;
        } else {
          headMesh.material.map = stateRef.current.normalTex;
        }
        headMesh.material.needsUpdate = true;
      }

      // Subtle breathing motion
      const breathe = Math.sin(time * 1.8) * 0.012;
      charRoot.position.y = 0.2 + breathe;

      // State Kinetics
      if (headGroup) {
        if (isSpeaking) {
          headGroup.rotation.x = Math.sin(time * 3.5) * 0.035;
          headGroup.rotation.y = Math.sin(time * 1.5) * 0.05;
          headGroup.rotation.z = Math.sin(time * 2.0) * 0.015;

          if (leftArmGroup && rightArmGroup) {
            leftArmGroup.rotation.x = Math.sin(time * 2.8) * 0.08;
            rightArmGroup.rotation.x = -Math.sin(time * 2.8) * 0.08;
          }
        } else if (state === 'LISTENING') {
          // Attentive forward gaze with affirmative periodic nod
          headGroup.rotation.x = 0.05 + Math.sin(time * 0.8) * 0.02;
          headGroup.rotation.y = Math.sin(time * 0.5) * 0.02;
          headGroup.rotation.z = -0.01;

          const nodCycle = time % 4.0;
          if (nodCycle < 0.5) {
            headGroup.rotation.x += Math.sin(nodCycle * Math.PI / 0.5) * 0.07;
          }
        } else if (state === 'THINKING') {
          headGroup.rotation.x = -0.03;
          headGroup.rotation.y = -0.07;
          headGroup.rotation.z = 0.06; // Pensive lateral tilt
        } else {
          // IDLE
          headGroup.rotation.x = Math.sin(time * 1.2) * 0.012;
          headGroup.rotation.y = Math.sin(time * 0.7) * 0.025;
          headGroup.rotation.z = 0;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 6. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [characterId]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full select-none ${className}`}
    />
  );
}
