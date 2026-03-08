import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import SplashScreen      from '../screens/SplashScreen';
import SignInScreen      from '../screens/SignInScreen';
import OnboardingScreen  from '../screens/OnboardingScreen';
import DashboardScreen   from '../screens/DashboardScreen';
import ScannerScreen     from '../screens/ScannerScreen';
import PaintDetailScreen from '../screens/PaintDetailScreen';
import { Colors } from '../theme/colors';

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

// Custom scan FAB button
function ScanButton({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.fabTouchable}>
      <LinearGradient
        colors={['#E8C547', '#D4914A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fab}
      >
        <Ionicons name="qr-code-outline" size={24} color="#0A0B0D" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.dim,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home:     focused ? 'grid'             : 'grid-outline',
            Library:  focused ? 'color-palette'    : 'color-palette-outline',
            Scan:     'qr-code-outline',
            Projects: focused ? 'folder'           : 'folder-outline',
            Settings: focused ? 'settings'         : 'settings-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"     component={DashboardScreen} />
      <Tab.Screen
        name="Library"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Library' }}
      />
      <Tab.Screen
        name="Scan"
        component={ScannerScreen}
        options={{
          tabBarLabel: 'Scan',
          tabBarButton: (props) => (
            <ScanButton onPress={props.onPress} />
          ),
        }}
      />
      <Tab.Screen
        name="Projects"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Projects' }}
      />
      <Tab.Screen
        name="Settings"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animationEnabled: true }}
        initialRouteName="Splash"
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{
            gestureEnabled: false,
            cardStyleInterpolator: ({ current }) => ({
              cardStyle: { opacity: current.progress },
            }),
          }}
        />
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{
            cardStyleInterpolator: ({ current, layouts }) => ({
              cardStyle: {
                transform: [{
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                }],
              },
            }),
          }}
        />
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{
            gestureEnabled: false,
            cardStyleInterpolator: ({ current }) => ({
              cardStyle: { opacity: current.progress },
            }),
          }}
        />
        <Stack.Screen
          name="PaintDetail"
          component={PaintDetailScreen}
          options={{
            cardStyleInterpolator: ({ current, layouts }) => ({
              cardStyle: {
                transform: [{
                  translateY: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.height, 0],
                  }),
                }],
              },
            }),
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 10,
  },
  tabLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  fabTouchable: {
    top: -18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
});
