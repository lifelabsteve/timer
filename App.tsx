import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import SettingsScreen from './src/screens/SettingsScreen';
import TimerScreen from './src/screens/TimerScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Settings"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#262626' }
          }}
        >
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Timer" component={TimerScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
} 