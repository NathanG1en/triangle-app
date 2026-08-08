import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Platform } from 'react-native';
import { colors } from './src/theme/colors';
import { typography } from './src/theme/typography';
import { DiscoverScreen } from './src/screens/DiscoverScreen';
import { MyEventsScreen } from './src/screens/MyEventsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'discover' | 'my-events' | 'profile'>('discover');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.paper} />

      {/* Main Container with max-width wrapper for web/desktop */}
      <View style={styles.appWrapper}>
        <View style={styles.contentContainer}>
          {currentTab === 'discover' && <DiscoverScreen />}
          {currentTab === 'my-events' && <MyEventsScreen />}
          {currentTab === 'profile' && <ProfileScreen />}
        </View>

        {/* Bottom Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, currentTab === 'discover' && styles.activeTabItem]}
            onPress={() => setCurrentTab('discover')}
          >
            <Text style={styles.tabIcon}>🔥</Text>
            <Text style={[styles.tabLabel, currentTab === 'discover' && styles.activeTabLabel]}>Discover</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentTab === 'my-events' && styles.activeTabItem]}
            onPress={() => setCurrentTab('my-events')}
          >
            <Text style={styles.tabIcon}>⭐</Text>
            <Text style={[styles.tabLabel, currentTab === 'my-events' && styles.activeTabLabel]}>Plans</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentTab === 'profile' && styles.activeTabItem]}
            onPress={() => setCurrentTab('profile')}
          >
            <Text style={styles.tabIcon}>👤</Text>
            <Text style={[styles.tabLabel, currentTab === 'profile' && styles.activeTabLabel]}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EFEAE4',
  },
  appWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 600, // Mobile viewport frame centered on wide desktop monitors
    alignSelf: 'center',
    backgroundColor: colors.paper,
    boxShadow: Platform.OS === 'web' ? '0px 0px 30px rgba(0,0,0,0.1)' : undefined,
  },
  contentContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.ticketBorder,
    paddingBottom: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabItem: {
    borderTopWidth: 2,
    borderTopColor: colors.coral,
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabLabel: {
    fontFamily: typography.sansFont,
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
  },
  activeTabLabel: {
    color: colors.ink,
    fontWeight: '800',
  },
});
