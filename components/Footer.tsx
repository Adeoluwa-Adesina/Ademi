// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-gray-100 text-center py-4 text-sm text-gray-600 mt-10">
      <p>&copy; {new Date().getFullYear()} My App. All rights reserved.</p>
    </footer>
  );
}
