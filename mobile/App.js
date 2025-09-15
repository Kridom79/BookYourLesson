// mobile/App.js - Versione Mobile Originale
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import CalendarScreen from './screens/CalendarScreen';
import StoricoScreen from './screens/StoricoScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import AdminScreen from './screens/AdminScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check login status on app start
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.log('Error checking login status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (userData, token) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      setIsLoggedIn(true);
    } catch (error) {
      console.log('Error storing login data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  if (loading) {
    return null; // Loading screen
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1e3a8a',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isLoggedIn ? (
          <>
            <Stack.Screen 
              name="Login" 
              options={{ title: 'BookYourLesson - Login' }}
            >
              {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{ title: 'Create Account' }}
            />
          </>
        ) : (
          <>
            {user?.ruolo === 'admin' ? (
              // Admin users go directly to Admin Dashboard
              <>
                <Stack.Screen 
                  name="Admin" 
                  options={{ 
                    title: 'Admin Dashboard',
                    headerLeft: null
                  }}
                >
                  {(props) => <AdminScreen {...props} user={user} onLogout={handleLogout} />}
                </Stack.Screen>
                <Stack.Screen 
                  name="Home" 
                  options={{ 
                    title: 'Welcome to BookYourLesson'
                  }}
                >
                  {(props) => <HomeScreen {...props} user={user} onLogout={handleLogout} />}
                </Stack.Screen>
                <Stack.Screen 
                  name="Calendar" 
                  options={{ title: 'Book a Lesson' }}
                >
                  {(props) => <CalendarScreen {...props} user={user} />}
                </Stack.Screen>
                <Stack.Screen 
                  name="Checkout" 
                  options={{ title: 'Checkout' }}
                  component={CheckoutScreen}
                />
                <Stack.Screen 
                  name="Storico" 
                  options={{ title: 'My Bookings' }}
                >
                  {(props) => <StoricoScreen {...props} user={user} />}
                </Stack.Screen>
              </>
            ) : (
              // Regular users see normal flow
              <>
                <Stack.Screen 
                  name="Home" 
                  options={{ 
                    title: 'Welcome to BookYourLesson',
                    headerLeft: null
                  }}
                >
                  {(props) => <HomeScreen {...props} user={user} onLogout={handleLogout} />}
                </Stack.Screen>
                <Stack.Screen 
                  name="Calendar" 
                  options={{ title: 'Book a Lesson' }}
                >
                  {(props) => <CalendarScreen {...props} user={user} />}
                </Stack.Screen>
                <Stack.Screen 
                  name="Checkout" 
                  options={{ title: 'Checkout' }}
                  component={CheckoutScreen}
                />
                <Stack.Screen 
                  name="Storico" 
                  options={{ title: 'My Bookings' }}
                >
                  {(props) => <StoricoScreen {...props} user={user} />}
                </Stack.Screen>
                <Stack.Screen 
                  name="Admin" 
                  options={{ title: 'Admin Dashboard' }}
                >
                  {(props) => <AdminScreen {...props} user={user} />}
                </Stack.Screen>
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
