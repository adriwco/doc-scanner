// App.tsx
import './global.css';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, View, Text, ActivityIndicator } from 'react-native';
import { useDatabase } from './src/hooks/useDatabase';
import HomeScreen from './src/screens/HomeScreen';

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
    <SafeAreaView className="flex-1 bg-background">
      <HomeScreen />
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default App;
