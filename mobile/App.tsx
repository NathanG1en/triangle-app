import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Platform } from 'react-native';
import { colors } from './src/theme/colors';
import { FontProvider, useFontTheme } from './src/theme/typography';
import { CompassIcon, CalendarIcon, PersonIcon } from './src/components';
import { DiscoverScreen } from './src/screens/DiscoverScreen';
import { MyEventsScreen } from './src/screens/MyEventsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

function MainAppContent() {
  const [currentTab, setCurrentTab] = useState<'discover' | 'my-events' | 'profile'>('discover');
  const { sansFont } = useFontTheme();

  return (
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
          <CompassIcon color={currentTab === 'discover' ? colors.coral : colors.muted} size={20} />
          <Text
            style={[
              styles.tabLabel,
              { fontFamily: sansFont },
              currentTab === 'discover' && styles.activeTabLabel,
            ]}
          >
            Discover
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, currentTab === 'my-events' && styles.activeTabItem]}
          onPress={() => setCurrentTab('my-events')}
        >
          <CalendarIcon color={currentTab === 'my-events' ? colors.coral : colors.muted} size={20} />
          <Text
            style={[
              styles.tabLabel,
              { fontFamily: sansFont },
              currentTab === 'my-events' && styles.activeTabLabel,
            ]}
          >
            Plans
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, currentTab === 'profile' && styles.activeTabItem]}
          onPress={() => setCurrentTab('profile')}
        >
          <PersonIcon color={currentTab === 'profile' ? colors.coral : colors.muted} size={20} />
          <Text
            style={[
              styles.tabLabel,
              { fontFamily: sansFont },
              currentTab === 'profile' && styles.activeTabLabel,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <FontProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.paper} />
        <MainAppContent />
      </SafeAreaView>
    </FontProvider>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 5,
  },
  contentContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 56,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderRule,
    paddingBottom: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  activeTabItem: {
    borderTopWidth: 2,
    borderTopColor: colors.coral,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
  },
  activeTabLabel: {
    color: colors.ink,
    fontWeight: '800',
  },
});
