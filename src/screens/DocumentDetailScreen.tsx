// src/screens/DocumentDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Share } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useDatabase } from '../hooks/useDatabase';
import type { Page } from '../services/database';
import type {
  AppNavigationProp,
  RootStackParamList,
} from '../navigation/AppNavigator';

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'DocumentDetail'>;

const { width: screenWidth } = Dimensions.get('window');

const DocumentDetailScreen = (): React.ReactElement => {
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute<DetailScreenRouteProp>();
  const { getPages, documents } = useDatabase();

  const { documentId } = route.params;
  const document = documents.find((doc) => doc.id === documentId);

  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const loadPages = async () => {
      setIsLoading(true);
      const fetchedPages = await getPages(documentId);
      setPages(fetchedPages);
      setIsLoading(false);
    };

    loadPages();
  }, [documentId, getPages]);

  const handleSharePdf = async () => {
    if (!document || pages.length === 0 || isSharing) return;

    setIsSharing(true);
    try {
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
      setIsSharing(false);
    }
  };

  if (isLoading || !document) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-4 h-16 border-b border-surface">
        <View className="w-12">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <ArrowLeft size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center">
          <Text
            className="text-xl font-bold text-onPrimary px-2"
            numberOfLines={1}
          >
            {document.name}
          </Text>
        </View>

        <View className="flex-row items-center justify-end min-w-[80px]">
          {isSharing ? (
            <ActivityIndicator color="#FFFFFF" className="mr-4" />
          ) : (
            <TouchableOpacity onPress={handleSharePdf} className="p-2 mr-2">
              <Share size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <Text className="text-onSurface text-sm">
            {currentPage}/{pages.length}
          </Text>
        </View>
      </View>

      {/* Visualizador de Páginas */}
      <View className="flex-1 justify-center items-center">
        <FlatList
          data={pages}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View
              style={{ width: screenWidth }}
              className="justify-center items-center p-2"
            >
              <Image
                source={{ uri: item.uri }}
                style={{
                  width: '100%',
                  height: '100%',
                }}
                resizeMode="contain"
              />
            </View>
          )}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / screenWidth,
            );
            setCurrentPage(index + 1);
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default DocumentDetailScreen;
