import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';

export default function PageScrollView({ children }: PropsWithChildren) {
  const bottom = useBottomTabOverflow();

  return (
    <View style={styles.container}>
      <ScrollView
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}>
        <View style={styles.content}>{children}</View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    gap: 16,
  },
});
