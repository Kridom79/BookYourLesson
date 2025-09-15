// mobile/screens/CheckoutScreen.js
import React, { useState } from 'react';
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

const CheckoutScreen = ({ route, navigation }) => {
  const { selectedSlots, user, totalCost } = route.params;
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);

  const paymentMethods = [
    { id: 'card', name: 'Credit Card', icon: '💳', description: 'Pay with Visa, MasterCard, or American Express' },
    { id: 'paypal', name: 'PayPal', icon: '🅿️', description: 'Pay securely with your PayPal account' },
    { id: 'bank', name: 'Bank Transfer', icon: '🏦', description: 'Direct bank transfer' },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create bookings for all selected slots
      const bookingPromises = selectedSlots.map(slot => 
        api.createBooking({
          userId: user.id,
          data: slot.data,
          orario: slot.orario
        })
      );
      
      const results = await Promise.all(bookingPromises);
      const failedBookings = results.filter(result => !result.success);
      
      if (failedBookings.length > 0) {
        const totalFailed = failedBookings.length;
        const totalSuccessful = results.length - totalFailed;
        
        let message = '';
        if (totalSuccessful > 0) {
          message = `${totalSuccessful} lesson(s) were booked successfully, but ${totalFailed} lesson(s) couldn't be booked. Some time slots may have been taken by other students or are no longer available.`;
        } else {
          message = `None of the ${selectedSlots.length} lessons could be booked. The time slots may have been taken by other students. Please try selecting different times.`;
        }
        
        Alert.alert(
          'Booking Issues', 
          message,
          [
            { text: 'Back to Calendar', onPress: () => navigation.navigate('Calendar') }
          ]
        );
      } else {
        Alert.alert(
          'Payment Successful!', 
          `Your ${selectedSlots.length} English lessons have been booked successfully. Total paid: €${totalCost}.00`,
          [
            { text: 'View My Bookings', onPress: () => navigation.navigate('Storico') },
            { text: 'Back to Home', onPress: () => navigation.navigate('Home') }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <BackgroundWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Order Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>📋 Order Summary</Text>
          <Text style={styles.customerText}>Student: {user.nome}</Text>
          
          <View style={styles.lessonsContainer}>
            <Text style={styles.lessonsTitle}>Selected Lessons ({selectedSlots.length}):</Text>
            {selectedSlots.map((slot, index) => (
              <View key={index} style={styles.lessonItem}>
                <Text style={styles.lessonDate}>{formatDate(slot.data)}</Text>
                <Text style={styles.lessonTime}>{slot.orario_formatted}</Text>
                <Text style={styles.lessonPrice}>€10.00</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>€{totalCost}.00</Text>
          </View>
        </Card>

        {/* Payment Methods */}
        <Card style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>💳 Payment Method</Text>
          {paymentMethods.map(method => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                paymentMethod === method.id && styles.selectedPaymentMethod
              ]}
              onPress={() => setPaymentMethod(method.id)}
            >
              <View style={styles.paymentMethodContent}>
                <Text style={styles.paymentIcon}>{method.icon}</Text>
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentName}>{method.name}</Text>
                  <Text style={styles.paymentDescription}>{method.description}</Text>
                </View>
                <View style={[
                  styles.radioButton,
                  paymentMethod === method.id && styles.radioButtonSelected
                ]} />
              </View>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Payment Button */}
        <Card style={styles.actionCard}>
          <TouchableOpacity 
            style={[styles.payButton, processing && styles.payButtonDisabled]}
            onPress={handlePayment}
            disabled={processing}
          >
            {processing ? (
              <View style={styles.processingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.payButtonText}>Processing Payment...</Text>
              </View>
            ) : (
              <Text style={styles.payButtonText}>Pay €{totalCost}.00</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={processing}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </Card>

        {/* Security Notice */}
        <Card style={styles.securityCard}>
          <Text style={styles.securityTitle}>🔒 Secure Payment</Text>
          <Text style={styles.securityText}>
            Your payment information is encrypted and secure. We never store your payment details.
          </Text>
        </Card>
      </ScrollView>
    </BackgroundWrapper>
  );
};
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  summaryCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 16,
  },
  customerText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  lessonsContainer: {
    marginBottom: 16,
  },
  lessonsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  lessonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  lessonDate: {
    fontSize: 14,
    color: '#1e3a8a',
    fontWeight: 'bold',
    flex: 2,
  },
  lessonTime: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
    textAlign: 'center',
  },
  lessonPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#16a34a',
    textAlign: 'right',
  },  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  paymentCard: {
    marginBottom: 16,
  },
  paymentMethod: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
  },
  selectedPaymentMethod: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 4,
  },  paymentDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  radioButtonSelected: {
    borderColor: '#dc2626',
    backgroundColor: '#dc2626',
  },
  actionCard: {
    marginBottom: 16,
  },
  payButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  securityCard: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
  },
});

export default CheckoutScreen;