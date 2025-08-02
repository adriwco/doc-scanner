// src/components/DocumentListItem.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { FileText, Clock, Trash2 } from 'lucide-react-native';
import type { Document } from '../services/database';

interface DocumentListItemProps {
  item: Document;
  onPress: () => void;
  onDelete: () => void;
}

const DocumentListItem = React.memo(
  ({ item, onPress, onDelete }: DocumentListItemProps) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    return (
      <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center bg-surface p-4 rounded-xl mb-4"
        activeOpacity={0.7}
      >
        <View className="w-20 h-24 bg-gray-200 rounded-lg justify-center items-center mr-4 overflow-hidden">
          {item.coverUri ? (
            <Image
              source={{ uri: item.coverUri }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <FileText size={32} color="#4A4A4A" />
          )}
        </View>

        <View className="flex-1">
          <Text
            className="text-lg font-bold text-onPrimary mb-1"
            numberOfLines={2}
          >
            {item.name}
          </Text>
          <Text className="text-sm text-onSurface mb-2">
            {item.totalPages} {item.totalPages > 1 ? 'páginas' : 'página'}
          </Text>
          <View className="flex-row items-center">
            <Clock size={14} color="#A855F7" />
            <Text className="text-xs text-purple-400 ml-1.5">
              {formattedDate}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={onDelete} className="p-3 ml-2">
          <Trash2 size={20} color="#EF4444" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  },
);

export default DocumentListItem;
