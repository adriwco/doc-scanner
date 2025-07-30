import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

export interface Document {
  id: number;
  name: string;
  createdAt: string;
  totalPages: number;
  coverUri: string;
}

interface CustomSQLResultSet {
  insertId?: number;
  rowsAffected: number;
  rows: {
    _array: any[];
    length: number;
    item: (index: number) => any;
  };
}

interface CustomSQLTransaction {
  executeSql: (
    sqlStatement: string,
    args?: (string | number | null)[],
    callback?: (
      tx: CustomSQLTransaction,
      resultSet: CustomSQLResultSet,
    ) => void,
    errorCallback?: (tx: CustomSQLTransaction, error: any) => boolean,
  ) => void;
}

interface CustomSQLiteDatabase {
  transaction: (
    callback: (tx: CustomSQLTransaction) => void,
    errorCallback?: (error: any) => void,
    successCallback?: () => void,
  ) => void;
  closeAsync?: () => Promise<void>;
  exec?: (
    queries: { sql: string; args?: any[] }[],
    readOnly: boolean,
    callback: any,
  ) => void;
}

function openDatabase(): CustomSQLiteDatabase {
  if (Platform.OS === 'web') {
    console.warn('Expo SQLite não é suportado na web, usando um mock.');

    const mockDb: CustomSQLiteDatabase = {
      transaction: (callback, errorCallback, successCallback) => {
        try {
          const tx: CustomSQLTransaction = {
            executeSql: (sql, args, success, error) => {
              if (success) {
                const mockResult: CustomSQLResultSet = {
                  insertId: 1,
                  rowsAffected: 1,
                  rows: {
                    _array: [],
                    length: 0,
                    item: () => null,
                  },
                };
                success(tx, mockResult);
              }
            },
          };
          callback(tx);
          successCallback?.();
        } catch (e) {
          errorCallback?.(e);
        }
      },
      closeAsync: () => Promise.resolve(),
      exec: (queries, readOnly, callback) => {
        callback(
          {},
          {
            rowsAffected: 0,
            rows: { _array: [], length: 0, item: () => null },
          },
        );
      },
    };

    return mockDb;
  }

  // Fazemos um cast seguro para nosso tipo personalizado
  const db = SQLite.openDatabaseSync('doc-scanner.db');
  return db as unknown as CustomSQLiteDatabase;
}

const db = openDatabase();

/**
 * Inicializa o banco de dados
 */
export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      db.transaction(
        (tx) => {
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS documents (
              id INTEGER PRIMARY KEY NOT NULL,
              name TEXT NOT NULL,
              createdAt TEXT NOT NULL,
              totalPages INTEGER NOT NULL,
              coverUri TEXT
            );`,
          );
        },
        (error) => {
          console.error('Erro ao inicializar o banco de dados:', error);
          reject(error);
        },
        () => {
          console.log('Banco de dados inicializado com sucesso');
          resolve();
        },
      );
    } catch (error) {
      console.error('Erro ao tentar iniciar transação:', error);
      reject(error);
    }
  });
};

/**
 * Adiciona um novo documento
 */
export const addDocument = (doc: Omit<Document, 'id'>): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO documents (name, createdAt, totalPages, coverUri) 
           VALUES (?, ?, ?, ?)`,
          [doc.name, doc.createdAt, doc.totalPages, doc.coverUri],
          (_, resultSet) => {
            if (resultSet.insertId) {
              resolve(resultSet.insertId);
            } else {
              reject(new Error('Falha ao inserir documento'));
            }
          },
          (_, error) => {
            reject(error);
            return false;
          },
        );
      },
      (error) => reject(error),
    );
  });
};

/**
 * Obtém todos os documentos
 */
export const getDocuments = (): Promise<Document[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM documents ORDER BY createdAt DESC',
          [],
          (_, resultSet) => {
            resolve(resultSet.rows._array as Document[]);
          },
          (_, error) => {
            reject(error);
            return false;
          },
        );
      },
      (error) => reject(error),
    );
  });
};

/**
 * Atualiza um documento
 */
export const updateDocument = (doc: Document): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `UPDATE documents 
           SET name = ?, totalPages = ?, coverUri = ?
           WHERE id = ?`,
          [doc.name, doc.totalPages, doc.coverUri, doc.id],
          (_, resultSet) => {
            if (resultSet.rowsAffected > 0) {
              resolve();
            } else {
              reject(new Error('Documento não encontrado'));
            }
          },
          (_, error) => {
            reject(error);
            return false;
          },
        );
      },
      (error) => reject(error),
    );
  });
};

/**
 * Remove um documento
 */
export const deleteDocument = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'DELETE FROM documents WHERE id = ?',
          [id],
          (_, resultSet) => {
            if (resultSet.rowsAffected > 0) {
              resolve();
            } else {
              reject(new Error('Documento não encontrado'));
            }
          },
          (_, error) => {
            reject(error);
            return false;
          },
        );
      },
      (error) => reject(error),
    );
  });
};

export default db;
