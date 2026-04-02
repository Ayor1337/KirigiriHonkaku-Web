import { useRef, type ButtonHTMLAttributes } from 'react';

interface InkButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function InkButton({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}: InkButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const baseStyles = 'relative overflow-hidden font-medium transition-colors duration-200';

  const variantStyles = {
    default: 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)]',
    ghost: 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]',
    danger: 'bg-[var(--bg-secondary)] text-[var(--danger)] border border-[var(--danger)] hover:bg-[var(--danger)] hover:text-white',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm rounded',
    md: 'px-4 py-2 text-base rounded-md',
    lg: 'px-6 py-3 text-lg rounded-lg',
  };

  const handleMouseEnter = () => {
    if (buttonRef.current) {
      buttonRef.current.style.setProperty('--ink-opacity', '1');
    }
  };

  return (
    <button
      ref={buttonRef}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className} group`}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {/* 墨水扩散背景 */}
      <span
        className="absolute inset-0 bg-[var(--accent-primary)] opacity-0 transition-opacity duration-300 group-hover:opacity-10"
        style={{
          transform: 'scale(0)',
          borderRadius: '50%',
          transition: 'transform 0.5s ease-out, opacity 0.3s ease',
        }}
      />
      <span className="relative z-10">{children}</span>
    </button>
  );
}
