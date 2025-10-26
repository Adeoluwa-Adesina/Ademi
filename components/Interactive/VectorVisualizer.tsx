// components/Interactive/VectorVisualizer.tsx
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface VectorVisualizerProps {
  vectors?: Array<{ x: number; y: number; z: number; color?: string }>;
}

export default function VectorVisualizer({ vectors }: VectorVisualizerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const light = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(light);
    scene.add(new THREE.AxesHelper(2.5));

    (vectors ?? [{ x: 1, y: 1, z: 0, color: "#ff3333" }]).forEach((v) => {
      const dir = new THREE.Vector3(v.x, v.y, v.z).normalize();
      const len = new THREE.Vector3(v.x, v.y, v.z).length();
      const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0, 0), len, v.color ?? "#00ff00");
      scene.add(arrow);
    });

    camera.position.set(3, 3, 3);
    camera.lookAt(0, 0, 0);

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      scene.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // cleanup
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      if (mount && renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [vectors]);

  return <div ref={mountRef} className="w-full h-64 rounded-lg bg-gray-50" />;
}
