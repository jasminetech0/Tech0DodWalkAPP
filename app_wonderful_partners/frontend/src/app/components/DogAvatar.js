import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const VRMModel = ({ message }) => {  // メッセージを受け取るように修正
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

      // アニメーション2: ジャンプアニメーション
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

      const action = mixer.clipAction(walkAnimation);
      action.setLoop(THREE.LoopRepeat);
      action.play();

      console.log("Walk animation started");

      mixerRef.current = mixer;

      // メッセージに応じてBlendShape（表情）を変えるロジック
      const blendShapeProxy = gltf.userData.vrm.expressionManager;
      updateBlendShape(blendShapeProxy, message);
    }, undefined, (error) => {
      console.error("Error loading VRM model:", error);
    });

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }
    };
  }, [message]);

  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  const updateBlendShape = (blendShapeProxy, message) => {
    // メッセージに応じた表情を設定
    if (message.includes("笑顔")) {
      blendShapeProxy.setValue("Smile", 1.0);  // 笑顔のBlendShapeを最大に
    } else if (message.includes("驚き")) {
      blendShapeProxy.setValue("Surprised", 1.0);  // 驚きのBlendShapeを最大に
    } else {
      blendShapeProxy.setValue("Smile", 0.0);  // その他の場合は無表情
      blendShapeProxy.setValue("Surprised", 0.0);
    }
  };

  return <group ref={modelRef} />;
};

export default VRMModel;
