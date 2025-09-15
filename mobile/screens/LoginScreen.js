// mobile/screens/LoginScreen.js - Versione Mobile Originale
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import BackgroundWrapper from '../components/BackgroundWrapper';
import Card from '../components/Card';
import AppHeader from '../components/AppHeader';
import api from '../utils/api';

const LoginScreen = ({ navigation, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting login for:', email);
      const response = await api.login({ email, password });
      console.log('Login response:', response);
      
      if (response.error) {
        // Migliora il messaggio di errore per tutti i casi
        if (response.error === 'Invalid credentials') {
          Alert.alert(
            'Login Failed', 
            'The email or password you entered is incorrect. If you don\'t have an account yet, please register first.',
            [
              { text: 'Try Again', style: 'default' },
              { text: 'Register', onPress: () => navigation.navigate('Register') }
            ]
          );
        } else if (response.error === 'Database error' || response.error === 'Server error') {
          // Messaggio migliorato per errori del server che potrebbero indicare utente non registrato
          Alert.alert(
            'Login Failed', 
            'Unable to verify your credentials. This might mean your email is not registered yet. Would you like to create a new account?',
            [
              { text: 'Try Again', style: 'default' },
              { text: 'Register', onPress: () => navigation.navigate('Register') }
            ]
          );
        } else {
          Alert.alert('Login Failed', response.error);
        }
      } else if (response.user && response.token) {
        console.log('Login successful for user:', response.user.nome);
        onLogin(response.user, response.token);
      } else {
        Alert.alert('Login Failed', 'Invalid server response');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Connection Error', 'Unable to connect to server. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <AppHeader 
          title="BookYourLesson" 
          subtitle="Learn English with Cristina"
        />

        <Card>
          <Text style={styles.formTitle}>Welcome Back!</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeIcon}>
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.disabledButton]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  loginButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 16,
    color: '#64748b',
  },
  registerLink: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: 'bold',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  eyeIcon: {
    fontSize: 18,
  },
});

export default LoginScreen;
