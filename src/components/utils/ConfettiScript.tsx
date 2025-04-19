
import { useEffect } from 'react';

export const ConfettiScript = () => {
  useEffect(() => {
    // Load confetti script if not already present
    if (typeof window.confetti === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js';
      script.async = true;
      script.onload = () => {
        console.log('Confetti script loaded');
      };
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
      };
    }
  }, []);
  
  return null;
};

export default ConfettiScript;
