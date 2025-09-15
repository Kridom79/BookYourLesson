// mobile/components/WeeklyCalendar.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Card from './Card';

const WeeklyCalendar = ({ availableSlots, selectedSlots, onSlotToggle, isSlotSelected, weekStartDate, weekEndDate }) => {
  // Raggruppa gli slot per data e genera giorni mancanti per la settimana specifica
  const groupSlotsByDate = (slots, startDate, endDate) => {
    const grouped = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Prima raggruppa gli slot esistenti
    slots.forEach(slot => {
      const date = slot.data;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      
      // Controlla se lo slot è nel passato
      const slotDateTime = new Date(`${slot.data}T${slot.orario}`);
      const isPast = slotDateTime < today;
      
      grouped[date].push({
        ...slot,
        isPast
      });
    });

    // Genera tutti i giorni della settimana (lun-ven) usando le date fornite
    if (startDate && endDate) {
      const monday = new Date(startDate);
      monday.setHours(0, 0, 0, 0);
      
      // Genera tutti i 5 giorni lavorativi (0=Lun, 1=Mar, 2=Mer, 3=Gio, 4=Ven)
      for (let i = 0; i <= 4; i++) {
        const currentDay = new Date(monday);
        currentDay.setDate(monday.getDate() + i);
        const dayString = currentDay.toISOString().split('T')[0];
        
        if (!grouped[dayString]) {
          grouped[dayString] = []; // Nessun slot disponibile per questo giorno
        }
      }
    }
    
    return grouped;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      dayName: date.toLocaleDateString('en-GB', { weekday: 'short' }),
      day: date.getDate(),
      month: date.toLocaleDateString('en-GB', { month: 'short' }),
      isToday: isToday(date),
    };
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const groupedSlots = groupSlotsByDate(availableSlots, weekStartDate, weekEndDate);
  
  // Filtra solo i giorni lavorativi (lunedì-venerdì) ed escludi le domeniche
  const allDates = Object.keys(groupedSlots).sort();
  const sortedDates = allDates.filter(dateString => {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay(); // 0=domenica, 1=lunedì, ..., 6=sabato
    return dayOfWeek >= 1 && dayOfWeek <= 5; // Solo lunedì (1) a venerdì (5)
  });

  // Orari compatti
  const timeSlots = ['09:00', '10:00', '11:00', '15:00', '16:00', '17:00', '18:00'];

  if (sortedDates.length === 0) {
    return (
      <Card style={styles.container}>
        <Text style={styles.noDataText}>No available slots for this period</Text>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <Text style={styles.calendarTitle}>📅 Weekly Schedule</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        <View style={styles.calendarGrid}>
          {/* Header con i giorni - più compatto */}
          <View style={styles.headerRow}>
            <View style={styles.timeHeaderCell}>
              <Text style={styles.timeHeaderText}>Time</Text>
            </View>
            {sortedDates.map(date => {
              const { dayName, day, month, isToday } = formatDate(date);
              return (
                <View key={date} style={[styles.dayHeaderCell, isToday && styles.todayHeader]}>
                  <Text style={[styles.dayHeaderText, isToday && styles.todayHeaderText]}>
                    {dayName}
                  </Text>
                  <Text style={[styles.dateHeaderText, isToday && styles.todayHeaderText]}>
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Righe degli orari - più compatte */}
          {timeSlots.map(time => (
            <View key={time} style={styles.timeRow}>
              <View style={styles.timeCell}>
                <Text style={styles.timeText}>{time}</Text>
              </View>
              {sortedDates.map(date => {
                const daySlots = groupedSlots[date] || [];
                const slot = daySlots.find(s => s.orario_formatted === time);
                const selected = slot && isSlotSelected(slot);
                const isPastSlot = slot && slot.isPast;
                
                return (
                  <TouchableOpacity
                    key={`${date}-${time}`}
                    style={[
                      styles.slotCell,
                      slot && !isPastSlot ? styles.availableSlot : styles.unavailableSlot,
                      isPastSlot && styles.pastSlot,
                      selected && styles.selectedSlot
                    ]}
                    onPress={slot && !isPastSlot ? () => onSlotToggle(slot) : null}
                    disabled={!slot || isPastSlot}
                    activeOpacity={0.7}
                  >
                    {slot && (
                      <Text style={[
                        styles.slotText,
                        isPastSlot && styles.pastSlotText,
                        selected && styles.selectedSlotText
                      ]}>
                        {selected ? '✓' : (isPastSlot ? '×' : '')}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Legenda compatta */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.availableDot]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.selectedDot]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.pastDot]} />
          <Text style={styles.legendText}>Past</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.unavailableDot]} />
          <Text style={styles.legendText}>Unavailable</Text>
        </View>
      </View>
    </Card>
  );
};
const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 12,
    textAlign: 'center',
  },
  scrollContainer: {
    paddingVertical: 8,
  },
  calendarGrid: {
    minWidth: '100%',
  },
  noDataText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 16,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#dc2626',
    marginBottom: 2,
  },
  timeHeaderCell: {
    width: 50,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e3a8a',
  },
  timeHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  dayHeaderCell: {
    width: 55,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
  },
  todayHeader: {
    backgroundColor: '#dc2626',
  },
  dayHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },  todayHeaderText: {
    color: '#fff',
  },
  dateHeaderText: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 1,
  },
  timeRow: {
    flexDirection: 'row',
    marginBottom: 1,
  },
  timeCell: {
    width: 50,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  timeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  slotCell: {
    width: 55,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  availableSlot: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  selectedSlot: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  unavailableSlot: {
    backgroundColor: '#f3f4f6',
  },
  pastSlot: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    opacity: 0.6,
  },
  slotText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#16a34a',
  },  selectedSlotText: {
    color: '#fff',
  },
  pastSlotText: {
    color: '#dc2626',
    fontSize: 10,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  availableDot: {
    backgroundColor: '#16a34a',
  },
  selectedDot: {
    backgroundColor: '#dc2626',
  },
  unavailableDot: {
    backgroundColor: '#d1d5db',
  },
  pastDot: {
    backgroundColor: '#fca5a5',
  },
  legendText: {
    fontSize: 10,
    color: '#64748b',
  },
});

export default WeeklyCalendar;