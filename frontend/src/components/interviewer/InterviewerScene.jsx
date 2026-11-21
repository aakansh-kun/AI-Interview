import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  createHeadTexture,
  createTorsoTexture,
  createArmTexture,
  createWoodTexture,
  createBookshelfTexture
} from './skinTextures';

export default function InterviewerScene({
  interviewer,
  interviewerState = 'IDLE', // IDLE, SPEAKING, LISTENING, THINKING, FOLLOW_UP, COMPLETED
  speechActive = false,
  className = '',
  style = {}
}) {
  const containerRef = useRef(null);
  const animFrameId = useRef(null);

  // References to dynamic scene parts
  const sceneRefs = useRef({
    headMesh: null,
    headGroup: null,
    torsoGroup: null,
    leftArm: null,
    rightArm: null,
    lanternLight: null,
    cloudsGroup: null,
    jawMesh: null,
    lastBlinkTime: 0,
    isBlinking: false,
    mouthOpen: 0,
    skinConfig: null,
    headNormalTex: null,
    headBlinkTex: null,
    headSpeakTex: null,
    state: 'IDLE'
  });

  useEffect(() => {
    sceneRefs.current.state = interviewerState;
  }, [interviewerState]);

  useEffect(() => {
    if (!containerRef.current || !interviewer) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#10141d');
    scene.fog = new THREE.FogExp2('#10141d', 0.04);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.35, 3.8); // Framed on chest & head over desk

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Lighting (Shader-inspired Minecraft lighting)
    const ambientLight = new THREE.AmbientLight('#e0e7ff', 0.55);
    scene.add(ambientLight);

    // Window sunlight (warm gold/sky)
    const sunLight = new THREE.DirectionalLight('#ffeaa7', 0.85);
    sunLight.position.set(4, 3.5, 1);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // Lantern point light (warm flickering candle/lantern)
    const lanternLight = new THREE.PointLight('#ff9f43', 1.4, 6);
    lanternLight.position.set(-1.6, 2.1, 0.6);
    lanternLight.castShadow = true;
    scene.add(lanternLight);
    sceneRefs.current.lanternLight = lanternLight;

    // Face fill light (so facial features are always clear and engaging)
    const fillLight = new THREE.DirectionalLight('#ffffff', 0.35);
    fillLight.position.set(0, 1.8, 3.5);
    scene.add(fillLight);

    // 3. Environment: Room Geometry
    const woodTex = createWoodTexture('#6d4c2d', '#53371e');
    const darkWoodTex = createWoodTexture('#442d1d', '#301e12');
    const bookshelfTex = createBookshelfTexture();

    // Floor
    const floorGeo = new THREE.PlaneGeometry(10, 10);
    const floorMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.85 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.7;
    floor.receiveShadow = true;
    scene.add(floor);

    // Back Wall
    const wallGeo = new THREE.BoxGeometry(10, 6, 0.4);
    const wallMat = new THREE.MeshStandardMaterial({ color: '#2b303c', roughness: 0.9 });
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, 2, -2.5);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Window opening in back-right wall
    const windowFrameGeo = new THREE.BoxGeometry(2.2, 1.8, 0.2);
    const windowFrameMat = new THREE.MeshStandardMaterial({ color: '#1a1d24', roughness: 0.7 });
    const windowFrame = new THREE.Mesh(windowFrameGeo, windowFrameMat);
    windowFrame.position.set(2.4, 2.0, -2.28);
    scene.add(windowFrame);

    // Window glass pane with view of distant block mountains & sky
    const skyGeo = new THREE.PlaneGeometry(2.0, 1.6);
    const skyMat = new THREE.MeshBasicMaterial({ color: '#4a69bd' });
    const windowSky = new THREE.Mesh(skyGeo, skyMat);
    windowSky.position.set(2.4, 2.0, -2.26);
    scene.add(windowSky);

    // Distant block mountains visible through window
    const mountainGroup = new THREE.Group();
    const mtnMat = new THREE.MeshBasicMaterial({ color: '#2f3542' });
    const mtnMat2 = new THREE.MeshBasicMaterial({ color: '#57606f' });

    for (let i = 0; i < 5; i++) {
      const w = 0.5 + i * 0.2;
      const h = 0.4 + (i % 3) * 0.3;
      const mtnBlock = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.1), (i % 2 === 0) ? mtnMat : mtnMat2);
      mtnBlock.position.set(1.6 + i * 0.35, 1.4 + h / 2, -2.2);
      mountainGroup.add(mtnBlock);
    }
    scene.add(mountainGroup);

    // Block clouds floating in sky
    const cloudsGroup = new THREE.Group();
    const cloudMat = new THREE.MeshBasicMaterial({ color: '#dfe4ea', transparent: true, opacity: 0.85 });
    for (let c = 0; c < 3; c++) {
      const cloud = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.22, 0.1), cloudMat);
      cloud.position.set(1.8 + c * 0.7, 2.4 - c * 0.15, -2.2);
      cloudsGroup.add(cloud);
    }
    scene.add(cloudsGroup);
    sceneRefs.current.cloudsGroup = cloudsGroup;

    // Left Wall Bookshelves
    const shelfGeo = new THREE.BoxGeometry(0.5, 4, 3.2);
    const shelfMat = new THREE.MeshStandardMaterial({ map: bookshelfTex, roughness: 0.8 });
    const shelf = new THREE.Mesh(shelfGeo, shelfMat);
    shelf.position.set(-3.2, 1.4, -0.6);
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    scene.add(shelf);

    // Large Oak Desk in foreground
    const deskGeo = new THREE.BoxGeometry(4.2, 0.8, 1.8);
    const deskMat = new THREE.MeshStandardMaterial({ map: darkWoodTex, roughness: 0.7 });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(0, -0.2, 1.1);
    desk.receiveShadow = true;
    desk.castShadow = true;
    scene.add(desk);

    // Desk props: Quill & inkpot / laptop / document papers
    const paperGeo = new THREE.BoxGeometry(0.7, 0.02, 0.9);
    const paperMat = new THREE.MeshStandardMaterial({ color: '#f1f2f6', roughness: 0.6 });
    const papers = new THREE.Mesh(paperGeo, paperMat);
    papers.position.set(-0.8, 0.21, 1.0);
    papers.rotation.y = 0.15;
    papers.receiveShadow = true;
    scene.add(papers);

    // Flower pot or block mug on desk
    const mugGeo = new THREE.BoxGeometry(0.2, 0.28, 0.2);
    const mugMat = new THREE.MeshStandardMaterial({ color: '#b33939', roughness: 0.4 });
    const mug = new THREE.Mesh(mugGeo, mugMat);
    mug.position.set(1.2, 0.35, 1.2);
    mug.castShadow = true;
    scene.add(mug);

    // Hanging Lantern
    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(-1.6, 2.2, 0.6);

    const ironChainGeo = new THREE.BoxGeometry(0.04, 0.7, 0.04);
    const ironMat = new THREE.MeshStandardMaterial({ color: '#1e272e', metalness: 0.8, roughness: 0.3 });
    const chain = new THREE.Mesh(ironChainGeo, ironMat);
    chain.position.y = 0.35;
    lanternGroup.add(chain);

    const lanternBoxGeo = new THREE.BoxGeometry(0.3, 0.4, 0.3);
    const lanternCoreMat = new THREE.MeshStandardMaterial({
      color: '#ffa801',
      emissive: '#ff9f43',
      emissiveIntensity: 1.5,
      roughness: 0.2
    });
    const lanternBox = new THREE.Mesh(lanternBoxGeo, lanternCoreMat);
    lanternGroup.add(lanternBox);
    scene.add(lanternGroup);

    // 4. Minecraft Interviewer Character (Chest & Shoulders Upward)
    const skinConfig = interviewer.skinConfig || {};
    sceneRefs.current.skinConfig = skinConfig;

    // Character Group
    const characterGroup = new THREE.Group();
    characterGroup.position.set(0, 0.2, 0); // Positioned comfortably behind the desk

    // Torso (1.1 x 1.4 x 0.55)
    const torsoGeo = new THREE.BoxGeometry(1.1, 1.4, 0.55);
    const torsoTex = createTorsoTexture(skinConfig);
    const torsoMat = new THREE.MeshStandardMaterial({ map: torsoTex, roughness: 0.8 });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0.5;
    torso.castShadow = true;
    torso.receiveShadow = true;
    characterGroup.add(torso);
    sceneRefs.current.torsoGroup = characterGroup;

    // Arms
    const armGeo = new THREE.BoxGeometry(0.38, 1.25, 0.38);
    const armTex = createArmTexture(skinConfig);
    const armMat = new THREE.MeshStandardMaterial({ map: armTex, roughness: 0.8 });

    // Left Arm
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.8, 0.45, 0.05);
    leftArm.rotation.x = 0.3; // resting comfortably toward desk
    leftArm.rotation.z = 0.08;
    leftArm.castShadow = true;
    characterGroup.add(leftArm);
    sceneRefs.current.leftArm = leftArm;

    // Right Arm
    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.8, 0.45, 0.05);
    rightArm.rotation.x = 0.3;
    rightArm.rotation.z = -0.08;
    rightArm.castShadow = true;
    characterGroup.add(rightArm);
    sceneRefs.current.rightArm = rightArm;

    // Head Group (for tilting, bobbing, nodding)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.5, 0);

    // Head Cube (0.95 x 0.95 x 0.95)
    const headGeo = new THREE.BoxGeometry(0.95, 0.95, 0.95);

    // Pre-create head textures
    const headNormalTex = createHeadTexture(skinConfig, false, 0);
    const headBlinkTex = createHeadTexture(skinConfig, true, 0);
    const headSpeakTex = createHeadTexture(skinConfig, false, 0.6);

    sceneRefs.current.headNormalTex = headNormalTex;
    sceneRefs.current.headBlinkTex = headBlinkTex;
    sceneRefs.current.headSpeakTex = headSpeakTex;

    // Materials per cube face [right, left, top, bottom, front, back]
    const hairColorMat = new THREE.MeshStandardMaterial({ color: skinConfig.hairColor || '#4a2e18', roughness: 0.9 });
    const headMaterials = [
      hairColorMat, // Right
      hairColorMat, // Left
      hairColorMat, // Top
      new THREE.MeshStandardMaterial({ color: skinConfig.skinColor || '#f5cdb0' }), // Bottom (neck)
      new THREE.MeshStandardMaterial({ map: headNormalTex, roughness: 0.75 }), // Front face
      hairColorMat  // Back
    ];

    const headMesh = new THREE.Mesh(headGeo, headMaterials);
    headMesh.castShadow = true;
    headGroup.add(headMesh);
    sceneRefs.current.headMesh = headMesh;

    // 3D Hair Hat Layer (slightly larger box for authentic Minecraft hair dimension)
    const hairHatGeo = new THREE.BoxGeometry(1.02, 0.55, 1.02);
    const hairHatMat = new THREE.MeshStandardMaterial({
      color: skinConfig.hairColor || '#4a2e18',
      roughness: 0.85
    });
    const hairHat = new THREE.Mesh(hairHatGeo, hairHatMat);
    hairHat.position.set(0, 0.25, 0);
    headGroup.add(hairHat);

    // Side hair volume
    if (skinConfig.hairStyle === 'parted' || skinConfig.hairStyle === 'modern') {
      const hairBangsGeo = new THREE.BoxGeometry(0.3, 0.35, 0.08);
      const hairBangs = new THREE.Mesh(hairBangsGeo, hairHatMat);
      hairBangs.position.set(0.35, 0.15, 0.5);
      headGroup.add(hairBangs);
    }

    characterGroup.add(headGroup);
    sceneRefs.current.headGroup = headGroup;

    scene.add(characterGroup);

    // 5. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      const state = sceneRefs.current.state;

      // Subtle lantern flicker
      if (sceneRefs.current.lanternLight) {
        sceneRefs.current.lanternLight.intensity = 1.35 + Math.sin(time * 6.5) * 0.08 + Math.cos(time * 11) * 0.04;
      }

      // Slow clouds drifting
      if (sceneRefs.current.cloudsGroup) {
        sceneRefs.current.cloudsGroup.position.x = ((time * 0.04) % 1.2) - 0.6;
      }

      // Blinking logic (blink every 3.5 seconds for 0.15s)
      const blinkCycle = time % 3.8;
      const isBlink = blinkCycle > 3.65 && blinkCycle < 3.8;

      // Speaking mouth logic
      const isSpeaking = state === 'SPEAKING' || speechActive;

      // Update face texture dynamically
      if (headMesh && headMesh.material && headMesh.material[4]) {
        if (isBlink) {
          headMesh.material[4].map = sceneRefs.current.headBlinkTex;
        } else if (isSpeaking) {
          // Rapid mouth alternation during speech
          const mouthCadence = Math.sin(time * 14);
          headMesh.material[4].map = mouthCadence > 0 ? sceneRefs.current.headSpeakTex : sceneRefs.current.headNormalTex;
        } else {
          headMesh.material[4].map = sceneRefs.current.headNormalTex;
        }
        headMesh.material[4].needsUpdate = true;
      }

      // Natural Character Body & Head Kinetics based on Interviewer State
      if (headGroup && characterGroup) {
        // Base subtle breathing motion
        const breathe = Math.sin(time * 1.8) * 0.015;
        characterGroup.position.y = 0.2 + breathe;

        if (state === 'SPEAKING' || speechActive) {
          // Dynamic conversational movement
          headGroup.rotation.x = Math.sin(time * 4) * 0.04; // subtle nodding
          headGroup.rotation.y = Math.sin(time * 1.5) * 0.05; // conversational scanning
          headGroup.rotation.z = Math.sin(time * 2.2) * 0.02;

          // Arms subtle emphasis
          if (leftArm && rightArm) {
            leftArm.rotation.x = 0.3 + Math.sin(time * 3.5) * 0.06;
            rightArm.rotation.x = 0.3 - Math.sin(time * 3.5) * 0.06;
          }
        } else if (state === 'LISTENING') {
          // Candidate speaking: Interviewer leans slightly forward, attentive focus
          headGroup.rotation.x = 0.06 + Math.sin(time * 0.8) * 0.03; // forward attention tilt
          headGroup.rotation.y = Math.sin(time * 0.4) * 0.03;
          headGroup.rotation.z = -0.02;

          // Periodic subtle affirmative nod every 4 seconds
          const nodCycle = time % 4.0;
          if (nodCycle < 0.6) {
            headGroup.rotation.x += Math.sin(nodCycle * Math.PI / 0.6) * 0.08;
          }

          if (leftArm && rightArm) {
            leftArm.rotation.x = 0.25;
            rightArm.rotation.x = 0.25;
          }
        } else if (state === 'THINKING') {
          // Pensive head tilt to the side and slightly upward
          headGroup.rotation.x = -0.05 + Math.sin(time * 1.2) * 0.015;
          headGroup.rotation.y = -0.08;
          headGroup.rotation.z = 0.07; // lateral head tilt

          if (rightArm) {
            rightArm.rotation.x = 0.45; // thoughtful posture
          }
        } else if (state === 'FOLLOW_UP') {
          // Focused keen gaze for follow-up probe
          headGroup.rotation.x = 0.08;
          headGroup.rotation.y = 0.02;
          headGroup.rotation.z = 0;
        } else if (state === 'COMPLETED') {
          // Relaxed welcoming completion pose
          headGroup.rotation.x = 0;
          headGroup.rotation.y = Math.sin(time * 0.8) * 0.04;
          headGroup.rotation.z = 0;
        } else {
          // IDLE
          headGroup.rotation.x = Math.sin(time * 1.2) * 0.02;
          headGroup.rotation.y = Math.sin(time * 0.7) * 0.03;
          headGroup.rotation.z = 0;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 6. Responsive Resize Handling
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
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [interviewer]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
      style={{ minHeight: '380px', ...style }}
    />
  );
}
