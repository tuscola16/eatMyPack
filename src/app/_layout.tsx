import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import {
  DMSans_400Regular,
  DMSans_500Medium,
} from '@expo-google-fonts/dm-sans';
import { colors } from '@/theme';
import { HomeIcon, FoodsIcon, SettingsIcon, FooterBackground } from '@/components/illustrations';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from '@/hooks/useAuth';
import { initSentry, Sentry } from '@/services/sentry';

SplashScreen.preventAutoHideAsync();
initSentry();

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 64;

function RootLayout() {
  useLocalStorage();
  useAuth();

  const [fontsLoaded, fontError] = useFonts({
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Tabs
          screenOptions={{
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.textPrimary,
            headerTitleStyle: {
              fontFamily: 'Nunito_700Bold',
              color: colors.textPrimary,
            },
            tabBarStyle: {
              backgroundColor: 'transparent',
              borderTopWidth: 0,
              height: TAB_BAR_HEIGHT,
              elevation: 0,
            },
            tabBarBackground: () => (
              <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                <FooterBackground width={SCREEN_WIDTH} height={TAB_BAR_HEIGHT} />
              </View>
            ),
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarShowLabel: false,
            tabBarIconStyle: { marginTop: 8 },
            headerShadowVisible: false,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <View style={{ opacity: focused ? 1 : 0.4 }}>
                  <HomeIcon width={24} height={24} />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="database"
            options={{
              title: 'Foods',
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <View style={{ opacity: focused ? 1 : 0.4 }}>
                  <FoodsIcon width={24} height={24} />
                </View>
              ),
            }}
            listeners={({ navigation }) => ({
              tabPress: () => {
                navigation.navigate('database', { screen: 'index' });
              },
            })}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <View style={{ opacity: focused ? 1 : 0.4 }}>
                  <SettingsIcon width={24} height={24} />
                </View>
              ),
            }}
            listeners={({ navigation }) => ({
              tabPress: () => {
                navigation.navigate('settings', { screen: 'index' });
              },
            })}
          />
          <Tabs.Screen
            name="race"
            options={{
              href: null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="pantry"
            options={{
              href: null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="auth"
            options={{
              href: null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="onboarding"
            options={{
              href: null,
              headerShown: false,
            }}
          />
        </Tabs>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default Sentry.wrap(RootLayout);
