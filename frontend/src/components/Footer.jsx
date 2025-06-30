export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-black via-black to-green-900 text-green-300 text-center py-4 mt-12 shadow-inner fixed bottom-0 left-0">
      <div>
        &copy; {new Date().getFullYear()} Splitwise &mdash; Made with <span className="text-red-400">❤️</span> by Kalyani Dave
      </div>
    </footer>
  );
} 