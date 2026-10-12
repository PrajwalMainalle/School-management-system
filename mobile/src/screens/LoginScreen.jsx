import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { mobileAuthService } from '../services/authService';

export default function LoginScreen({ onLoginSuccess, lang, toggleLang }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!identifier || !password) {
      setErrorMsg(lang === 'en' ? 'Username/Email and Password are required' : 'ಬಳಕೆದಾರರ ಹೆಸರು ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ಅಗತ್ಯವಿದೆ');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await mobileAuthService.login(identifier, password);
      if (res.success && res.data?.token) {
        onLoginSuccess(res.data.user, res.data.token);
      } else {
        setErrorMsg(res.message || (lang === 'en' ? 'Invalid credentials' : 'ಅಮಾನ್ಯ ರುಜುವಾತುಗಳು'));
      }
    } catch (err) {
      setErrorMsg(err.message || 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🌱 School ERP</Text>
        <Text style={styles.subtitle}>
          {lang === 'en' ? 'Mobile Education Portal' : 'ಮೊಬೈಲ್ ಶಿಕ್ಷಣ ಪೋರ್ಟಲ್'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{lang === 'en' ? 'Sign In' : 'ಸೈನ್ ಇನ್'}</Text>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{lang === 'en' ? 'Email / Username' : 'ಇಮೇಲ್ / ಬಳಕೆದಾರ ಹೆಸರು'}</Text>
          <TextInput
            style={styles.input}
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="e.g. superadmin or user@school.com"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{lang === 'en' ? 'Password' : 'ಪಾಸ್‌ವರ್ಡ್'}</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />
        </View>

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginBtnText}>{lang === 'en' ? 'Login to Portal' : 'ಲಾಗಿನ್ ಮಾಡಿ'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.langBtn} onPress={toggleLang}>
          <Text style={styles.langBtnText}>
            {lang === 'en' ? 'Switch to ಕನ್ನಡ' : 'Switch to English'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primarySky,
  },
  subtitle: {
    fontSize: 13,
    color: colors.ecoGreen,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginBottom: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  loginBtn: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  langBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  langBtnText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '600',
  },
});
