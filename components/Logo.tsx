'use client';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className, size = 40 }: LogoProps) {
  return (
    <div className={cn(
      "flex items-center justify-center overflow-hidden",
      className
    )} style={{ width: size, height: size }}>
      <img 
        src="/santarosa-lgazul-branco.png" 
        alt="Logo"
        className="w-full h-full object-contain"
      />
    </div>
  );
}
