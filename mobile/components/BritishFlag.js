// mobile/components/BritishFlag.js
import React from 'react';
import { View, StyleSheet } from 'react-native';

const BritishFlag = ({ size = 40, style }) => {
  return (
    <View style={[styles.flag, { width: size, height: size * 0.6 }, style]}>
      {/* Blue background */}
      <View style={styles.blueBackground} />
      
      {/* White diagonal cross */}
      <View style={[styles.whiteDiagonal1, { height: size * 0.6 }]} />
      <View style={[styles.whiteDiagonal2, { height: size * 0.6 }]} />
      
      {/* Red diagonal cross */}
      <View style={[styles.redDiagonal1, { height: size * 0.6 }]} />
      <View style={[styles.redDiagonal2, { height: size * 0.6 }]} />
      
      {/* White cross */}
      <View style={[styles.whiteCrossHorizontal, { height: size * 0.12 }]} />
      <View style={[styles.whiteCrossVertical, { width: size * 0.2 }]} />
      
      {/* Red cross */}
      <View style={[styles.redCrossHorizontal, { height: size * 0.08 }]} />
      <View style={[styles.redCrossVertical, { width: size * 0.12 }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  flag: {
    position: 'relative',
    borderRadius: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  blueBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1e3a8a',
  },
  whiteDiagonal1: {
    position: 'absolute',
    width: '141%',
    backgroundColor: '#fff',
    transform: [{ rotate: '26.57deg' }],
    top: '40%',
    left: '-20%',
  },
  whiteDiagonal2: {
    position: 'absolute',
    width: '141%',
    backgroundColor: '#fff',
    transform: [{ rotate: '-26.57deg' }],
    top: '40%',
    left: '-20%',
  },
  redDiagonal1: {
    position: 'absolute',
    width: '141%',
    backgroundColor: '#dc2626',
    transform: [{ rotate: '26.57deg' }],
    top: '45%',
    left: '-20%',
  },
  redDiagonal2: {
    position: 'absolute',
    width: '141%',
    backgroundColor: '#dc2626',
    transform: [{ rotate: '-26.57deg' }],
    top: '45%',
    left: '-20%',
  },
  whiteCrossHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '44%',
    backgroundColor: '#fff',
  },
  whiteCrossVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '40%',
    backgroundColor: '#fff',
  },
  redCrossHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '46%',
    backgroundColor: '#dc2626',
  },
  redCrossVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '44%',
    backgroundColor: '#dc2626',
  },
});

export default BritishFlag;