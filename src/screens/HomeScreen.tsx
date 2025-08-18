// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Camera, FilePlus, Search, X } from 'lucide-react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useDatabase } from '../hooks/useDatabase';
import DocumentListItem from '../components/DocumentListItem';
import type { AppNavigationProp } from '../navigation/AppNavigator';
import type { Document } from '../services/database';
import { useDebounce } from '../hooks/useDebounce';

const HomeScreen = (): React.ReactElement => {
  const {
    documents,
    isDBLoading,
    removeDocument: deleteDocumentFromDb,
    getPages,
    searchDocuments,
  } = useDatabase();
  const navigation = useNavigation<AppNavigationProp>();
  const [sharingId, setSharingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    searchDocuments(debouncedSearchQuery);
  }, [debouncedSearchQuery, searchDocuments]);

  const handleScanPress = (): void => {
    navigation.navigate('Scanner');
  };

  const handleOpenDocument = (documentId: number) => {
    navigation.navigate('DocumentDetail', { documentId });
  };

  const handleDeleteDocument = (document: { id: number; name: string }) => {
    Alert.alert(
      'Excluir Documento',
      `Tem certeza que deseja excluir "${document.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          onPress: async () => {
            try {
              await deleteDocumentFromDb(document.id);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o documento.');
            }
          },
          style: 'destructive',
        },
      ],
    );
  };

  const handleShareDocument = async (document: Document) => {
    if (sharingId) return;
    setSharingId(document.id);
    try {
      const pages = await getPages(document.id);
      if (!pages || pages.length === 0) {
        Alert.alert('Documento Vazio', 'Não há páginas para compartilhar.');
        return;
      }
      const htmlContent = `
        <html><body style="margin: 0; padding: 0;">
          ${pages
            .map(
              (page) =>
                `<img src="${page.uri}" style="width: 100%; height: auto; display: block; page-break-after: always;" />`,
            )
            .join('')}
        </body></html>`;
      const { uri: pdfUri } = await Print.printToFileAsync({
        html: htmlContent,
      });
      await Sharing.shareAsync(pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: `Compartilhar ${document.name}`,
      });
    } catch (error) {
      console.error('Erro ao gerar ou compartilhar PDF:', error);
      Alert.alert('Erro', 'Não foi possível gerar o PDF.');
    } finally {
      setSharingId(null);
    }
  };

  const renderContent = () => {
    if (isDBLoading) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      );
    }
    if (documents.length === 0) {
      return (
        <View className="flex-1 justify-center items-center p-4">
          <FilePlus size={80} color="#4A4A4A" />
          <Text className="text-xl text-onBackground font-bold mt-4">
            {searchQuery ? 'Nenhum Resultado' : 'Nenhum Documento'}
          </Text>
          <Text className="text-base text-onSurface text-center mt-2">
            {searchQuery
              ? 'Tente uma busca diferente.'
              : 'Toque na câmera para escanear.'}
          </Text>
        </View>
      );
    }
    return (
      <FlatList
        data={documents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <DocumentListItem
            item={item}
            onPress={() => handleOpenDocument(item.id)}
            onDelete={() => handleDeleteDocument(item)}
            onShare={() => handleShareDocument(item)}
            isSharing={sharingId === item.id}
          />
        )}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-1 p-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-3xl font-bold text-onPrimary">
              Seus Documentos
            </Text>
          </View>
          <View className="flex-row items-center bg-surface rounded-xl px-4 mb-4">
            <Search size={20} color="#888" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por nome ou conteúdo..."
              placeholderTextColor="#888"
              className="flex-1 text-onSurface p-3"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>
          {renderContent()}
        </View>
      </SafeAreaView>
      <TouchableOpacity
        onPress={handleScanPress}
        style={[
          styles.fab,
          { bottom: insets.bottom > 0 ? insets.bottom + 16 : 32 },
        ]}
        activeOpacity={0.8}
      >
        <Camera size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 24,
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default HomeScreen;
