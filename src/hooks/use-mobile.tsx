
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Function to check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Initial check
    checkMobile()
    
    // Create handler that updates state based on window size
    const handleResize = () => {
      checkMobile()
    }
    
    // Add listener
    window.addEventListener('resize', handleResize)
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return isMobile
}

// Enhanced hook to get current screen size category
export function useScreenSize() {
  const [screenSize, setScreenSize] = React.useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>('lg')
  
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      
      if (width < 640) {
        setScreenSize('xs')
      } else if (width < 768) {
        setScreenSize('sm')
      } else if (width < 1024) {
        setScreenSize('md')
      } else if (width < 1280) {
        setScreenSize('lg')
      } else if (width < 1536) {
        setScreenSize('xl')
      } else {
        setScreenSize('2xl')
      }
    }
    
    // Initial check
    handleResize()
    
    // Add listener with debounce for performance
    let timeoutId: number;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(handleResize, 100);
    };
    
    window.addEventListener('resize', debouncedResize)
    
    // Clean up
    return () => {
      window.removeEventListener('resize', debouncedResize)
      clearTimeout(timeoutId);
    }
  }, [])
  
  return screenSize
}

// Enhanced hook to detect device type with more information
export function useDeviceType() {
  const [deviceInfo, setDeviceInfo] = React.useState<{
    type: 'mobile' | 'tablet' | 'desktop';
    orientation: 'portrait' | 'landscape';
    isTouchDevice: boolean;
  }>({
    type: 'desktop',
    orientation: 'landscape',
    isTouchDevice: false
  })
  
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      let type: 'mobile' | 'tablet' | 'desktop' = 'desktop'
      if (width < 640) {
        type = 'mobile'
      } else if (width < 1024) {
        type = 'tablet'
      } else {
        type = 'desktop'
      }
      
      setDeviceInfo({
        type,
        orientation: width > height ? 'landscape' : 'portrait',
        isTouchDevice
      })
    }
    
    // Initial check
    handleResize()
    
    // Add listeners for resize and orientation change
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])
  
  return deviceInfo
}

// New hook to provide comprehensive responsive values
export function useResponsive() {
  const isMobile = useIsMobile()
  const screenSize = useScreenSize()
  const deviceInfo = useDeviceType()
  
  // Define breakpoint values based on Tailwind's default breakpoints
  const breakpoints = {
    xs: 640,
    sm: 768,
    md: 1024,
    lg: 1280,
    xl: 1536
  }
  
  // Check if screen is wider than the specified breakpoint
  const isAbove = (breakpoint: keyof typeof breakpoints) => {
    if (typeof window === 'undefined') return false
    return window.innerWidth >= breakpoints[breakpoint]
  }
  
  // Check if screen is narrower than the specified breakpoint
  const isBelow = (breakpoint: keyof typeof breakpoints) => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < breakpoints[breakpoint]
  }
  
  return {
    isMobile,
    screenSize,
    deviceType: deviceInfo.type,
    orientation: deviceInfo.orientation,
    isTouchDevice: deviceInfo.isTouchDevice,
    isAbove,
    isBelow,
    breakpoints
  }
}
