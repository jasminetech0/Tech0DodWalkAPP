import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const VRMModel = () => {
  const modelRef = useRef(null);
  const mixerRef = useRef(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    const vrmPath = '/vrm/トイプードル ブラウン.vrm'; // VRMファイル

    loader.load(vrmPath, (gltf) => {
      const vrmScene = gltf.scene;
      modelRef.current.add(vrmScene);
      console.log("VRM model added to scene");

      const mixer = new THREE.AnimationMixer(vrmScene);

      // モーション1: 歩行アニメーション
      const walkAnimation = new THREE.AnimationClip("walk", -1, [
        // hipsの移動（前進）
        new THREE.VectorKeyframeTrack(
          "hips.position",
          [0, 1, 2], 
          [0, 0, 0, 0, 0, -0.5, 0, 0, -1]
        ),
        new THREE.QuaternionKeyframeTrack(
          "thighL.quaternion",
          [0, 0.5, 1.5, 2], 
          [0, 0, 0, 1, 0.707, 0, 0, 0.707, 0, 0, 0, 1, 0.707, 0, 0, 0.707]
        ),
        new THREE.QuaternionKeyframeTrack(
          "thighR.quaternion",
          [0.5, 1, 2, 2.5], 
          [0, 0, 0, 1, 0.707, 0, 0, 0.707, 0, 0, 0, 1, 0.707, 0, 0, 0.707]
        )
      ]);

      // モーション2: 笑顔と手の振り
      const smileAndWaveAnimation = new THREE.AnimationClip("smileAndWave", -1, [
        new THREE.QuaternionKeyframeTrack(
          "upper_armL.quaternion",
          [0, 1, 2], 
          [0.5, 0, 0, 0.866, -0.5, 0, 0, 0.866, 0.5, 0, 0, 0.866]
        ),
        new THREE.QuaternionKeyframeTrack(
          "upper_armR.quaternion",
          [0, 1, 2], 
          [-0.5, 0, 0, 0.866, 0.5, 0, 0, 0.866, -0.5, 0, 0, 0.866]
        ),
        new THREE.NumberKeyframeTrack(
          "BlendShape.Smile", 
          [0, 1, 2], 
          [0, 1, 0.8]
        )
      ]);

      // モーション3: ジャンプアニメーション
      const jumpAnimation = new THREE.AnimationClip("jump", -1, [
        new THREE.VectorKeyframeTrack(
          "hips.position",
          [0, 0.5, 1], 
          [0, 0, 0, 0, 0.5, 0, 0, 1, 0]
        ),
        new THREE.QuaternionKeyframeTrack(
          "thighL.quaternion",
          [0, 0.5, 1], 
          [0, 0, 0, 1, 0.707, 0, 0, 0.707, 0, 0, 0, 1]
        ),
        new THREE.QuaternionKeyframeTrack(
          "thighR.quaternion",
          [0, 0.5, 1], 
          [0, 0, 0, 1, 0.707, 0, 0, 0.707, 0, 0, 0, 1]
        )
      ]);

      // アニメーションをランダムに選択
      const animations = [walkAnimation, smileAndWaveAnimation, jumpAnimation];
      const selectedAnimation = animations[Math.floor(Math.random() * animations.length)];

      const action = mixer.clipAction(selectedAnimation);
      action.setLoop(THREE.LoopRepeat);
      action.play();

      console.log("Random animation started");

      mixerRef.current = mixer;
    }, undefined, (error) => {
      console.error("Error loading VRM model:", error);
    });

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }
    };
  }, []);

  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  return <group ref={modelRef} />;
};

export default VRMModel;
