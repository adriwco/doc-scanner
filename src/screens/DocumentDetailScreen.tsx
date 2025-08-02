// src/screens/DocumentDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
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

  if (isLoading || !document) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Cabeçalho */}
      <View className="flex-row items-center justify-between p-4 border-b border-surface">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <ArrowLeft size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-xl font-bold text-onPrimary" numberOfLines={1}>
            {document.name}
          </Text>
        </View>
        <View className="w-12 items-center">
          <Text className="text-onSurface">
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
