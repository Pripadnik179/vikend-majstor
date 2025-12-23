import { Platform, useWindowDimensions } from 'react-native';
import { Spacing } from '@/constants/theme';

const isWeb = Platform.OS === 'web';

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 600,
  desktop: 900,
  wide: 1200,
  ultraWide: 1440,
};

export const MAX_CONTENT_WIDTH = 600;
export const MAX_WIDE_CONTENT_WIDTH = 1280;
export const MAX_ULTRAWIDE_CONTENT_WIDTH = 1440;
export const GRID_GAP = 16;
export const SECTION_PADDING = 24;

export function useWebLayout() {
  const { width, height } = useWindowDimensions();
  
  const isMobile = width < BREAKPOINTS.tablet;
  const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
  const isDesktop = width >= BREAKPOINTS.desktop;
  const isWide = width >= BREAKPOINTS.wide;
  const isUltraWide = width >= BREAKPOINTS.ultraWide;
  
  const webHeaderHeight = 64;
  const mobileTabBarHeight = 80;
  
  const getNumColumns = () => {
    if (width >= BREAKPOINTS.wide) return 5;
    if (width >= BREAKPOINTS.desktop) return 4;
    if (width >= BREAKPOINTS.tablet) return 3;
    if (width >= 480) return 2;
    return 1;
  };
  
  const getHorizontalPadding = () => {
    if (isWide) return SECTION_PADDING;
    if (isDesktop) return Spacing['2xl'];
    if (isTablet) return Spacing.xl;
    return Spacing.lg;
  };
  
  const getContentMaxWidth = () => {
    if (isUltraWide) return MAX_ULTRAWIDE_CONTENT_WIDTH;
    if (isWide) return MAX_WIDE_CONTENT_WIDTH;
    if (isDesktop) return MAX_CONTENT_WIDTH;
    return undefined;
  };
  
  const getFormMaxWidth = () => {
    return 480;
  };
  
  const numColumns = getNumColumns();
  const effectiveMaxWidth = isUltraWide ? MAX_ULTRAWIDE_CONTENT_WIDTH : MAX_WIDE_CONTENT_WIDTH;
  const totalGapWidth = (numColumns - 1) * GRID_GAP;
  const availableWidth = Math.min(width - SECTION_PADDING * 2, effectiveMaxWidth);
  
  const getCenteredContainerStyle = () => {
    if (!isDesktop) return {};
    return {
      maxWidth: effectiveMaxWidth,
      marginHorizontal: 'auto' as const,
      width: '100%' as const,
    };
  };
  
  return {
    isWeb,
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    isUltraWide,
    width,
    height,
    contentPaddingTop: isDesktop ? webHeaderHeight + 16 : 0,
    contentPaddingBottom: isDesktop ? 16 : mobileTabBarHeight,
    numColumns,
    horizontalPadding: getHorizontalPadding(),
    contentMaxWidth: getContentMaxWidth(),
    gridMaxWidth: effectiveMaxWidth,
    gridGap: GRID_GAP,
    sectionPadding: SECTION_PADDING,
    formMaxWidth: getFormMaxWidth(),
    cardWidth: isDesktop ? Math.floor((availableWidth - totalGapWidth) / numColumns) : undefined,
    centeredContainerStyle: getCenteredContainerStyle(),
  };
}
