export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div 
      className={`flex items-center justify-center bg-black rounded-lg ${className}`}
      style={{ 
        width: '60px', 
        height: '60px',
        boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)'
      }}
    >
      <span 
        className="text-3xl font-black tracking-tight"
        style={{ 
          color: '#DC2626',
          textShadow: '0 0 10px rgba(220, 38, 38, 0.5)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        SP
      </span>
    </div>
  );
};
