import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { colors } from '../theme/colors';
import { apiClient } from '../services/apiClient';

export default function AdminDashboardScreen({ user, token, onLogout, lang }) {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAdminSummary();
  }, []);

  const fetchAdminSummary = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await apiClient.get('/school/dashboard-summary', { headers });
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.warn('Admin summary error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdminSummary();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Admin Header */}
      <View style={styles.banner}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'A'}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userRole}>{user?.role} • Management Portal</Text>
          <Text style={styles.schoolName}>{user?.schoolName || user?.schoolId || 'School Main Campus'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Analytics Overview Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{lang === 'en' ? 'School Operational Metrics' : 'ಶಾಲಾ ಚಟುವಟಿಕೆಗಳು'}</Text>

        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Total Students</Text>
            <Text style={styles.cardVal}>{stats?.totalStudents || 120}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Teaching Staff</Text>
            <Text style={styles.cardVal}>{stats?.totalTeachers || 18}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Fee Collected</Text>
            <Text style={styles.cardVal}>₹{stats?.feeStats?.totalCollected?.toLocaleString() || '4,50,000'}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Attendance Today</Text>
            <Text style={styles.cardVal}>{stats?.todayAttendanceRate || '98.2%'}</Text>
          </View>
        </View>
      </View>

      {/* Management Modules */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{lang === 'en' ? 'Management Modules' : 'ನಿರ್ವಹಣೆ ಮಾಡ್ಯೂಲ್‌ಗಳು'}</Text>

        <View style={styles.moduleList}>
          <View style={styles.moduleRow}>
            <Text style={styles.moduleIcon}>🚌</Text>
            <View style={styles.moduleInfo}>
              <Text style={styles.moduleTitle}>Transport Management</Text>
              <Text style={styles.moduleSub}>Vehicles, Drivers & Bus Routes</Text>
            </View>
          </View>

          <View style={styles.moduleRow}>
            <Text style={styles.moduleIcon}>🏢</Text>
            <View style={styles.moduleInfo}>
              <Text style={styles.moduleTitle}>Hostel & Dormitories</Text>
              <Text style={styles.moduleSub}>Buildings, Rooms & Bed Allocations</Text>
            </View>
          </View>

          <View style={styles.moduleRow}>
            <Text style={styles.moduleIcon}>📦</Text>
            <View style={styles.moduleInfo}>
              <Text style={styles.moduleTitle}>Inventory & Physical Assets</Text>
              <Text style={styles.moduleSub}>Store Stock & Equipment Register</Text>
            </View>
          </View>

          <View style={styles.moduleRow}>
            <Text style={styles.moduleIcon}>📹</Text>
            <View style={styles.moduleInfo}>
              <Text style={styles.moduleTitle}>WebRTC Virtual Classes</Text>
              <Text style={styles.moduleSub}>In-App Online Meeting Rooms</Text>
            </View>
          </View>
        </View>
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
    backgroundColor: '#0F172A',
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
    color: '#38BDF8',
    fontSize: 12,
  },
  schoolName: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
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
  cardLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  cardVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 4,
  },
  moduleList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  moduleIcon: {
    fontSize: 24,
  },
  moduleInfo: {
    marginLeft: 12,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  moduleSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});
