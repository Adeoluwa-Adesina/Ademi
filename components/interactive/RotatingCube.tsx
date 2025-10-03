"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import { Mesh } from "three";

export default function RotatingCube() {
  const cubeRef = useRef<Mesh>(null!);

  return (
    <Canvas camera={{ position: [3, 3, 3] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 2]} intensity={1} />
      <mesh ref={cubeRef} rotation={[0.4, 0.2, 0.1]}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial color="royalblue" />
      </mesh>
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}
