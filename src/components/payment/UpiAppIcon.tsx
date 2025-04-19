
import React from 'react';

interface UpiAppIconProps {
  name: string;
  icon: string;
  fallback: string;
  deepLink: string;
  onClick?: () => void;
}

export const UpiAppIcon: React.FC<UpiAppIconProps> = ({ 
  name,
  icon,
  fallback,
  deepLink,
  onClick
}) => {
  const handleClick = () => {
    // Attempt to open the deep link
    window.location.href = deepLink;
    
    // Call the onClick handler if provided
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      className="flex flex-col items-center justify-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
      onClick={handleClick}
      type="button"
      aria-label={`Pay with ${name}`}
      name={`pay-with-${name.toLowerCase().replace(/\s+/g, '-')}`}
      id={`pay-button-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {icon ? (
        <img 
          src={icon} 
          alt={name} 
          className="h-8 w-auto" 
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const fallbackSpan = document.createElement('span');
              fallbackSpan.textContent = fallback;
              fallbackSpan.className = 'text-lg font-medium';
              parent.appendChild(fallbackSpan);
            }
          }} 
        />
      ) : null}
      <span className={`text-xs mt-1 ${icon ? '' : 'hidden'}`}>{fallback}</span>
    </button>
  );
};
