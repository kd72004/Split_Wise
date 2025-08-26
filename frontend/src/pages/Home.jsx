import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-black to-green-900 relative overflow-hidden p-0 m-0">
      <div className="absolute w-[40rem] h-[40rem] bg-green-400 opacity-20 rounded-full -top-32 -left-32 blur-3xl animate-pulse" />
      <div className="absolute w-[32rem] h-[32rem] bg-primary opacity-10 rounded-full -bottom-24 -right-24 blur-2xl animate-pulse" />
      <div className="relative z-10 flex flex-col items-center gap-6 p-12 bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl">
        <span className="text-5xl mb-2">💸</span>
        <h1 className="text-4xl font-extrabold text-primary drop-shadow mb-2 text-white">Splitwise</h1>
        <p className="text-green-200 text-lg mb-4 max-w-lg text-center">
          Easily split bills, track group expenses, and settle up with friends. No more confusion, just fairness!
        </p>
        <div className="flex gap-6 mt-4">
          <Link
            to="/signup"
            className="bg-primary text-green-400 font-bold px-8 py-3 rounded-xl text-lg hover:bg-green-400 hover:text-black transition shadow-md"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="border border-primary text-primary font-bold px-8 py-3 rounded-xl text-lg hover:bg-green-900 text-green-400 transition shadow-md"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
} 