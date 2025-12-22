import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useWebLayout, MAX_CONTENT_WIDTH, MAX_WIDE_CONTENT_WIDTH } from '@/hooks/useWebLayout';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  maxWidth?: 'form' | 'content' | 'wide' | number;
  center?: boolean;
}

export function ResponsiveContainer({
  children,
  style,
  contentStyle,
  maxWidth = 'content',
  center = true,
}: ResponsiveContainerProps) {
  const { isDesktop, formMaxWidth, horizontalPadding } = useWebLayout();
  
  const getMaxWidth = () => {
    if (typeof maxWidth === 'number') return maxWidth;
    switch (maxWidth) {
      case 'form':
        return formMaxWidth;
      case 'content':
        return MAX_CONTENT_WIDTH;
      case 'wide':
        return MAX_WIDE_CONTENT_WIDTH;
      default:
        return undefined;
    }
  };
  
  const containerMaxWidth = getMaxWidth();
  
  return (
    <View style={[styles.outer, style]}>
      <View
        style={[
          styles.inner,
          {
            maxWidth: containerMaxWidth,
            paddingHorizontal: horizontalPadding,
          },
          center && isDesktop && styles.centered,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    width: '100%',
  },
  inner: {
    flex: 1,
    width: '100%',
  },
  centered: {
    alignSelf: 'center',
  },
});
