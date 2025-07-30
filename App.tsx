// App.tsx
import './global.css';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-600">
      <Text className="text-white text-2xl">Tailwind está funcionando!</Text>
      <StatusBar style="light" />
    </View>
  );
}
