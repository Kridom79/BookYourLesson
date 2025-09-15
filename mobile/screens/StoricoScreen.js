// mobile/screens/StoricoScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import BackgroundWrapper from '../components/BackgroundWrapper';
import Card from '../components/Card';
import api from '../utils/api';

const StoricoScreen = ({ user, navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserBookings();
  }, []);

  const loadUserBookings = async () => {
    try {
      setLoading(true);
      const response = await api.getUserBookings(user.id);
      
      if (response.success) {
        setBookings(response.bookings);
      } else {
        Alert.alert('Error', 'Failed to load your bookings');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confermata':
        return '#10b981';
      case 'cancellata':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confermata':
        return 'Confirmed';
      case 'cancellata':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const isUpcoming = (booking) => {
    const lessonDateTime = new Date(`${booking.data}T${booking.orario}`);
    return lessonDateTime > new Date();
  };

  const renderBooking = (booking) => (
    <Card key={booking.id} style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingDate}>{formatDate(booking.data)}</Text>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: getStatusColor(booking.stato) }
        ]}>
          <Text style={styles.statusText}>{getStatusText(booking.stato)}</Text>
        </View>
      </View>      
      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Time:</Text>
          <Text style={styles.detailValue}>{booking.orario_formatted}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Type:</Text>
          <Text style={styles.detailValue}>
            {isUpcoming(booking) ? '📅 Upcoming' : '📚 Past'}
          </Text>
        </View>
        {booking.note && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Notes:</Text>
            <Text style={styles.detailValue}>{booking.note}</Text>
          </View>
        )}
      </View>
    </Card>
  );

  const separateBookings = () => {
    const upcoming = bookings
      .filter(isUpcoming)
      .filter(b => b.stato === 'confermata')
      .sort((a, b) => {
        const dateA = new Date(`${a.data}T${a.orario}`);
        const dateB = new Date(`${b.data}T${b.orario}`);
        return dateA - dateB; // Ordine cronologico crescente
      });
      
    const past = bookings
      .filter(b => !isUpcoming(b) || b.stato === 'cancellata')
      .sort((a, b) => {
        const dateA = new Date(`${a.data}T${a.orario}`);
        const dateB = new Date(`${b.data}T${b.orario}`);
        return dateB - dateA; // Ordine cronologico decrescente per le passate
      });
      
    return { upcoming, past };
  };

  return (
    <BackgroundWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.headerCard}>
          <Text style={styles.title}>My English Lessons</Text>
          <Text style={styles.subtitle}>Your booking history with Cristina</Text>
        </Card>
        {loading ? (
          <Card>
            <ActivityIndicator size="large" color="#dc2626" />
            <Text style={styles.loadingText}>Loading your bookings...</Text>
          </Card>
        ) : bookings.length === 0 ? (
          <Card>
            <Text style={styles.noBookingsText}>
              You haven't booked any lessons yet.
            </Text>
            <TouchableOpacity
              style={styles.bookNowButton}
              onPress={() => navigation.navigate('Calendar')}
            >
              <Text style={styles.bookNowButtonText}>Book Your First Lesson</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <>
            {/* Refresh button */}
            <View style={styles.refreshContainer}>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={loadUserBookings}
              >
                <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
              </TouchableOpacity>
            </View>

            {(() => {
              const { upcoming, past } = separateBookings();
              return (
                <>
                  {upcoming.length > 0 && (
                    <>
                      <Text style={styles.sectionTitle}>Upcoming Lessons</Text>
                      {upcoming.map(renderBooking)}
                    </>
                  )}

                  {past.length > 0 && (
                    <>
                      <Text style={styles.sectionTitle}>Past Lessons</Text>
                      {past.map(renderBooking)}
                    </>
                  )}
                </>
              );
            })()}
          </>
        )}
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
  headerCard: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  refreshContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  noBookingsText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },  bookNowButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  bookNowButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  bookingCard: {
    marginBottom: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },  bookingDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e3a8a',
    flex: 2,
    textAlign: 'right',
  },
});

export default StoricoScreen;