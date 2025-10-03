"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface InteractiveCanvasProps {
  id: string;
  title: string;
}

export default function InteractiveCanvas({ id, title }: InteractiveCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(5, 5, 5);
    scene.add(light);

    let mesh: THREE.Object3D;

    // Assign animation by title
    const name = title.toLowerCase();

    if (name.includes("algorithms")) {
      // Rotating cube maze
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1, 4, 4, 4),
        new THREE.MeshStandardMaterial({ color: 0xff3333, wireframe: true })
      );
    } else if (name.includes("data structures")) {
      // Simple tree structure (sphere root + branches)
      const root = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x44ccff })
      );
      for (let i = -1; i <= 1; i += 2) {
        const branch = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 1),
          new THREE.MeshStandardMaterial({ color: 0x44ccff })
        );
        branch.rotation.z = i * 0.5;
        branch.position.set(i * 0.7, 0.5, 0);
        root.add(branch);
      }
      mesh = root;
    } else if (name.includes("databases")) {
      // Database cylinder stack
      mesh = new THREE.Group();
      for (let i = 0; i < 3; i++) {
        const layer = new THREE.Mesh(
          new THREE.CylinderGeometry(0.6, 0.6, 0.3, 32),
          new THREE.MeshStandardMaterial({ color: 0x9966ff })
        );
        layer.position.y = i * 0.35;
        mesh.add(layer);
      }
    } else if (name.includes("linear algebra")) {
      // Vector arrow
      const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2, 32), material);
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.5, 32), material);
      head.position.y = 1.25;
      shaft.add(head);
      mesh = shaft;
    } else if (name.includes("probability") || name.includes("statistics")) {
      // Random spheres like probability distribution
      mesh = new THREE.Group();
      for (let i = 0; i < 10; i++) {
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 16, 16),
          new THREE.MeshStandardMaterial({ color: 0x33cc33 })
        );
        sphere.position.set(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        );
        mesh.add(sphere);
      }
    } else if (name.includes("calculus")) {
      // Sine wave curve
      const points: THREE.Vector3[] = [];
      for (let i = -10; i <= 10; i++) {
        points.push(new THREE.Vector3(i / 10, Math.sin(i / 2) / 2, 0));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0xffcc00 });
      mesh = new THREE.Line(geometry, material);
    } else if (name.includes("particle physics")) {
      // Orbiting electrons
      mesh = new THREE.Group();
      const nucleus = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xff0000 })
      );
      mesh.add(nucleus);
      for (let i = 0; i < 3; i++) {
        const electron = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0x00ffcc })
        );
        electron.position.x = 0.6;
        const orbit = new THREE.Group();
        orbit.add(electron);
        orbit.rotation.z = (i / 3) * Math.PI * 2;
        mesh.add(orbit);
      }
    } else {
      // Default: sphere
      mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0x888888 })
      );
    }

    scene.add(mesh);
    camera.position.z = 3;

    // Animate
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      // Animate differently depending on type
      if (mesh instanceof THREE.Group && name.includes("particle physics")) {
        mesh.children.forEach((child, idx) => {
          if (child instanceof THREE.Group) {
            child.rotation.y += 0.02 * (idx + 1);
          }
        });
      } else {
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [id, title]);

  return <div ref={mountRef} className="w-full h-48 rounded-xl overflow-hidden" />;
}
