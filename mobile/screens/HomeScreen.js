// mobile/screens/HomeScreen.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  ScrollView,
} from 'react-native';
import BackgroundWrapper from '../components/BackgroundWrapper';
import Card from '../components/Card';
import BritishFlag from '../components/BritishFlag';

const HomeScreen = ({ navigation, user, onLogout }) => {
  return (
    <BackgroundWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header with logout */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Welcome, {user?.nome}!</Text>
            {user?.ruolo === 'admin' && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>👑 ADMIN</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Tutor presentation card */}
        <Card style={styles.tutorCard}>
          <View style={styles.tutorHeader}>
            <Image
              source={require('../assets/me.jpeg')}
              style={styles.tutorImage}
            />
            <View style={styles.tutorInfo}>
              <View style={styles.tutorNameSection}>
                <Text style={styles.tutorName}>Cristina</Text>
                <BritishFlag size={30} style={styles.britishFlag} />
              </View>
              <Text style={styles.tutorTitle}>English Teacher & Tutor</Text>
            </View>
          </View>
          
          <Text style={styles.tutorDescription}>
            "Hello! My name is Cristina and I'm an experienced English teacher and 
            tutor. I offer fun, interactive, and personalized online lessons for 
            children and adults. Each class is designed around your level, goals, 
            and interest. Whether you want to improve grammar, practice speaking, 
            prepare for exams, or gain confidence in everyday conversation. My aim 
            is to make learning English enjoyable, effective, and adapted to you! 
            Come say hello and let's get started!"
          </Text>
        </Card>

        {/* Action buttons */}
        <Card style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>What would you like to do?</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Calendar')}
          >
            <Text style={styles.actionButtonText}>📅 Book a Lesson</Text>
            <Text style={styles.actionButtonSubtext}>Find available slots</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Storico')}
          >
            <Text style={styles.actionButtonText}>📚 My Bookings</Text>
            <Text style={styles.actionButtonSubtext}>View your lessons</Text>
          </TouchableOpacity>

          {user?.ruolo === 'admin' && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.adminButton]}
                onPress={() => navigation.navigate('Admin')}
              >
                <Text style={[styles.actionButtonText, styles.adminButtonText]}>🛡️ Admin Dashboard</Text>
                <Text style={[styles.actionButtonSubtext, styles.adminButtonSubtext]}>Manage all bookings & view complete calendar</Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Student Functions</Text>
                <View style={styles.dividerLine} />
              </View>
            </>
          )}
        </Card>

        {/* Info card */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Lesson Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Duration:</Text>
            <Text style={styles.infoValue}>50 minutes</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cost:</Text>
            <Text style={styles.infoValue}>€10.00 per lesson</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Schedule:</Text>
            <Text style={styles.infoValue}>Mon-Fri: 9-12, 15-19</Text>
          </View>
        </Card>
      </ScrollView>
    </BackgroundWrapper>
  );
};
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 10,
    ...(Platform.OS === 'web' && {
      minHeight: '100vh',
      paddingBottom: 50,
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  adminBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  adminBadgeText: {
    color: '#1e3a8a',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminHeaderButton: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  adminHeaderButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tutorCard: {
    marginBottom: 16,
  },
  tutorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tutorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  tutorImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  tutorImageText: {
    fontSize: 32,
  },
  tutorInfo: {
    flex: 1,
  },
  tutorNameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tutorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginRight: 8,
  },
  britishFlag: {
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  tutorTitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },  tutorDescription: {
    fontSize: 16,
    lineHeight: 22,
    color: '#374151',
    fontStyle: 'italic',
  },
  actionsCard: {
    marginBottom: 16,
  },
  actionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 16,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  actionButtonSubtext: {
    fontSize: 14,
    color: '#64748b',
  },
  adminButton: {
    backgroundColor: '#1e3a8a',
    borderLeftColor: '#fbbf24',
  },
  adminButtonText: {
    color: '#fff',
  },
  adminButtonSubtext: {
    color: '#e5e7eb',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  infoCard: {
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  infoLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e3a8a',
  },
});

export default HomeScreen;