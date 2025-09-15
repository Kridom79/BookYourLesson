// mobile/screens/AdminScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import BackgroundWrapper from '../components/BackgroundWrapper';
import Card from '../components/Card';
import api from '../utils/api';

const AdminScreen = ({ user, navigation, onLogout }) => {
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAllBookings();
  }, []);

  const loadAllBookings = async () => {
    try {
      setLoading(true);
      const response = await api.getAllBookings();
      
      if (response.success) {
        setAllBookings(response.bookings);
      } else {
        Alert.alert('Error', 'Failed to load bookings');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = (booking) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel ${booking.nome_utente}'s lesson on ${formatDate(booking.data)} at ${booking.orario_formatted}?`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelBooking(booking.id) }
      ]
    );
  };

  const cancelBooking = async (bookingId) => {
    try {
      const response = await api.cancelBooking(bookingId);
      
      if (response.success) {
        Alert.alert('Success', 'Booking cancelled successfully');
        loadAllBookings(); // Refresh the list
      } else {
        Alert.alert('Error', response.error || 'Failed to cancel booking');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFilteredBookings = () => {
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return allBookings.filter(booking => {
          const lessonDate = new Date(`${booking.data}T${booking.orario}`);
          return lessonDate > now && booking.stato === 'confermata';
        });
      case 'past':
        return allBookings.filter(booking => {
          const lessonDate = new Date(`${booking.data}T${booking.orario}`);
          return lessonDate <= now || booking.stato === 'cancellata';
        });
      default:
        return allBookings;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confermata':
        return '#16a34a';
      case 'cancellata':
        return '#dc2626';
      case 'completata':
        return '#1e3a8a';
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
      case 'completata':
        return 'Completed';
      default:
        return status;
    }
  };

  const isUpcoming = (booking) => {
    const lessonDate = new Date(`${booking.data}T${booking.orario}`);
    return lessonDate > new Date() && booking.stato === 'confermata';
  };

  const refreshBookings = async () => {
    setRefreshing(true);
    await loadAllBookings();
    setRefreshing(false);
  };

  const clearAllBookings = () => {
    Alert.alert(
      'Reset Calendar',
      '⚠️ WARNING: This will:\n\n• Cancel ALL bookings in the system\n• Regenerate all available time slots\n• Completely reset the calendar\n\nThis action cannot be undone. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset Calendar', 
          style: 'destructive', 
          onPress: confirmClearAllBookings 
        }
      ]
    );
  };

  const confirmClearAllBookings = async () => {
    try {
      setRefreshing(true);
      
      // Usa la nuova API per cancellare tutte le prenotazioni e rigenerare slot
      const response = await api.clearAllBookings();
      
      if (response.success) {
        Alert.alert(
          'Calendar Reset Complete! 🎉', 
          `✅ Cancelled: ${response.cancelledCount} booking(s)\n🔄 Generated: ${response.newSlotsCount} new slots\n\nThe calendar has been completely reset!`
        );
        
        // Ricarica la lista
        await loadAllBookings();
      } else {
        Alert.alert('Error', response.error || 'Failed to clear bookings and regenerate slots');
      }
      
    } catch (error) {
      Alert.alert('Error', 'Failed to reset calendar. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const filteredBookings = getFilteredBookings();
  const stats = {
    total: allBookings.length,
    confirmed: allBookings.filter(b => b.stato === 'confermata').length,
    cancelled: allBookings.filter(b => b.stato === 'cancellata').length,
    upcoming: allBookings.filter(b => isUpcoming(b)).length,
  };

  return (
    <BackgroundWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>🛡️ Admin Dashboard</Text>
              <Text style={styles.subtitle}>Manage all English lesson bookings</Text>
              <Text style={styles.welcomeText}>Welcome, {user.nome}!</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Statistics */}
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Booking Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#16a34a' }]}>{stats.confirmed}</Text>
              <Text style={styles.statLabel}>Confirmed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#dc2626' }]}>{stats.cancelled}</Text>
              <Text style={styles.statLabel}>Cancelled</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#1e3a8a' }]}>{stats.upcoming}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
          </View>
        </Card>

        {/* Filter Tabs */}
        <Card style={styles.filterCard}>
          <View style={styles.filterTabs}>
            <TouchableOpacity 
              style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
                All ({allBookings.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterTab, filter === 'upcoming' && styles.activeFilterTab]}
              onPress={() => setFilter('upcoming')}
            >
              <Text style={[styles.filterText, filter === 'upcoming' && styles.activeFilterText]}>
                Upcoming ({stats.upcoming})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterTab, filter === 'past' && styles.activeFilterTab]}
              onPress={() => setFilter('past')}
            >
              <Text style={[styles.filterText, filter === 'past' && styles.activeFilterText]}>
                Past ({stats.total - stats.upcoming})
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={refreshBookings}
            disabled={refreshing}
          >
            <Text style={styles.refreshButtonText}>
              {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Bookings'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.clearAllButton} 
            onPress={clearAllBookings}
            disabled={refreshing}
          >
            <Text style={styles.clearAllButtonText}>
              🔄 Reset Calendar
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Card>
            <ActivityIndicator size="large" color="#dc2626" />
            <Text style={styles.loadingText}>Loading bookings...</Text>
          </Card>
        ) : filteredBookings.length === 0 ? (
          <Card>
            <Text style={styles.noBookingsText}>No bookings found for the selected filter.</Text>
          </Card>
        ) : (
          filteredBookings.map(booking => (
            <Card key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <View>
                  <Text style={styles.studentName}>{booking.nome_utente}</Text>
                  <Text style={styles.studentEmail}>{booking.email_utente}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.stato) }]}>
                  <Text style={styles.statusText}>{getStatusText(booking.stato)}</Text>
                </View>
              </View>

              <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>📅 Date:</Text>
                  <Text style={styles.detailValue}>{formatDate(booking.data)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>⏰ Time:</Text>
                  <Text style={styles.detailValue}>{booking.orario_formatted}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>💰 Cost:</Text>
                  <Text style={styles.detailValue}>€{booking.costo}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>📝 Booked:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(booking.created_at).toLocaleDateString('en-GB')}
                  </Text>
                </View>
                {booking.note && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>💭 Notes:</Text>
                    <Text style={styles.detailValue}>{booking.note}</Text>
                  </View>
                )}
              </View>

              {/* Actions */}
              {isUpcoming(booking) && (
                <View style={styles.bookingActions}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => handleCancelBooking(booking)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel Lesson</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          ))
        )}
      </ScrollView>
    </BackgroundWrapper>
  );
};
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  headerCard: {
    marginBottom: 16,
    backgroundColor: 'rgba(30, 58, 138, 0.05)',
    borderLeftWidth: 4,
    borderLeftColor: '#1e3a8a',
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
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#1e3a8a',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
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
    fontSize: 14,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 12,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  filterCard: {
    marginBottom: 16,
  },
  filterTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  activeFilterTab: {
    backgroundColor: '#dc2626',
  },
  filterText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
  },
  activeFilterText: {
    color: '#fff',
  },
  refreshButton: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  clearAllButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  clearAllButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },  loadingText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  noBookingsText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bookingCard: {
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#dc2626',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  studentEmail: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bookingDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginBottom: 12,
  },  detailRow: {
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
    flex: 1,
    textAlign: 'right',
  },
  bookingActions: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default AdminScreen;