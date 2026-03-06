'use client';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'standard' | 'white';
}

export function Logo({ className, size = 40, variant = 'standard' }: LogoProps) {
  // User instruction: "onde o espaço for branco a logo que deve ser buscada é logo-wht.png"
  // Assuming 'white' variant is for white backgrounds.
  const src = variant === 'white' ? '/logo-wht.png' : '/logo.png';
  
  return (
    <div className={cn(
      "flex items-center justify-center overflow-hidden",
      className
    )} style={{ width: size, height: size }}>
      <img 
        src={src} 
        alt="Logo Santa Rosa"
        className="w-full h-full object-contain"
      />
    </div>
  );
}
