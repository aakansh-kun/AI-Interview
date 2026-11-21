import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { generateCharacterSkinTexture } from './skinTextures';

export default function MinecraftAvatar({
  characterId = 'arjun',
  mode = 'full', // 'full' (standing) or 'bust' (behind desk)
  interviewerState = 'IDLE', // IDLE, SPEAKING, LISTENING, THINKING, FOLLOW_UP, COMPLETED
  speechActive = false,
  className = '',
  style = {}
}) {
  const containerRef = useRef(null);
  const animFrameId = useRef(null);

  const stateRef = useRef({
    state: interviewerState,
    speechActive: speechActive,
    normalTex: null,
    blinkTex: null,
    speakTex: null,
    characterMesh: null,
    headGroup: null,
    leftArm: null,
    rightArm: null,
    headMesh: null,
    mouthMesh: null
  });

  useEffect(() => {
    stateRef.current.state = interviewerState;
    stateRef.current.speechActive = speechActive;
  }, [interviewerState, speechActive]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 400;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    if (mode === 'full') {
      camera.position.set(0, 1.4, 4.4); // Full body view
    } else {
      camera.position.set(0, 1.3, 3.2); // Chest/shoulders desk view
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#fffbeb', 1.1);
    dirLight.position.set(3, 4, 3);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight('#67e8f9', 0.35); // subtle cyan/sky fill
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    // 3. Pre-create Textures
    const normalTex = generateCharacterSkinTexture(characterId, false, 0);
    const blinkTex = generateCharacterSkinTexture(characterId, true, 0);
    const speakTex = generateCharacterSkinTexture(characterId, false, 0.7);

    stateRef.current.normalTex = normalTex;
    stateRef.current.blinkTex = blinkTex;
    stateRef.current.speakTex = speakTex;

    // Common skin material
    const skinMat = new THREE.MeshStandardMaterial({
      map: normalTex,
      roughness: 0.85,
      metalness: 0.05
    });

    // 4. Character Model Rig (Exact Minecraft 1:1 Proportions)
    // Scale: 1 Minecraft pixel = 0.0625 units
    // Head: 8x8x8 pixels = 0.5 x 0.5 x 0.5 (scaled by 1.6 => 0.8 x 0.8 x 0.8)
    const charRoot = new THREE.Group();
    charRoot.position.set(0, mode === 'full' ? 0.1 : 0.2, 0);

    // HEAD (8 x 8 x 8)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.55, 0);

    const headGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);
    stateRef.current.headMesh = headMesh;

    // Hair outer layer (slightly larger cube: 8.5 x 8.5 x 8.5)
    const hairLayerGeo = new THREE.BoxGeometry(0.86, 0.45, 0.86);
    const hairMat = new THREE.MeshStandardMaterial({
      map: normalTex,
      roughness: 0.9,
      transparent: true
    });
    const hairLayer = new THREE.Mesh(hairLayerGeo, hairMat);
    hairLayer.position.set(0, 0.2, 0);
    headGroup.add(hairLayer);

    charRoot.add(headGroup);
    stateRef.current.headGroup = headGroup;

    // TORSO (8 wide, 12 tall, 4 deep => 0.8 x 1.2 x 0.4)
    const torsoGeo = new THREE.BoxGeometry(0.8, 1.2, 0.4);
    const torsoMesh = new THREE.Mesh(torsoGeo, skinMat);
    torsoMesh.position.set(0, 0.55, 0);
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    charRoot.add(torsoMesh);

    // RIGHT ARM (4 wide, 12 tall, 4 deep => 0.4 x 1.2 x 0.4)
    const armGeo = new THREE.BoxGeometry(0.4, 1.2, 0.4);
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(-0.6, 1.05, 0); // pivot at shoulder

    const rightArmMesh = new THREE.Mesh(armGeo, skinMat);
    rightArmMesh.position.set(0, -0.5, 0);
    rightArmMesh.castShadow = true;
    rightArmGroup.add(rightArmMesh);
    charRoot.add(rightArmGroup);
    stateRef.current.rightArm = rightArmGroup;

    // LEFT ARM (4 wide, 12 tall, 4 deep => 0.4 x 1.2 x 0.4)
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(0.6, 1.05, 0); // pivot at shoulder

    const leftArmMesh = new THREE.Mesh(armGeo, skinMat);
    leftArmMesh.position.set(0, -0.5, 0);
    leftArmMesh.castShadow = true;
    leftArmGroup.add(leftArmMesh);
    charRoot.add(leftArmGroup);
    stateRef.current.leftArm = leftArmGroup;

    // LEGS (Only visible in full mode: 4 wide, 12 tall, 4 deep => 0.4 x 1.2 x 0.4 each)
    if (mode === 'full') {
      const legGeo = new THREE.BoxGeometry(0.39, 1.2, 0.4);

      // Right Leg
      const rightLeg = new THREE.Mesh(legGeo, skinMat);
      rightLeg.position.set(-0.2, -0.65, 0);
      rightLeg.castShadow = true;
      charRoot.add(rightLeg);

      // Left Leg
      const leftLeg = new THREE.Mesh(legGeo, skinMat);
      leftLeg.position.set(0.2, -0.65, 0);
      leftLeg.castShadow = true;
      charRoot.add(leftLeg);

      // Pedestal block (Stone / Grass pedestal)
      const pedestal = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.3, 1.8),
        new THREE.MeshStandardMaterial({ color: '#272a30', roughness: 0.9 })
      );
      pedestal.position.set(0, -1.4, 0);
      pedestal.receiveShadow = true;
      charRoot.add(pedestal);

      // Sculk cyan pedestal ring
      const ring = new THREE.Mesh(
        new THREE.BoxGeometry(1.84, 0.05, 1.84),
        new THREE.MeshStandardMaterial({ color: '#00E5C3', emissive: '#00E5C3', emissiveIntensity: 0.8 })
      );
      ring.position.set(0, -1.26, 0);
      charRoot.add(ring);
    }

    scene.add(charRoot);
    stateRef.current.characterMesh = charRoot;

    // 5. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const state = stateRef.current.state;
      const isSpeaking = state === 'SPEAKING' || stateRef.current.speechActive;

      // Blinking logic (blink every 3.5s for 0.15s)
      const blinkCycle = time % 3.6;
      const isBlinking = blinkCycle > 3.45 && blinkCycle < 3.6;

      // Update face texture
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

      // Kinetics based on mode and state
      if (mode === 'full') {
        // Slow turntable rotation for character selection
        charRoot.rotation.y = Math.sin(time * 0.4) * 0.25;
      }

      // Subtle breathing motion
      const breathe = Math.sin(time * 2.0) * 0.012;
      charRoot.position.y = (mode === 'full' ? 0.1 : 0.2) + breathe;

      // Natural Head & Arm Gestures
      if (headGroup) {
        if (isSpeaking) {
          // Natural conversational emphasis
          headGroup.rotation.x = Math.sin(time * 3.5) * 0.04;
          headGroup.rotation.y = Math.sin(time * 1.5) * 0.06;
          headGroup.rotation.z = Math.sin(time * 2.0) * 0.02;

          if (leftArmGroup && rightArmGroup) {
            leftArmGroup.rotation.x = Math.sin(time * 3.0) * 0.15;
            rightArmGroup.rotation.x = -Math.sin(time * 3.0) * 0.15;
          }
        } else if (state === 'LISTENING') {
          // Attentive forward tilt with periodic small nod
          headGroup.rotation.x = 0.06 + Math.sin(time * 0.8) * 0.02;
          headGroup.rotation.y = Math.sin(time * 0.5) * 0.03;
          headGroup.rotation.z = -0.02;

          // Nodding cycle
          const nodTime = time % 4.2;
          if (nodTime < 0.6) {
            headGroup.rotation.x += Math.sin(nodTime * Math.PI / 0.6) * 0.08;
          }

          if (leftArmGroup && rightArmGroup) {
            leftArmGroup.rotation.x = 0.05;
            rightArmGroup.rotation.x = 0.05;
          }
        } else if (state === 'THINKING') {
          // Pensive sideways head tilt
          headGroup.rotation.x = -0.04;
          headGroup.rotation.y = -0.08;
          headGroup.rotation.z = 0.08;

          if (rightArmGroup) {
            rightArmGroup.rotation.x = 0.35; // Thoughtful hand pose
          }
        } else {
          // IDLE
          headGroup.rotation.x = Math.sin(time * 1.2) * 0.015;
          headGroup.rotation.y = Math.sin(time * 0.8) * 0.03;
          headGroup.rotation.z = 0;

          if (leftArmGroup && rightArmGroup) {
            leftArmGroup.rotation.x = 0;
            rightArmGroup.rotation.x = 0;
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 6. Resize listener
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
  }, [characterId, mode]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
      style={style}
    />
  );
}
