// src/screens/ScannerScreen.tsx
import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { ArrowLeft, VideoOff } from 'lucide-react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { useCameraPermission } from '../hooks/useCameraPermission';
import type { AppNavigationProp } from '../navigation/AppNavigator';

const ScannerScreen = (): React.ReactElement => {
  const navigation = useNavigation<AppNavigationProp>();
  const { hasPermission, requestPermission } = useCameraPermission();
  const isFocused = useIsFocused();

  const startScan = useCallback(async () => {
    if (!isFocused || !hasPermission) return;

    try {
      const { scannedImages } = await DocumentScanner.scanDocument({});

      if (scannedImages && scannedImages.length > 0) {
        navigation.navigate('Preview', { images: scannedImages });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Erro ao escanear o documento:', error);
      navigation.goBack();
    }
  }, [isFocused, hasPermission, navigation]);

  useEffect(() => {
    startScan();
  }, [hasPermission, isFocused]);

  if (hasPermission === null) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-onSurface mt-2">Verificando permissão...</Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background p-6">
        <VideoOff size={60} color="#EAEAEA" />
        <Text className="text-onBackground text-xl text-center font-bold mt-4">
          Permissão da Câmera Necessária
        </Text>
        <Text className="text-onSurface text-base text-center mt-2 mb-6">
          Para escanear documentos, precisamos do seu acesso à câmera.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-primary py-3 px-8 rounded-lg"
        >
          <Text className="text-onPrimary font-bold text-base">
            Conceder Permissão
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="absolute top-16 left-6 p-2"
        >
          <ArrowLeft size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-background">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="text-onSurface mt-2">Abrindo a câmera...</Text>
    </SafeAreaView>
  );
};

export default ScannerScreen;
