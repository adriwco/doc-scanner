// App.tsx
import './global.css';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { useDatabase } from './src/hooks/useDatabase';
import AppNavigator from './src/navigation/AppNavigator';

const App = (): React.ReactElement => {
  const { isDBLoading } = useDatabase();

  if (isDBLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-onBackground">Inicializando...</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <>
      <AppNavigator />
      <StatusBar style="light" />
    </>
  );
};

export default App;
