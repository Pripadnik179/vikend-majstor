import { Platform, useWindowDimensions } from 'react-native';

const isWeb = Platform.OS === 'web';

export function useWebLayout() {
  const { width, height } = useWindowDimensions();
  const isDesktop = isWeb && width >= 768;
  const isTablet = isWeb && width >= 480 && width < 768;
  
  const webHeaderHeight = 64;
  const mobileTabBarHeight = 80;
  
  return {
    isWeb,
    isDesktop,
    isTablet,
    width,
    height,
    contentPaddingTop: isDesktop ? webHeaderHeight + 16 : 0,
    contentPaddingBottom: isDesktop ? 16 : mobileTabBarHeight,
    numColumns: isDesktop ? (width >= 1200 ? 4 : width >= 992 ? 3 : 2) : (width >= 480 ? 2 : 1),
    cardWidth: isDesktop ? Math.floor((width - 48 - (Math.min(4, Math.floor(width / 300)) - 1) * 16) / Math.min(4, Math.floor(width / 300))) : undefined,
  };
}
