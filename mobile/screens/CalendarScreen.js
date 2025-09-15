// mobile/screens/CalendarScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import BackgroundWrapper from '../components/BackgroundWrapper';
import Card from '../components/Card';
import WeeklyCalendar from '../components/WeeklyCalendar';
import api from '../utils/api';

const CalendarScreen = ({ user, navigation }) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weeks, setWeeks] = useState([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  useEffect(() => {
    loadAvailableSlots();
  }, []);

  const loadAvailableSlots = async () => {
    try {
      setLoading(true);
      const response = await api.getAvailableSlots();
      
      if (response.success) {
        setAvailableSlots(response.slots);
        generateWeeksFromSlots(response.slots);
      } else {
        Alert.alert('Error', 'Failed to load available slots');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const getMondayOfWeek = (date) => {
    // Crea data in formato locale per evitare problemi di fuso orario
    const currentDate = new Date(date);
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // +1 perché getMonth() è 0-based
    const day = String(currentDate.getDate()).padStart(2, '0');
    
    // Ricostruisci la data come string ISO per evitare problemi di fuso orario
    const dateString = `${year}-${month}-${day}`;
    const localDate = new Date(dateString);
    const dayOfWeek = localDate.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    
    // Calcola quanti giorni tornare indietro per arrivare al lunedì
    const daysBack = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    // Calcola il lunedì usando aritmetica su date string
    const mondayDate = new Date(localDate);
    mondayDate.setDate(localDate.getDate() - daysBack);
    
    return mondayDate;
  };

  const generateWeeksFromSlots = (slots) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weeks = [];
    
    // Inizia dal lunedì della settimana corrente
    const currentWeekStart = getMondayOfWeek(today);

    // Genera 12 settimane complete (sempre lun-ven)
    for (let i = 0; i < 12; i++) {
      const weekStart = new Date(currentWeekStart);
      weekStart.setDate(currentWeekStart.getDate() + (i * 7));
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 4); // Fino a venerdì
      
      const weekSlots = [];
      
      // Per ogni giorno della settimana (lun-ven)
      for (let day = 0; day <= 4; day++) {
        const currentDay = new Date(weekStart);
        currentDay.setDate(weekStart.getDate() + day);
        const dayString = currentDay.toISOString().split('T')[0];
        
        // Debug: log per la prima settimana
        if (i === 0) {
          console.log(`Frontend Day ${day}: ${dayString} (${currentDay.toLocaleDateString('en-US', { weekday: 'long' })})`);
        }
        
        // Trova slot per questo giorno
        const daySlots = slots.filter(slot => slot.data === dayString);
        
        // Aggiungi gli slot esistenti, marcando quelli passati
        daySlots.forEach(slot => {
          const slotDateTime = new Date(`${slot.data}T${slot.orario}`);
          weekSlots.push({
            ...slot,
            isPast: slotDateTime < today
          });
        });
      }
      
      weeks.push({
        startDate: new Date(weekStart),
        endDate: new Date(weekEnd),
        slots: weekSlots
      });
    }
    
    console.log(`Generated ${weeks.length} weeks, first week has ${weeks[0]?.slots.length || 0} slots`);
    setWeeks(weeks);
  };

  const handleSlotToggle = (slot) => {
    const slotKey = `${slot.data}-${slot.orario}`;
    const isSelected = selectedSlots.some(s => `${s.data}-${s.orario}` === slotKey);
    
    if (isSelected) {
      setSelectedSlots(selectedSlots.filter(s => `${s.data}-${s.orario}` !== slotKey));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const isSlotSelected = (slot) => {
    const slotKey = `${slot.data}-${slot.orario}`;
    return selectedSlots.some(s => `${s.data}-${s.orario}` === slotKey);
  };

  const getTotalCost = () => {
    return selectedSlots.length * 10;
  };

  const handleProceedToCheckout = () => {
    if (selectedSlots.length === 0) {
      Alert.alert('No Lessons Selected', 'Please select at least one lesson to proceed.');
      return;
    }
    
    navigation.navigate('Checkout', { 
      selectedSlots, 
      user,
      totalCost: getTotalCost()
    });
  };
  const formatWeekRange = (week) => {
    if (!week) return '';
    const options = { month: 'short', day: 'numeric' };
    const start = week.startDate.toLocaleDateString('en-US', options);
    const end = week.endDate.toLocaleDateString('en-US', options);
    return `${start} - ${end}`;
  };

  const goToPreviousWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1);
    }
  };

  const goToNextWeek = () => {
    if (currentWeekIndex < weeks.length - 1) {
      setCurrentWeekIndex(currentWeekIndex + 1);
    }
  };

  const currentWeek = weeks[currentWeekIndex];
  const currentWeekSlots = currentWeek ? currentWeek.slots : [];

  const clearSelection = () => {
    setSelectedSlots([]);
  };

  return (
    <BackgroundWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <Text style={styles.title}>Book Your English Lessons</Text>
          <Text style={styles.subtitle}>Choose your preferred time slots with Cristina</Text>
          <View style={styles.priceInfo}>
            <Text style={styles.priceText}>💰 Price per lesson: €10.00 (50 minutes)</Text>
            <Text style={styles.scheduleText}>📅 Available: Monday to Friday, 9:00-12:00 & 15:00-19:00</Text>
          </View>
        </Card>

        {loading ? (
          <Card>
            <ActivityIndicator size="large" color="#dc2626" />
            <Text style={styles.loadingText}>Loading available slots...</Text>
          </Card>
        ) : weeks.length === 0 ? (
          <Card>
            <Text style={styles.noSlotsText}>No available slots found.</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={loadAvailableSlots}>
              <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <>
            {/* Week Navigation */}
            <Card style={styles.weekNavCard}>
              <View style={styles.weekNavigation}>
                <TouchableOpacity 
                  style={[styles.navButton, currentWeekIndex === 0 && styles.navButtonDisabled]}
                  onPress={goToPreviousWeek}
                  disabled={currentWeekIndex === 0}
                >
                  <Text style={styles.navButtonText}>‹ Previous</Text>
                </TouchableOpacity>
                
                <Text style={styles.weekRange}>
                  {currentWeek && formatWeekRange(currentWeek)}
                </Text>
                
                <TouchableOpacity 
                  style={[styles.navButton, currentWeekIndex >= weeks.length - 1 && styles.navButtonDisabled]}
                  onPress={goToNextWeek}
                  disabled={currentWeekIndex >= weeks.length - 1}
                >
                  <Text style={styles.navButtonText}>Next ›</Text>
                </TouchableOpacity>
              </View>
            </Card>

            {/* Weekly Calendar showing single week */}
            {currentWeek && (
              <WeeklyCalendar
                availableSlots={currentWeekSlots}
                selectedSlots={selectedSlots}
                onSlotToggle={handleSlotToggle}
                isSlotSelected={isSlotSelected}
                weekStartDate={currentWeek.startDate}
                weekEndDate={currentWeek.endDate}
              />
            )}
          </>
        )}

        {/* Cart Summary */}
        {selectedSlots.length > 0 && (
          <Card style={styles.cartCard}>
            <Text style={styles.cartTitle}>🛒 Selected Lessons ({selectedSlots.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedSlotsContainer}>
              {selectedSlots.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.selectedSlotChip}
                  onPress={() => handleSlotToggle(slot)}
                >
                  <Text style={styles.selectedSlotText}>
                    {new Date(slot.data).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {slot.orario_formatted}
                  </Text>
                  <Text style={styles.removeSlotText}>×</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.cartSummary}>
              <Text style={styles.totalText}>Total: €{getTotalCost()}.00</Text>
              <View style={styles.cartActions}>
                <TouchableOpacity style={styles.clearButton} onPress={clearSelection}>
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.proceedButton} onPress={handleProceedToCheckout}>
                  <Text style={styles.proceedButtonText}>Proceed to Checkout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
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
    marginBottom: 16,
  },
  priceInfo: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  scheduleText: {
    fontSize: 14,
    color: '#64748b',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  noSlotsText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  weekNavCard: {
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  navButton: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    minWidth: 80,
  },
  navButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  navButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  weekRange: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
    flex: 1,
    paddingHorizontal: 10,
  },
  cartCard: {
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 12,
  },
  selectedSlotsContainer: {
    marginBottom: 16,
  },  selectedSlotChip: {
    backgroundColor: '#dc2626',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedSlotText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  removeSlotText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartSummary: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 16,
  },
  cartActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clearButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 0.45,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  proceedButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 0.5,
  },
  proceedButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CalendarScreen;