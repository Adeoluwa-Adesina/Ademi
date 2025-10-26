"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface InteractiveCanvasProps {
  topicId: string;
}

export default function InteractiveCanvas({ topicId }: InteractiveCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Scene setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // --- Add light ---
    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    // --- Object depends on topicId ---
    let object: THREE.Object3D;

    if (topicId === "3d-vectors") {
      const geometry = new THREE.ArrowHelper(
        new THREE.Vector3(1, 1, 1).normalize(),
        new THREE.Vector3(0, 0, 0),
        2,
        0x00ff88
      );
      object = geometry;
      scene.add(object);
    } else {
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
      object = new THREE.Mesh(geometry, material);
      scene.add(object);
    }

    camera.position.z = 4;

    // --- Animation ---
    const animate = () => {
      requestAnimationFrame(animate);
      object.rotation.x += 0.01;
      object.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    // --- Handle resizing ---
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // --- Cleanup ---
    return () => {
      mountRef.current?.removeChild(renderer.domElement);
      window.removeEventListener("resize", handleResize);
    };
  }, [topicId]);

  return (
    <div
      ref={mountRef}
      className="w-full h-96 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-lg"
    />
  );
}
