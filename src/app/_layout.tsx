import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
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
import { colors, shadows } from '@/theme';
import { HomeIcon, FoodsIcon, SettingsIcon, FooterBackground } from '@/components/illustrations';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from '@/hooks/useAuth';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
              backgroundColor: colors.surface,
              borderTopWidth: 0,
              ...shadows.sm,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarLabelStyle: {
              fontFamily: 'DMSans_400Regular',
              fontSize: 11,
            },
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
            }}
          />
          <Tabs.Screen
            name="auth"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="onboarding"
            options={{
              href: null,
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
