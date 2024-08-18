import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const VRMModel = () => {
  const modelRef = useRef(null);
  const mixerRef = useRef(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    const vrmPath = '/vrm/トイプードル ブラウン.vrm'; // VRMファイルのパス

    // VRMモデルを読み込む
    loader.load(vrmPath, (gltf) => {
      const vrmScene = gltf.scene;

      // モデルをシーンに追加
      modelRef.current.add(vrmScene);
      console.log("VRM model added to scene");

      // モデルを正面に向かせるためにY軸で180度回転
      vrmScene.rotation.y = Math.PI; // Y軸で180度回転

      // AnimationMixerを作成
      const mixer = new THREE.AnimationMixer(vrmScene);

      // 手動で作成した歩行アニメーションを適用
      const walkAndSmileAnimation = new THREE.AnimationClip("walkAndSmile", -1, [
        // hipsの移動（前進）
        new THREE.VectorKeyframeTrack(
          "hips.position",
          [0, 1, 2], // 時間
          [0, 0, 0, 0, 0, -0.5, 0, 0, -1] // 移動の変化
        ),
        // 左足のアニメーション
        new THREE.QuaternionKeyframeTrack(
          "thighL.quaternion",
          [0, 0.5, 1.5, 2], // 時間
          [0, 0, 0, 1, 0.707, 0, 0, 0.707, 0, 0, 0, 1, 0.707, 0, 0, 0.707] // 回転の変化
        ),
        new THREE.QuaternionKeyframeTrack(
          "shinL.quaternion",
          [0, 0.5, 1.5, 2],
          [0, 0, 0, 1, 0.5, 0, 0, 0.866, 0, 0, 0, 1, 0.5, 0, 0, 0.866] // 回転の変化
        ),
        new THREE.QuaternionKeyframeTrack(
          "footL.quaternion",
          [0, 0.5, 1.5, 2],
          [0, 0, 0, 1, 0.866, 0, 0, 0.5, 0, 0, 0, 1, 0.866, 0, 0, 0.5] // 回転の変化
        ),
        // 右足のアニメーション（タイミングをずらす）
        new THREE.QuaternionKeyframeTrack(
          "thighR.quaternion",
          [0.5, 1, 2, 2.5], // 時間
          [0, 0, 0, 1, 0.707, 0, 0, 0.707, 0, 0, 0, 1, 0.707, 0, 0, 0.707] // 回転の変化
        ),
        new THREE.QuaternionKeyframeTrack(
          "shinR.quaternion",
          [0.5, 1, 2, 2.5],
          [0, 0, 0, 1, 0.5, 0, 0, 0.866, 0, 0, 0, 1, 0.5, 0, 0, 0.866] // 回転の変化
        ),
        new THREE.QuaternionKeyframeTrack(
          "footR.quaternion",
          [0.5, 1, 2, 2.5],
          [0, 0, 0, 1, 0.866, 0, 0, 0.5, 0, 0, 0, 1, 0.866, 0, 0, 0.5] // 回転の変化
        ),
        // 左手のアニメーション（大きく振る）
        new THREE.QuaternionKeyframeTrack(
          "upper_armL.quaternion",
          [0, 1, 2], // 時間
          [0.5, 0, 0, 0.866, -0.5, 0, 0, 0.866, 0.5, 0, 0, 0.866] // 左腕の大きな回転
        ),
        // 右手のアニメーション（左手と逆に動かす）
        new THREE.QuaternionKeyframeTrack(
          "upper_armR.quaternion",
          [0, 1, 2], // 時間
          [-0.5, 0, 0, 0.866, 0.5, 0, 0, 0.866, -0.5, 0, 0, 0.866] // 右腕の大きな回転
        ),
        // 笑顔の表情を追加
        new THREE.NumberKeyframeTrack(
          "BlendShape.Smile", 
          [0, 1, 2], // 時間
          [0, 1, 0.8] // 笑顔の度合い
        )
      ]);

      const walkAndSmileAction = mixer.clipAction(walkAndSmileAnimation);
      walkAndSmileAction.setLoop(THREE.LoopRepeat); // アニメーションをループ再生
      walkAndSmileAction.play();
      console.log("Walk and smile animation with bold hand movement started");

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
