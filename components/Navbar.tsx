// components/Navbar.tsx
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
      <div className="text-lg font-bold">
        <Link href="/">My App</Link>
      </div>
      <div className="space-x-6">
        <Link href="/courses" className="hover:underline">
          Courses
        </Link>
        <Link href="/topics" className="hover:underline">
          Topics
        </Link>
        <Link href="/about" className="hover:underline">
          About
        </Link>
      </div>
    </nav>
  );
}
