// mobile/components/BackgroundWrapper.js - Versione Mobile Originale
import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';

const BackgroundWrapper = ({ children, style }) => {
  return (
    <ImageBackground 
      source={require('../assets/background.jpg')} 
      style={[styles.container, style]}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay} />
      <View style={styles.unionJackAccent} />
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    opacity: 0.6,
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  unionJackAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'transparent',
    borderTopWidth: 2,
    borderTopColor: '#dc2626',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default BackgroundWrapper;
