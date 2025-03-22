export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-gray-200 py-4">
          <p className="text-sm text-gray-500 text-center">
            © {currentYear} React Application. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
