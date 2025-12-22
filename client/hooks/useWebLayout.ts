import { Platform, useWindowDimensions } from 'react-native';
import { Spacing } from '@/constants/theme';

const isWeb = Platform.OS === 'web';

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 600,
  desktop: 900,
  wide: 1200,
};

export const MAX_CONTENT_WIDTH = 600;
export const MAX_WIDE_CONTENT_WIDTH = 1200;

export function useWebLayout() {
  const { width, height } = useWindowDimensions();
  
  const isMobile = width < BREAKPOINTS.tablet;
  const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
  const isDesktop = width >= BREAKPOINTS.desktop;
  const isWide = width >= BREAKPOINTS.wide;
  
  const webHeaderHeight = 64;
  const mobileTabBarHeight = 80;
  
  const getNumColumns = () => {
    if (width >= BREAKPOINTS.wide) return 4;
    if (width >= BREAKPOINTS.desktop) return 3;
    if (width >= BREAKPOINTS.tablet) return 2;
    return 1;
  };
  
  const getHorizontalPadding = () => {
    if (isWide) return Spacing['3xl'];
    if (isDesktop) return Spacing['2xl'];
    if (isTablet) return Spacing.xl;
    return Spacing.lg;
  };
  
  const getContentMaxWidth = () => {
    if (isWide) return MAX_WIDE_CONTENT_WIDTH;
    if (isDesktop) return MAX_CONTENT_WIDTH;
    return undefined;
  };
  
  const getFormMaxWidth = () => {
    return 480;
  };
  
  return {
    isWeb,
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    width,
    height,
    contentPaddingTop: isDesktop ? webHeaderHeight + 16 : 0,
    contentPaddingBottom: isDesktop ? 16 : mobileTabBarHeight,
    numColumns: getNumColumns(),
    horizontalPadding: getHorizontalPadding(),
    contentMaxWidth: getContentMaxWidth(),
    formMaxWidth: getFormMaxWidth(),
    cardWidth: isDesktop ? Math.floor((Math.min(width, MAX_WIDE_CONTENT_WIDTH) - 48 - (getNumColumns() - 1) * 16) / getNumColumns()) : undefined,
  };
}
