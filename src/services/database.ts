// src/services/database.ts
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

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
  textContent: string;
}

function openDatabase(): SQLite.SQLiteDatabase {
  if (Platform.OS === 'web') {
    console.warn('Expo SQLite não é suportado na web, usando um mock.');
    return {
      execAsync: async () => [],
      runAsync: async () => ({ lastInsertRowId: 1, changes: 1 }),
      getFirstAsync: async () => null,
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
        textContent TEXT,
        FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE
      );
    `);

    const columns = await db.getAllAsync<{ name: string }>(
      `PRAGMA table_info(pages)`,
    );
    const hasTextContentColumn = columns.some(
      (column) => column.name === 'textContent',
    );

    if (!hasTextContentColumn) {
      console.log(
        "Migrando o banco de dados: Adicionando a coluna 'textContent' à tabela 'pages'.",
      );
      await db.execAsync('ALTER TABLE pages ADD COLUMN textContent TEXT;');
    }

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
        'INSERT INTO pages (documentId, uri, pageNumber, textContent) VALUES (?, ?, ?, ?)',
        documentId,
        page.uri,
        page.pageNumber,
        page.textContent,
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

export const updateDocumentName = async (
  id: number,
  name: string,
): Promise<void> => {
  try {
    await db.runAsync('UPDATE documents SET name = ? WHERE id = ?', name, id);
  } catch (error) {
    console.error(`Erro ao atualizar o nome do documento ${id}:`, error);
    throw error;
  }
};

export const getDocuments = async (): Promise<Document[]> => {
  try {
    return await db.getAllAsync<Document>(
      'SELECT * FROM documents ORDER BY createdAt DESC',
    );
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    throw error;
  }
};

export const searchDocumentsByText = async (
  query: string,
): Promise<Document[]> => {
  if (!query) return getDocuments();
  try {
    const searchPattern = `%${query}%`;
    return await db.getAllAsync<Document>(
      `SELECT DISTINCT d.*
       FROM documents d
       JOIN pages p ON d.id = p.documentId
       WHERE p.textContent LIKE ? OR d.name LIKE ?
       ORDER BY d.createdAt DESC`,
      searchPattern,
      searchPattern,
    );
  } catch (error) {
    console.error('Erro ao buscar documentos por texto:', error);
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
    const docToDelete = await db.getFirstAsync<Document>(
      'SELECT * FROM documents WHERE id = ?',
      id,
    );

    const result = await db.runAsync('DELETE FROM documents WHERE id = ?', id);

    if (result.changes > 0 && docToDelete?.coverUri) {
      const docDir = docToDelete.coverUri.substring(
        0,
        docToDelete.coverUri.lastIndexOf('/'),
      );
      await FileSystem.deleteAsync(docDir, { idempotent: true });
      console.log(`Pasta do documento ${id} deletada: ${docDir}`);
    } else if (result.changes > 0) {
      console.log(
        `Documento ${id} deletado do banco de dados, mas sem URI de capa para limpar.`,
      );
    } else {
      console.warn('Documento não encontrado para deleção.');
    }
  } catch (error) {
    console.error('Erro ao deletar documento:', error);
    throw error;
  }
};
