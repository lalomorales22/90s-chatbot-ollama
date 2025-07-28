const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class Database {
  constructor() {
    this.db = new sqlite3.Database('./sup_chat.db', (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('💾 Connected to SQLite database');
        this.initTables();
      }
    });
  }

  initTables() {
    // Create chats table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create messages table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        sender TEXT NOT NULL,
        content TEXT NOT NULL,
        font_style TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE
      )
    `);

    console.log('📊 Database tables initialized');
  }

  // Chat management
  createChat(name = 'New Chat') {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      this.db.run(
        'INSERT INTO chats (id, name) VALUES (?, ?)',
        [id, name],
        function(err) {
          if (err) reject(err);
          else resolve({ id, name, created_at: new Date().toISOString() });
        }
      );
    });
  }

  getAllChats() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM chats ORDER BY updated_at DESC',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  updateChatName(chatId, newName) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE chats SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newName, chatId],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  deleteChat(chatId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM chats WHERE id = ?',
        [chatId],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  // Message management
  saveMessage(chatId, sender, content, fontStyle = null) {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      this.db.run(
        'INSERT INTO messages (id, chat_id, sender, content, font_style) VALUES (?, ?, ?, ?, ?)',
        [id, chatId, sender, content, JSON.stringify(fontStyle)],
        function(err) {
          if (err) reject(err);
          else {
            // Update chat's updated_at timestamp
            db.updateChatTimestamp(chatId);
            resolve({ id, chat_id: chatId, sender, content, font_style: fontStyle });
          }
        }
      );
    });
  }

  getChatMessages(chatId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC',
        [chatId],
        (err, rows) => {
          if (err) reject(err);
          else {
            // Parse font_style JSON back to object
            const messages = rows.map(row => ({
              ...row,
              font_style: row.font_style ? JSON.parse(row.font_style) : null
            }));
            resolve(messages);
          }
        }
      );
    });
  }

  updateChatTimestamp(chatId) {
    this.db.run(
      'UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [chatId]
    );
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

// Export singleton instance
const db = new Database();
module.exports = db;