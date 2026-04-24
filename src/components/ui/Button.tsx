import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'as'> {
  variant?: 'primary' | 'secondary' | 'gold' | 'outline' | 'ghost' | 'danger' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  className?: string;
  as?: any;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, as: Component = 'button', ...props }, ref) => {
    const variants = {
      primary: 'bg-aurum-navy text-white hover:bg-black shadow-lg shadow-black/10',
      secondary: 'bg-white text-aurum-navy border border-gray-100 hover:bg-gray-50 shadow-sm',
      gold: 'bg-aurum-gold text-aurum-navy font-bold hover:bg-aurum-gold-light shadow-lg shadow-aurum-gold/20',
      outline: 'border border-aurum-navy/20 text-aurum-navy hover:border-aurum-navy hover:bg-aurum-navy/5',
      ghost: 'hover:bg-gray-100 text-gray-600',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/10',
      white: 'bg-white text-aurum-navy hover:bg-gray-100'
    };

    const sizes = {
      sm: 'px-4 py-2 text-xs rounded-lg',
      md: 'px-6 py-3 text-sm rounded-xl',
      lg: 'px-10 py-4 text-base rounded-2xl',
      xl: 'px-12 py-5 text-lg rounded-[1.25rem]',
      icon: 'p-3 rounded-xl'
    };

    const MotionComponent = motion(Component);

    return (
      <MotionComponent
        ref={ref}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.96 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25 
        }}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          variants[variant],
          sizes[size],
          className
        )}
        {...(props as any)}
      />
    );
  }
);

Button.displayName = 'Button';
