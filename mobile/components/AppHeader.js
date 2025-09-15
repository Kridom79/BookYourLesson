// mobile/components/AppHeader.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AppHeader = ({ title, subtitle, style }) => {
  return (
    <View style={[styles.header, style]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 8,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 24,
    color: '#1e3a8a',
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: 'bold',
    fontFamily: 'serif',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(255, 255, 255, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default AppHeader;
