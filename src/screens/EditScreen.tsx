// src/screens/EditScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as ImageManipulator from 'expo-image-manipulator';
import { ArrowLeft, RotateCw, Check } from 'lucide-react-native';
import type {
  AppNavigationProp,
  RootStackParamList,
} from '../navigation/AppNavigator';

type EditScreenRouteProp = RouteProp<RootStackParamList, 'Edit'>;

const EditScreen = (): React.ReactElement => {
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute<EditScreenRouteProp>();
  const { imageUri, imageKey } = route.params;

  const [rotation, setRotation] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleRotate = useCallback(() => {
    setRotation((currentRotation) => (currentRotation + 90) % 360);
  }, []);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    if (rotation === 0) {
      navigation.goBack();
      return;
    }

    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ rotate: rotation }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG },
      );

      navigation.navigate({
        name: 'Preview',
        params: {
          images: [],
          editedImageUri: manipResult.uri,
          imageKey: imageKey,
        },
        merge: true,
      });
    } catch (error) {
      console.error('Erro ao rotacionar a imagem:', error);
      Alert.alert('Erro', 'Não foi possível salvar a imagem editada.');
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between p-4 border-b border-surface">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <ArrowLeft size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-onPrimary">Editar Página</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          className="p-2 w-10"
        >
          {isSaving ? (
            <ActivityIndicator color="#3B82F6" />
          ) : (
            <Check size={28} color="#3B82F6" />
          )}
        </TouchableOpacity>
      </View>

      <View className="flex-1 justify-center items-center p-4">
        <Image
          source={{ uri: imageUri }}
          className="w-full h-full"
          resizeMode="contain"
          style={{ transform: [{ rotate: `${rotation}deg` }] }}
        />
      </View>

      <View className="flex-row justify-center items-center p-4 border-t border-surface">
        <TouchableOpacity
          onPress={handleRotate}
          className="flex-col items-center p-2"
        >
          <RotateCw size={28} color="#FFFFFF" />
          <Text className="text-onPrimary text-xs mt-1">Rotacionar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EditScreen;
