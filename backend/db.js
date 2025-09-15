// backend/db.js
const mysql = require('mysql2');
require('dotenv').config();

console.log('🔧 Configurazione Database:');
console.log('Host:', process.env.DB_HOST);
console.log('User:', process.env.DB_USER);
console.log('Database:', process.env.DB_NAME);

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bookyourlesson',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  timezone: '+00:00',
  dateStrings: true // Per gestire meglio le date
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Errore connessione database:', err.message);
    console.error('Codice errore:', err.code);
    
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('🚨 SOLUZIONE: Verifica username/password nel file .env');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('🚨 SOLUZIONE: Verifica che XAMPP/MySQL sia avviato');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('🚨 SOLUZIONE: Verifica che il database "bookyourlesson" esista in phpMyAdmin');
    }
    
    // Non esce dal processo, continua per permettere al server di avviarsi
    console.error('⚠️ Continuando senza database...');
    return;
  }
  
  console.log('✅ Connesso al database MySQL con successo!');
  console.log('📊 Database:', process.env.DB_NAME);
  
  // Test rapido per verificare le tabelle
  connection.query('SHOW TABLES', (err, results) => {
    if (err) {
      console.error('❌ Errore nel leggere le tabelle:', err.message);
    } else {
      console.log('📋 Tabelle trovate:', results.length);
      results.forEach(table => {
        console.log('  - ' + Object.values(table)[0]);
      });
    }
  });
});

// Gestione graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Chiusura connessione database...');
  connection.end((err) => {
    if (err) {
      console.error('❌ Errore nella chiusura:', err.message);
    } else {
      console.log('✅ Connessione database chiusa correttamente');
    }
    process.exit(0);
  });
});

module.exports = connection;