import BLEMessengerComponent from '@/components/BLEMessenger';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function BLEScreen() {
  return (
    <ThemedView style={styles.container}>
      <BLEMessengerComponent />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 