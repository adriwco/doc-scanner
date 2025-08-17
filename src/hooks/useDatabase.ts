// src/hooks/useDatabase.ts
import { useState, useEffect, useCallback } from 'react';
import {
  initDatabase,
  getDocuments,
  addDocument as dbAddDocument,
  deleteDocument as dbDeleteDocument,
  getPagesForDocument as dbGetPages,
  searchDocumentsByText as dbSearch,
  type Document,
  type Page,
} from '../services/database';

export const useDatabase = () => {
  const [isDBLoading, setIsDBLoading] = useState<boolean>(true);
  const [documents, setDocuments] = useState<Document[]>([]);

  const loadDocuments = useCallback(async () => {
    try {
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
    docData: Omit<Document, 'id'>,
    pagesData: Omit<Page, 'id' | 'documentId'>[],
  ): Promise<void> => {
    try {
      await dbAddDocument(docData, pagesData);
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

  const searchDocuments = async (query: string): Promise<void> => {
    try {
      setIsDBLoading(true);
      const docs = await dbSearch(query);
      setDocuments(docs);
    } catch (error) {
      console.error('Falha ao buscar documentos.', error);
    } finally {
      setIsDBLoading(false);
    }
  };

  const getPages = useCallback(async (documentId: number): Promise<Page[]> => {
    try {
      return await dbGetPages(documentId);
    } catch (error) {
      console.error(
        `Falha ao carregar as páginas do documento ${documentId}.`,
        error,
      );
      return [];
    }
  }, []);

  return {
    documents,
    isDBLoading,
    loadDocuments,
    createNewDocument,
    removeDocument,
    getPages,
    searchDocuments,
  };
};
