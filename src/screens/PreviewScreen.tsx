// src/screens/PreviewScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft, Save, Edit3, FileText } from 'lucide-react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import * as FileSystem from 'expo-file-system';
import Ocr from 'react-native-mlkit-ocr';
import { useDatabase } from '../hooks/useDatabase';
import { useToast } from '../context/ToastContext';
import type {
  AppNavigationProp,
  RootStackParamList,
} from '../navigation/AppNavigator';

type PreviewScreenRouteProp = RouteProp<RootStackParamList, 'Preview'>;

interface ImageItem {
  key: string;
  uri: string;
}

interface OcrResultBlock {
  text: string;
}

const PreviewScreen = (): React.ReactElement => {
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute<PreviewScreenRouteProp>();
  const { createNewDocument } = useDatabase();
  const { showToast } = useToast();

  const initialImages: ImageItem[] = route.params.images.map((uri, index) => ({
    key: `image-${index}-${Date.now()}`,
    uri,
  }));

  const [documentName, setDocumentName] = useState<string>('');
  const [pages, setPages] = useState<ImageItem[]>(initialImages);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (route.params?.editedImageUri && route.params?.imageKey) {
      const { editedImageUri, imageKey } = route.params;
      setPages((currentPages) =>
        currentPages.map((page) =>
          page.key === imageKey ? { ...page, uri: editedImageUri } : page,
        ),
      );
      navigation.setParams({ editedImageUri: undefined, imageKey: undefined });
    }
  }, [route.params?.editedImageUri, route.params?.imageKey, navigation]);

  const handleSave = async () => {
    if (!documentName.trim()) {
      Alert.alert('Nome Inválido', 'Por favor, dê um nome ao seu documento.');
      return;
    }

    if (isSaving) return;
    setIsSaving(true);

    try {
      const docDir = `${FileSystem.documentDirectory}docs/${Date.now()}/`;
      await FileSystem.makeDirectoryAsync(docDir, { intermediates: true });

      let coverUri = '';

      const ocrPromises = pages.map(async (page, i) => {
        const newUri = `${docDir}page_${i}.jpg`;
        await FileSystem.copyAsync({ from: page.uri, to: newUri });

        const ocrResult: OcrResultBlock[] = await Ocr.detectFromUri(newUri);
        const textContent = ocrResult
          .map((block: OcrResultBlock) => block.text)
          .join('\n');

        if (i === 0) {
          coverUri = newUri;
        }

        return { uri: newUri, pageNumber: i + 1, textContent };
      });

      const processedPages = await Promise.all(ocrPromises);

      const newDocData = {
        name: documentName.trim(),
        createdAt: new Date().toISOString(),
        totalPages: processedPages.length,
        coverUri: coverUri,
      };

      await createNewDocument(newDocData, processedPages);

      showToast('Documento salvo com sucesso!');
      setTimeout(() => {
        navigation.navigate('Home');
      }, 500);
    } catch (error) {
      console.error('Erro ao salvar o documento:', error);
      Alert.alert('Erro', 'Não foi possível salvar e processar o documento.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditPress = (item: ImageItem) => {
    navigation.navigate('Edit', { imageUri: item.uri, imageKey: item.key });
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
          Página {pages.findIndex((p) => p.key === item.key) + 1}
        </Text>
        <TouchableOpacity
          onPress={() => handleEditPress(item)}
          className="p-2 ml-2"
        >
          <Edit3 size={20} color="#3B82F6" />
        </TouchableOpacity>
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
            {isSaving ? (
              <ActivityIndicator color="#3B82F6" />
            ) : (
              <Save size={28} color="#3B82F6" />
            )}
          </TouchableOpacity>
        </View>

        <TextInput
          value={documentName}
          onChangeText={setDocumentName}
          placeholder="Nome do Documento"
          placeholderTextColor="#888"
          className="bg-surface text-onSurface text-lg p-4 rounded-xl mb-6"
        />

        {isSaving && (
          <View className="flex-row items-center justify-center my-4">
            <FileText size={18} color="#A855F7" />
            <Text className="text-secondary ml-2">
              Processando texto das imagens...
            </Text>
          </View>
        )}

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
