"use client";

import dynamic from "next/dynamic";
import { ComponentType } from "react";

// 1. Define a mapping for the dynamic imports
const ComponentMap: Record<string, ComponentType<object>> = {
  "vector-rotation": dynamic(() => import("./VectorVisualizer"), { ssr: false }),
  "3d-vectors": dynamic(() => import("./VectorVisualizer"), { ssr: false }),
};

// 2. Define the dedicated loader component (the new "registry")
export default function InteractiveLoader({ keyName, label }: { keyName: string; label: string }) {
  const InteractiveComp = ComponentMap[keyName];

  if (!InteractiveComp) {
    // Return the missing component message when not found
    return (
      <p className="text-sm text-red-500 font-medium">
        ⚠️ Missing interactive component for &quot;{label}&quot;
        <br />
        <span className="text-xs text-gray-400">
          (Lookup key: &quot;{keyName}&quot;)
        </span>
      </p>
    );
  }

  // 3. Render the dynamically loaded component
  return (
    <div className="border rounded-lg bg-white dark:bg-gray-900 p-4">
      <InteractiveComp />
    </div>
  );
}