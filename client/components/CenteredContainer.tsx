import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useWebLayout } from '@/hooks/useWebLayout';

interface CenteredContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CenteredContainer({ children, style }: CenteredContainerProps) {
  const { isDesktop, gridMaxWidth, sectionPadding } = useWebLayout();

  if (!isDesktop) {
    return <View style={style}>{children}</View>;
  }

  return (
    <View style={[styles.wrapper, style]}>
      <View style={[styles.container, { maxWidth: gridMaxWidth, paddingHorizontal: sectionPadding }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
  },
  container: {
    width: '100%',
  },
});
