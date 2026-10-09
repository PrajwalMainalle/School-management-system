import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { apiClient } from '../services/apiClient';

export default function StudentDashboardScreen({ user, token, onLogout, lang }) {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notices, setNotices] = useState([]);
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [noticesRes, meetingsRes] = await Promise.all([
        apiClient.get('/communication/notices', { headers }).catch(() => null),
        apiClient.get('/meetings/meetings', { headers }).catch(() => null),
      ]);

      if (noticesRes?.data?.success) setNotices(noticesRes.data.data || []);
      if (meetingsRes?.data?.success) setMeetings(meetingsRes.data.data || []);
    } catch (err) {
      console.warn('Student mobile data load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudentData();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Student Banner */}
      <View style={styles.banner}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'S'}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userRole}>Student Portal • Grade 10-A</Text>
          <Text style={styles.schoolName}>{user?.schoolId || 'Greenwood International'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Action Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{lang === 'en' ? 'Student Services' : 'ವಿದ್ಯಾರ್ಥಿ ಸೇವೆಗಳು'}</Text>

        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardIcon}>📅</Text>
            <Text style={styles.cardText}>{lang === 'en' ? 'Attendance' : 'ಹಾಜರಾತಿ'}</Text>
            <Text style={styles.cardValue}>96.4%</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardIcon}>📝</Text>
            <Text style={styles.cardText}>{lang === 'en' ? 'Homework' : 'ಮನೆಕೆಲಸ'}</Text>
            <Text style={styles.cardValue}>2 Pending</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardIcon}>🏆</Text>
            <Text style={styles.cardText}>{lang === 'en' ? 'Report Card' : 'ಅಂಕಪಟ್ಟಿ'}</Text>
            <Text style={styles.cardValue}>Grade A+</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardIcon}>💳</Text>
            <Text style={styles.cardText}>{lang === 'en' ? 'Fee Invoices' : 'ಶುಲ್ಕ'}</Text>
            <Text style={styles.cardValue}>Paid</Text>
          </View>
        </View>
      </View>

      {/* Virtual Classes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{lang === 'en' ? 'Upcoming Live Classes' : 'ಮುಂಬರುವ ನೇರ ತರಗತಿಗಳು'}</Text>
        {meetings.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No live classes scheduled for today</Text>
          </View>
        ) : (
          meetings.slice(0, 2).map((m) => (
            <View key={m._id} style={styles.itemBox}>
              <Text style={styles.itemTitle}>📹 {m.title}</Text>
              <Text style={styles.itemSub}>{m.scheduledDate} at {m.scheduledTime} ({m.durationMinutes} mins)</Text>
              <TouchableOpacity style={styles.joinBtn}>
                <Text style={styles.joinBtnText}>Join Class Room</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Notices */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{lang === 'en' ? 'School Announcements' : 'ಶಾಲೆಯ ಸೂಚನೆಗಳು'}</Text>
        {notices.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No notices published</Text>
          </View>
        ) : (
          notices.slice(0, 3).map((n) => (
            <View key={n._id} style={styles.itemBox}>
              <Text style={styles.itemTitle}>📌 {n.title}</Text>
              <Text style={styles.itemSub}>{n.publishDate} • {n.priority}</Text>
              <Text style={styles.itemBody} numberOfLines={2}>{n.content}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  banner: {
    backgroundColor: '#0284C7',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userRole: {
    color: '#BAE6FD',
    fontSize: 12,
  },
  schoolName: {
    color: '#E0F2FE',
    fontSize: 11,
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardIcon: {
    fontSize: 24,
  },
  cardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 6,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 2,
  },
  emptyBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  itemBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  itemSub: {
    fontSize: 11,
    color: '#0284C7',
    marginTop: 2,
  },
  itemBody: {
    fontSize: 12,
    color: '#475569',
    marginTop: 6,
  },
  joinBtn: {
    backgroundColor: '#059669',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  joinBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
