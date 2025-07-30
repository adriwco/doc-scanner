// App.tsx
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-slate-800">
        Abra o App.tsx para começar a trabalhar no seu aplicativo!
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}
