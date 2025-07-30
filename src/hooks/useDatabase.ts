import { useState, useEffect, useCallback } from 'react';
import {
  initDatabase,
  getDocuments,
  addDocument,
  deleteDocument as dbDeleteDocument,
  type Document,
} from '../services/database';

export const useDatabase = () => {
  const [isDBLoading, setIsDBLoading] = useState<boolean>(true);
  const [documents, setDocuments] = useState<Document[]>([]);

  const loadDocuments = useCallback(async () => {
    try {
      setIsDBLoading(true);
      await initDatabase();
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error(
        'Falha ao carregar os documentos do banco de dados.',
        error,
      );
    } finally {
      setIsDBLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const createNewDocument = async (
    newDocData: Omit<Document, 'id'>,
  ): Promise<void> => {
    try {
      await addDocument(newDocData);
      await loadDocuments();
    } catch (error) {
      console.error('Erro ao adicionar novo documento:', error);
      throw error;
    }
  };

  const removeDocument = async (id: number): Promise<void> => {
    try {
      await dbDeleteDocument(id);
      await loadDocuments();
    } catch (error) {
      console.error(`Erro ao deletar o documento com id ${id}:`, error);
      throw error;
    }
  };

  return {
    documents,
    isDBLoading,
    loadDocuments,
    createNewDocument,
    removeDocument,
  };
};
