// backend/create-admin.js
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
require('dotenv').config();

console.log('🛡️ Creazione Account Admin per BookYourLesson');
console.log('================================================');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bookyourlesson',
  port: process.env.DB_PORT || 3306
});

// Dati admin da creare
const adminData = {
  nome: 'Cristina Admin',
  email: 'admin@bookyourlesson.com',
  password: 'admin123',  // Password temporanea - cambiarla dopo il primo login
  ruolo: 'admin'
};

async function createAdminAccount() {
  try {
    // Connessione al database
    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) {
          console.error('❌ Errore connessione database:', err.message);
          reject(err);
        } else {
          console.log('✅ Connesso al database MySQL');
          resolve();
        }
      });
    });

    // Verifica se l'admin esiste già
    const checkExistingAdmin = new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM utenti WHERE email = ? OR ruolo = ?',
        [adminData.email, 'admin'],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });

    const existingUsers = await checkExistingAdmin;
    
    if (existingUsers.length > 0) {
      console.log('⚠️ Account admin già esistente:');
      existingUsers.forEach(user => {
        console.log(`   - ID: ${user.id}, Nome: ${user.nome}, Email: ${user.email}, Ruolo: ${user.ruolo || 'student'}`);
      });
      
      // Aggiorna il ruolo dell'utente esistente se non è già admin
      const userToUpdate = existingUsers.find(u => u.email === adminData.email);
      if (userToUpdate && userToUpdate.ruolo !== 'admin') {
        await new Promise((resolve, reject) => {
          connection.query(
            'UPDATE utenti SET ruolo = ? WHERE id = ?',
            ['admin', userToUpdate.id],
            (err, results) => {
              if (err) reject(err);
              else resolve(results);
            }
          );
        });
        console.log(`✅ Ruolo aggiornato ad admin per l'utente: ${userToUpdate.nome}`);
      }
    } else {
      // Crea nuovo account admin
      console.log('🔧 Creazione nuovo account admin...');
      
      // Hash della password
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      
      const insertAdmin = new Promise((resolve, reject) => {
        connection.query(
          'INSERT INTO utenti (nome, email, password, ruolo) VALUES (?, ?, ?, ?)',
          [adminData.nome, adminData.email, hashedPassword, adminData.ruolo],
          (err, results) => {
            if (err) reject(err);
            else resolve(results);
          }
        );
      });

      const result = await insertAdmin;
      console.log('✅ Account admin creato con successo!');
      console.log(`   - ID: ${result.insertId}`);
      console.log(`   - Nome: ${adminData.nome}`);
      console.log(`   - Email: ${adminData.email}`);
      console.log(`   - Password: ${adminData.password} (TEMPORANEA - cambiarla!)`);
      console.log(`   - Ruolo: ${adminData.ruolo}`);
    }

    // Verifica finale
    const finalCheck = new Promise((resolve, reject) => {
      connection.query(
        'SELECT id, nome, email, ruolo FROM utenti WHERE ruolo = ?',
        ['admin'],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });

    const adminUsers = await finalCheck;
    console.log('\n📊 Tutti gli account admin nel sistema:');
    adminUsers.forEach(admin => {
      console.log(`   - ${admin.nome} (${admin.email}) - ID: ${admin.id}`);
    });

    console.log('\n🎉 OPERAZIONE COMPLETATA!');
    console.log('\n📱 Per accedere come admin nell\'app:');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: ${adminData.password}`);
    console.log('\n⚠️ IMPORTANTE: Cambia la password dopo il primo login per sicurezza!');

  } catch (error) {
    console.error('❌ Errore durante la creazione dell\'account admin:', error.message);
  } finally {
    // Chiudi connessione
    connection.end((err) => {
      if (err) {
        console.error('❌ Errore chiusura connessione:', err.message);
      } else {
        console.log('\n✅ Connessione database chiusa');
      }
      process.exit(0);
    });
  }
}

// Avvia la creazione dell'account admin
createAdminAccount();
