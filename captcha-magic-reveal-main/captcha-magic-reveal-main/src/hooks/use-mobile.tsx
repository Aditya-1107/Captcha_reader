import * as React from "react"

// Define standard breakpoints based on common frameworks like Tailwind
export const breakpoints = {
  xs: 480,  // Extra small devices
  sm: 640,  // Small devices
  md: 768,  // Medium devices
  lg: 1024, // Large devices
  xl: 1280, // Extra large devices
  xxl: 1536 // Extra extra large devices
} as const

export type Breakpoint = keyof typeof breakpoints

// Create a more comprehensive responsive hook
export function useBreakpoint<K extends Breakpoint = Breakpoint>(
  breakpoint: K,
  direction: 'down' | 'up' = 'down'
) {
  const [matches, setMatches] = React.useState<boolean | null>(null)
  
  React.useEffect(() => {
    // Initial check during server-side rendering
    if (typeof window === 'undefined') {
      setMatches(null)
      return
    }

    const query = direction === 'down'
      ? `(max-width: ${breakpoints[breakpoint] - 1}px)`
      : `(min-width: ${breakpoints[breakpoint]}px)`

    const mql = window.matchMedia(query)

    // Set initial state
    setMatches(mql.matches)

    // Handler function for media query changes
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches)
    }

    // Use the newer event listener API with fallback for older browsers
    if (mql.addEventListener) {
      mql.addEventListener('change', handleChange)
      return () => mql.removeEventListener('change', handleChange)
    } else {
      // Fallback for older browsers
      mql.addListener(handleChange)
      return () => mql.removeListener(handleChange)
    }
  }, [breakpoint, direction])

  return matches
}

// For backwards compatibility and convenience
export function useIsMobile() {
  const isMobileMatches = useBreakpoint('md', 'down')
  
  // During SSR, make a reasonable assumption for mobile
  if (isMobileMatches === null) {
    return false
  }
  
  return isMobileMatches
}

// Additional convenient hooks
export function useIsTablet() {
  const isTabletDown = useBreakpoint('lg', 'down')
  const isTabletUp = useBreakpoint('md', 'up')
  
  if (isTabletDown === null || isTabletUp === null) {
    return false
  }
  
  return isTabletDown && isTabletUp
}

export function useIsDesktop() {
  const isDesktop = useBreakpoint('lg', 'up')
  
  if (isDesktop === null) {
    return false
  }
  
  return isDesktop
}

// A hook that returns the current breakpoint name
export function useCurrentBreakpoint() {
  const [currentBreakpoint, setCurrentBreakpoint] = React.useState<Breakpoint | null>(null)
  
  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    
    const determineBreakpoint = () => {
      const width = window.innerWidth
      if (width < breakpoints.xs) return 'xs'
      if (width < breakpoints.sm) return 'sm'
      if (width < breakpoints.md) return 'md'
      if (width < breakpoints.lg) return 'lg'
      if (width < breakpoints.xl) return 'xl'
      return 'xxl'
    }
    
    const handleResize = () => {
      setCurrentBreakpoint(determineBreakpoint())
    }
    
    // Set initial value
    handleResize()
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return currentBreakpoint
}