// src/screens/PreviewScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft, Save } from 'lucide-react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { useDatabase } from '../hooks/useDatabase';
import type {
  AppNavigationProp,
  RootStackParamList,
} from '../navigation/AppNavigator';

type PreviewScreenRouteProp = RouteProp<RootStackParamList, 'Preview'>;

interface ImageItem {
  key: string;
  uri: string;
}

const PreviewScreen = (): React.ReactElement => {
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute<PreviewScreenRouteProp>();
  const { createNewDocument } = useDatabase(); // Obtenha a função para criar documentos

  const initialImages: ImageItem[] = route.params.images.map((uri) => ({
    key: `image-${uri}`,
    uri,
  }));

  const [documentName, setDocumentName] = useState<string>('');
  const [pages, setPages] = useState<ImageItem[]>(initialImages);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSave = async () => {
    if (!documentName.trim()) {
      Alert.alert('Nome Inválido', 'Por favor, dê um nome ao seu documento.');
      return;
    }

    if (isSaving) return;
    setIsSaving(true);

    try {
      const newDocData = {
        name: documentName.trim(),
        createdAt: new Date().toISOString(),
        totalPages: pages.length,
        coverUri: pages[0]?.uri || '',
      };

      await createNewDocument(newDocData);

      navigation.navigate('Home');
    } catch (error) {
      console.error('Erro ao salvar o documento:', error);
      Alert.alert('Erro', 'Não foi possível salvar o documento.');
      setIsSaving(false);
    }
  };

  const renderItem = ({
    item,
    drag,
    isActive,
  }: RenderItemParams<ImageItem>): React.ReactElement => {
    return (
      <TouchableOpacity
        onLongPress={drag}
        disabled={isActive}
        className={`flex-row items-center bg-surface p-3 rounded-lg mb-3 ${
          isActive ? 'opacity-70' : 'opacity-100'
        }`}
      >
        <Image
          source={{ uri: item.uri }}
          className="w-16 h-20 rounded-md mr-4"
          resizeMode="cover"
        />
        <Text className="text-onSurface flex-1">
          Página {pages.indexOf(item) + 1}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6">
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <ArrowLeft size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-onPrimary">
            Revisar Documento
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving}
            className="p-2"
          >
            <Save size={28} color={isSaving ? '#888' : '#3B82F6'} />
          </TouchableOpacity>
        </View>

        <TextInput
          value={documentName}
          onChangeText={setDocumentName}
          placeholder="Nome do Documento"
          placeholderTextColor="#888"
          className="bg-surface text-onSurface text-lg p-4 rounded-xl mb-6"
        />

        <DraggableFlatList
          data={pages}
          onDragEnd={({ data }) => setPages(data)}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          containerStyle={{ flex: 1 }}
        />
      </View>
    </SafeAreaView>
  );
};

export default PreviewScreen;
