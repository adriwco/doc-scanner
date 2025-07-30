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

/**
 * Inicializa o banco de dados.
 * Usa execAsync para rodar o comando CREATE TABLE.
 */
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
    `);
    console.log('Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
    throw error;
  }
};

/**
 * Adiciona um novo documento.
 * Usa runAsync para inserir dados e retorna o ID do novo registro.
 */
export const addDocument = async (
  doc: Omit<Document, 'id'>,
): Promise<number> => {
  try {
    const result = await db.runAsync(
      'INSERT INTO documents (name, createdAt, totalPages, coverUri) VALUES (?, ?, ?, ?)',
      doc.name,
      doc.createdAt,
      doc.totalPages,
      doc.coverUri,
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Erro ao adicionar documento:', error);
    throw error;
  }
};

/**
 * Obtém todos os documentos.
 * Usa getAllAsync para buscar todos os registros. O tipo de retorno já é um array de objetos.
 */
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

/**
 * Atualiza um documento.
 * Usa runAsync para a operação de UPDATE.
 */
export const updateDocument = async (doc: Document): Promise<void> => {
  try {
    const result = await db.runAsync(
      'UPDATE documents SET name = ?, totalPages = ?, coverUri = ? WHERE id = ?',
      doc.name,
      doc.totalPages,
      doc.coverUri,
      doc.id,
    );
    if (result.changes === 0) {
      throw new Error('Documento não encontrado para atualização.');
    }
  } catch (error) {
    console.error('Erro ao atualizar documento:', error);
    throw error;
  }
};

/**
 * Remove um documento.
 * Usa runAsync para a operação de DELETE.
 */
export const deleteDocument = async (id: number): Promise<void> => {
  try {
    const result = await db.runAsync('DELETE FROM documents WHERE id = ?', id);
    if (result.changes === 0) {
      throw new Error('Documento não encontrado para deleção.');
    }
  } catch (error) {
    console.error('Erro ao deletar documento:', error);
    throw error;
  }
};
