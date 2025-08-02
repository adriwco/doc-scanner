// src/screens/HomeScreen.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Camera, FilePlus } from 'lucide-react-native';
import { useDatabase } from '../hooks/useDatabase';
import DocumentListItem from '../components/DocumentListItem';
import type { AppNavigationProp } from '../navigation/AppNavigator';

const HomeScreen = (): React.ReactElement => {
  const { documents, isDBLoading, loadDocuments } = useDatabase();
  const navigation = useNavigation<AppNavigationProp>();

  const handleScanPress = (): void => {
    navigation.navigate('Scanner');
  };

  const handleOpenDocument = (documentId: number) => {
    navigation.navigate('DocumentDetail', { documentId });
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
