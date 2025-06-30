export default function Button({ children, onClick, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-primary text-green-900 font-bold px-6 py-3 rounded-xl hover:bg-green-400 transition-all duration-200 shadow-md ${className}`}
    >
      {children}
    </button>
  );
} 