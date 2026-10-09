import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, StatusBar, View, Text } from 'react-native';
import { colors } from './theme/colors';
import LoginScreen from './screens/LoginScreen';
import StudentDashboardScreen from './screens/StudentDashboardScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [lang, setLang] = useState('en');

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'kn' : 'en'));
  };

  const handleLoginSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {!token || !user ? (
        <LoginScreen onLoginSuccess={handleLoginSuccess} lang={lang} toggleLang={toggleLang} />
      ) : user.role === 'STUDENT' ? (
        <StudentDashboardScreen user={user} token={token} onLogout={handleLogout} lang={lang} />
      ) : (
        <AdminDashboardScreen user={user} token={token} onLogout={handleLogout} lang={lang} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
