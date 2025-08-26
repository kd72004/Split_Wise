export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-b-2 border-green-400 ${sizeClasses[size]} mb-4`}></div>
      <p className="text-gray-400 text-sm">{text}</p>
    </div>
  );
}

export function PageLoader({ text = 'Loading page...' }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900 flex items-center justify-center">
      <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-lg border border-green-500/30 rounded-2xl p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
        <p className="text-green-400 text-lg">{text}</p>
      </div>
    </div>
  );
}

export function ButtonLoader() {
  return (
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
  );
}