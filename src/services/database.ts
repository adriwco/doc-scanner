// src/services/database.ts
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

export interface Document {
  id: number;
  name: string;
  createdAt: string;
  totalPages: number;
  coverUri: string;
}

export interface Page {
  id: number;
  documentId: number;
  uri: string;
  pageNumber: number;
}

function openDatabase(): SQLite.SQLiteDatabase {
  if (Platform.OS === 'web') {
    console.warn('Expo SQLite não é suportado na web, usando um mock.');

    return {
      execAsync: async () => [],
      runAsync: async () => ({ lastInsertRowId: 1, changes: 1 }),
      getAsync: async () => null,
      getAllAsync: async () => [],
      closeAsync: async () => {},
      execSync: () => [],
      runSync: () => ({ lastInsertRowId: 1, changes: 1 }),
      getSync: () => null,
      getAllSync: () => [],
      closeSync: () => {},
    } as unknown as SQLite.SQLiteDatabase;
  }

  const db = SQLite.openDatabaseSync('doc-scanner.db');
  return db;
}

const db = openDatabase();

export const initDatabase = async (): Promise<void> => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        totalPages INTEGER NOT NULL,
        coverUri TEXT
      );
      CREATE TABLE IF NOT EXISTS pages (
        id INTEGER PRIMARY KEY NOT NULL,
        documentId INTEGER NOT NULL,
        uri TEXT NOT NULL,
        pageNumber INTEGER NOT NULL,
        FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE
      );
    `);
    console.log('Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
    throw error;
  }
};

export const addDocument = async (
  doc: Omit<Document, 'id'>,
  pages: Omit<Page, 'id' | 'documentId'>[],
): Promise<number> => {
  let documentId: number | null = null;
  try {
    const result = await db.runAsync(
      'INSERT INTO documents (name, createdAt, totalPages, coverUri) VALUES (?, ?, ?, ?)',
      doc.name,
      doc.createdAt,
      doc.totalPages,
      doc.coverUri,
    );
    documentId = result.lastInsertRowId;

    for (const page of pages) {
      await db.runAsync(
        'INSERT INTO pages (documentId, uri, pageNumber) VALUES (?, ?, ?)',
        documentId,
        page.uri,
        page.pageNumber,
      );
    }
    return documentId;
  } catch (error) {
    console.error('Erro ao adicionar documento e páginas:', error);
    if (documentId) {
      await deleteDocument(documentId);
    }
    throw error;
  }
};

export const getDocuments = async (): Promise<Document[]> => {
  try {
    const allRows = await db.getAllAsync<Document>(
      'SELECT * FROM documents ORDER BY createdAt DESC',
    );
    return allRows;
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    throw error;
  }
};

export const getPagesForDocument = async (
  documentId: number,
): Promise<Page[]> => {
  try {
    return await db.getAllAsync<Page>(
      'SELECT * FROM pages WHERE documentId = ? ORDER BY pageNumber ASC',
      documentId,
    );
  } catch (error) {
    console.error(
      `Erro ao buscar páginas para o documento ${documentId}:`,
      error,
    );
    throw error;
  }
};

export const deleteDocument = async (id: number): Promise<void> => {
  try {
    const result = await db.runAsync('DELETE FROM documents WHERE id = ?', id);
    if (result.changes === 0) {
      console.warn('Documento não encontrado para deleção.');
    }
  } catch (error) {
    console.error('Erro ao deletar documento:', error);
    throw error;
  }
};
