 "use client"

import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// VRMモデルのレンダリングを行うコンポーネントを非SSRで読み込む
const VRMModel = dynamic(() => import('../components/DogAvatar'), { ssr: false });

export default function Home() {
  return (
    <Canvas style={{ width: '100%', height: '100vh', backgroundColor: 'gray' }}>
      <ambientLight intensity={1} />
      <directionalLight position={[0, 10, 10]} intensity={1} />
      <OrbitControls />
      <VRMModel />
    </Canvas>
  );
}
