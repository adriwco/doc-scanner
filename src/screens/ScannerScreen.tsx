// src/screens/ScannerScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import type { AppNavigationProp } from '../navigation/AppNavigator';

const ScannerScreen = (): React.ReactElement => {
  const navigation = useNavigation<AppNavigationProp>();

  return (
    <View className="flex-1 justify-center items-center bg-background">
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="absolute top-16 left-6 p-2"
      >
        <ArrowLeft size={28} color="#FFFFFF" />
      </TouchableOpacity>
      <Text className="text-onBackground text-2xl">Tela do Scanner</Text>
      <Text className="text-onSurface mt-2">A câmera será exibida aqui.</Text>
    </View>
  );
};

export default ScannerScreen;
