import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Camera, FilePlus } from 'lucide-react-native';
import { useDatabase } from '../hooks/useDatabase';
import DocumentListItem from '../components/DocumentListItem';

const HomeScreen = (): React.ReactElement => {
  const { documents, isDBLoading, loadDocuments } = useDatabase();

  const handleScanPress = (): void => {
    console.log('Navegando para a tela da câmera...');
  };

  const renderContent = () => {
    if (isDBLoading) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-700 mt-3">Carregando documentos...</Text>
        </View>
      );
    }

    if (documents.length === 0) {
      return (
        <View className="flex-1 justify-center items-center">
          <FilePlus size={80} color="#4A4A4A" />
          <Text className="text-xl text-gray-800 mt-4">Nenhum documento</Text>
          <Text className="text-base text-gray-500 text-center mt-2">
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
            onPress={() => console.log('Abrir documento:', item.id)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onRefresh={loadDocuments}
        refreshing={isDBLoading}
      />
    );
  };

  return (
    <View className="flex-1 p-6 bg-gray-50">
      {/* Cabeçalho */}
      <View className="flex-row justify-between items-center mb-8">
        <Text className="text-3xl font-bold text-gray-900">
          Seus Documentos
        </Text>
      </View>

      {/* Conteúdo dinâmico */}
      {renderContent()}

      {/* Botão Flutuante de Ação (FAB) */}
      <TouchableOpacity
        onPress={handleScanPress}
        className="absolute bottom-10 right-6 bg-blue-500 h-16 w-16 rounded-full justify-center items-center shadow-lg"
        activeOpacity={0.8}
      >
        <Camera size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
