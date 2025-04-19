import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemedBookMyShowLogo } from '@/components/ui/cricket-icons';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface LogoSettings {
  setting_key: string;
  setting_value: {
    url: string;
  } | string | null;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const { data: logoSettings } = useQuery({
    queryKey: ['logo-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('setting_key', 'logo_url')
        .single();
      
      if (error) {
        console.error('Error fetching logo:', error);
        return null;
      }
      
      return data as LogoSettings | null;
    }
  });
  
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
  };
  
  // Get the logo URL safely from settings
  const logoUrl = (() => {
    if (!logoSettings?.setting_value) return null;
    
    if (typeof logoSettings.setting_value === 'string') {
      return logoSettings.setting_value;
    }
    
    if (typeof logoSettings.setting_value === 'object' && 'url' in logoSettings.setting_value) {
      return logoSettings.setting_value.url;
    }
    
    return null;
  })();

  // If we have a custom logo from settings, use it
  if (logoUrl) {
    return (
      <Link to="/" className={`flex items-center ${className}`}>
        <img 
          src={logoUrl} 
          alt="IPL Ticket Hub" 
          className={`${sizeClasses[size]} object-contain`}
        />
      </Link>
    );
  }
  
  // Otherwise, use the upgraded themed logo
  return (
    <Link to="/" className={`flex items-center ${className}`}>
      <ThemedBookMyShowLogo className={`w-auto ${sizeClasses[size]} h-auto`} />
    </Link>
  );
};

export default Logo;
