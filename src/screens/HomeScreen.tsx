// src/screens/HomeScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Camera, FilePlus } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useDatabase } from '../hooks/useDatabase';
import DocumentListItem from '../components/DocumentListItem';
import type { AppNavigationProp } from '../navigation/AppNavigator';
import type { Document } from '../services/database';

const HomeScreen = (): React.ReactElement => {
  const {
    documents,
    isDBLoading,
    loadDocuments,
    removeDocument: deleteDocumentFromDb,
    getPages,
  } = useDatabase();
  const navigation = useNavigation<AppNavigationProp>();
  const [sharingId, setSharingId] = useState<number | null>(null);

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
        {
          text: 'Cancelar',
          style: 'cancel',
        },
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
        <html>
          <body style="margin: 0; padding: 0;">
            ${pages
              .map(
                (page) =>
                  `<img src="${page.uri}" style="width: 100%; height: auto; display: block; page-break-after: always;" />`,
              )
              .join('')}
          </body>
        </html>
      `;

      const { uri: pdfUri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(
          'Compartilhamento indisponível',
          'Não é possível compartilhar arquivos neste dispositivo.',
        );
        return;
      }

      await Sharing.shareAsync(pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: `Compartilhar ${document.name}`,
      });
    } catch (error) {
      console.error('Erro ao gerar ou compartilhar PDF:', error);
      Alert.alert(
        'Erro',
        'Não foi possível gerar o PDF para compartilhamento.',
      );
    } finally {
      setSharingId(null);
    }
  };

  const renderContent = () => {
    if (isDBLoading && documents.length === 0) {
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
            Nenhum Documento
          </Text>
          <Text className="text-base text-onSurface text-center mt-2">
            Toque no ícone da câmera para {'\n'} escanear seu primeiro
            documento.
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
        onRefresh={loadDocuments}
        refreshing={isDBLoading}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-3xl font-bold text-onPrimary">
            Seus Documentos
          </Text>
        </View>

        {renderContent()}

        <TouchableOpacity
          onPress={handleScanPress}
          className="absolute bottom-10 right-6 bg-primary h-16 w-16 rounded-full justify-center items-center shadow-lg"
          activeOpacity={0.8}
        >
          <Camera size={28} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
