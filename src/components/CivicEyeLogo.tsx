'use client'

interface CivicEyeLogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function CivicEyeLogo({ size = 'md', className = '' }: CivicEyeLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Civic Eye Logo SVG */}
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer diamond/star shape */}
          <path
            d="M50 5 L80 35 L95 50 L80 65 L50 95 L20 65 L5 50 L20 35 Z"
            stroke="#0C0A0A"
            strokeWidth="3"
            fill="transparent"
            className="opacity-90"
          />
          
          {/* Inner diamond outline */}
          <path
            d="M50 15 L70 35 L85 50 L70 65 L50 85 L30 65 L15 50 L30 35 Z"
            stroke="#36342C"
            strokeWidth="2"
            fill="transparent"
            className="opacity-70"
          />
          
          {/* Eye outline */}
          <ellipse
            cx="50"
            cy="50"
            rx="25"
            ry="15"
            stroke="#0C0A0A"
            strokeWidth="2.5"
            fill="transparent"
          />
          
          {/* Inner eye detail */}
          <ellipse
            cx="50"
            cy="50"
            rx="18"
            ry="11"
            stroke="#36342C"
            strokeWidth="1.5"
            fill="transparent"
            className="opacity-80"
          />
          
          {/* Pupil outer ring */}
          <circle
            cx="50"
            cy="50"
            r="10"
            stroke="#0C0A0A"
            strokeWidth="2"
            fill="transparent"
          />
          
          {/* Pupil inner ring */}
          <circle
            cx="50"
            cy="50"
            r="6"
            stroke="#36342C"
            strokeWidth="1.5"
            fill="transparent"
            className="opacity-70"
          />
          
          {/* Center pupil */}
          <circle
            cx="50"
            cy="50"
            r="3"
            fill="#0C0A0A"
          />
          
          {/* Dotted detail rings */}
          <circle
            cx="50"
            cy="50"
            r="14"
            stroke="#9B9C9D"
            strokeWidth="0.8"
            fill="transparent"
            strokeDasharray="1,2"
            className="opacity-60"
          />
          
          <circle
            cx="50"
            cy="50"
            r="20"
            stroke="#9B9C9D"
            strokeWidth="0.8"
            fill="transparent"
            strokeDasharray="1,2"
            className="opacity-40"
          />
          
          {/* Eye corner accents */}
          <path
            d="M25 50 L30 48 L30 52 Z"
            fill="#36342C"
            className="opacity-60"
          />
          <path
            d="M75 50 L70 48 L70 52 Z"
            fill="#36342C"
            className="opacity-60"
          />
        </svg>
      </div>
      
      {/* Logo Text */}
      <span className={`font-bold text-[#0C0A0A] ${textSizeClasses[size]}`}>
        Civic Eye
      </span>
    </div>
  )
}