# 📖 BookYourLesson - Documentazione Dettagliata per Sviluppatori

Una guida completa per capire come funziona l'app di prenotazione lezioni di inglese.

## 🎯 Panoramica dell'Applicazione

**BookYourLesson** è un sistema completo per gestire prenotazioni di lezioni private di inglese. È composto da:

1. **App Mobile** (React Native) - Interface utente per studenti e admin
2. **Backend Server** (Node.js + Express) - Logica di business e API
3. **Database MySQL** - Memorizzazione dati persistente

## 🏗️ Architettura del Sistema

```
[App Mobile] ←→ HTTP/JSON ←→ [Backend Server] ←→ SQL ←→ [Database MySQL]
```

### Come Comunicano i Componenti

1. **App Mobile** invia richieste HTTP (GET, POST) al backend
2. **Backend** processa le richieste, interroga il database
3. **Database** restituisce i dati al backend
4. **Backend** risponde all'app con dati JSON

## 📱 Frontend - App Mobile (React Native)

### Struttura delle Cartelle

```
mobile/
├── App.js                    # Punto d'ingresso principale
├── screens/                  # Tutte le schermate dell'app
│   ├── LoginScreen.js       # Schermata login
│   ├── RegisterScreen.js    # Registrazione utenti
│   ├── HomeScreen.js        # Homepage con info tutor
│   ├── CalendarScreen.js    # Prenotazione lezioni
│   ├── StoricoScreen.js     # Storico prenotazioni utente
│   └── AdminScreen.js       # Dashboard amministratore
├── components/               # Componenti riutilizzabili
│   ├── BackgroundWrapper.js # Sfondo con bandiera inglese
│   ├── Card.js              # Container per contenuti
│   ├── AppHeader.js         # Intestazione app
│   └── WeeklyCalendar.js    # Calendario settimanale
└── utils/
    └── api.js               # Funzioni per chiamate API
```

### Come Funziona la Comunicazione API

**File: `mobile/utils/api.js`**
```javascript
// Esempio di come l'app chiama il backend
const login = async (credentials) => {
  const response = await fetch('http://192.168.1.4:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials)
  });
  return response.json();
};
```

**Cosa succede:**
1. L'app usa `fetch()` (JavaScript) per inviare dati al server
2. Specifica il metodo HTTP (POST per inviare, GET per ricevere)
3. Invia dati in formato JSON
4. Riceve risposta dal server in formato JSON

### Gestione degli Stati (State Management)

**Esempio da LoginScreen.js:**
```javascript
const [email, setEmail] = useState('');     // Salva email digitata
const [password, setPassword] = useState(''); // Salva password
const [loading, setLoading] = useState(false); // Mostra spinner caricamento
```

**React Hooks utilizzati:**
- `useState()` - Per memorizzare dati temporanei (input, stato loading)
- `useEffect()` - Per eseguire azioni quando la schermata si carica

### Navigazione tra Schermate

L'app usa **React Navigation** per passare da una schermata all'altra:
```javascript
// Da LoginScreen a HomeScreen dopo login riuscito
navigation.navigate('Home', { user: userData });
```

## 🖥️ Backend - Server (Node.js + Express)

### Struttura delle Cartelle

```
backend/
├── index.js                 # Server principale
├── db.js                   # Connessione al database
├── .env                    # Variabili di configurazione
├── create-admin.js         # Script per creare admin
├── package.json            # Dipendenze Node.js
└── routes/                 # Endpoint API divisi per funzionalità
    ├── auth.js            # Login e registrazione
    ├── prenotazioni.js    # Gestione prenotazioni
    ├── orari.js           # Orari disponibili
    └── calendar.js        # Calendario lezioni
```

### Come Funziona il Server (index.js)

```javascript
const express = require('express');
const app = express();

// Middleware per accettare JSON dalle richieste
app.use(express.json());

// Middleware per permettere richieste da altri domini
app.use(cors());

// Carica le route per l'autenticazione
app.use('/api/auth', require('./routes/auth'));

// Avvia il server sulla porta 3000
app.listen(3000);
```

**Spiegazione:**
1. **Express** è un framework che semplifica la creazione di server web
2. **Middleware** sono funzioni che processano le richieste prima che arrivino alle route
3. **Routes** definiscono cosa fare per ogni URL (endpoint)

### Sistema di Autenticazione

**File: `backend/routes/auth.js`**

#### Login Process
```javascript
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // 1. Cerca utente nel database
  db.query('SELECT * FROM utenti WHERE email = ?', [email], (err, results) => {
    
    // 2. Verifica password con bcrypt
    bcrypt.compare(password, user.password, (compareErr, isValid) => {
      
      // 3. Se valida, crea token JWT
      const token = jwt.sign({ userId: user.id }, 'secret-key');
      
      // 4. Invia token all'app
      res.json({ token, user });
    });
  });
});
```

**Cosa succede:**
1. **bcrypt** cripta le password per sicurezza
2. **JWT** crea un "token" (chiave digitale) che prova che l'utente è autenticato
3. L'app salva questo token e lo invia con ogni richiesta successiva

### Gestione Database

**File: `backend/db.js`**
```javascript
const mysql = require('mysql2');

// Crea connessione al database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bookyourlesson'
});
```

### Esempi di Query SQL

**Registrazione nuovo utente:**
```sql
INSERT INTO utenti (nome, email, password) 
VALUES ('Mario Rossi', 'mario@email.com', '$2b$10$hashed_password')
```

**Recupero prenotazioni utente:**
```sql
SELECT p.*, u.nome 
FROM prenotazioni p 
JOIN utenti u ON p.id_utente = u.id 
WHERE p.id_utente = 5
ORDER BY p.data DESC
```

## 🗄️ Database MySQL - Struttura Dati

### Tabelle Principali

#### 1. Tabella `utenti`
```sql
CREATE TABLE utenti (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  ruolo ENUM('utente', 'admin') DEFAULT 'utente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Memorizza:** Account studenti e amministratori

#### 2. Tabella `prenotazioni`  
```sql
CREATE TABLE prenotazioni (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_utente INT,
  data DATE NOT NULL,
  orario TIME NOT NULL,
  stato ENUM('confermata', 'cancellata') DEFAULT 'confermata',
  costo DECIMAL(5,2) DEFAULT 10.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_utente) REFERENCES utenti(id)
);
```
**Memorizza:** Lezioni prenotate dagli studenti

#### 3. Tabella `orari_disponibili`
```sql
CREATE TABLE orari_disponibili (
  id INT PRIMARY KEY AUTO_INCREMENT,
  data DATE NOT NULL,
  orario TIME NOT NULL,
  disponibile BOOLEAN DEFAULT TRUE
);
```
**Memorizza:** Slot temporali quando Cristina è disponibile

### Come i Dati si Collegano (Relazioni)

```
utenti.id ←→ prenotazioni.id_utente
```
- Un utente può avere molte prenotazioni
- Ogni prenotazione appartiene a un solo utente

## 🔄 Flusso Completo dell'Applicazione

### Scenario: Studente prenota una lezione

1. **App Mobile**: Utente apre CalendarScreen
2. **App → Backend**: GET `/api/orari/available` (chiede orari liberi)
3. **Backend → Database**: `SELECT * FROM orari_disponibili WHERE disponibile = true`
4. **Database → Backend**: Restituisce lista orari
5. **Backend → App**: JSON con orari disponibili
6. **App**: Mostra calendario con slot liberi
7. **Utente**: Clicca su un orario per prenotare
8. **App → Backend**: POST `/api/prenotazioni/` (crea prenotazione)
9. **Backend → Database**: `INSERT INTO prenotazioni ...`
10. **Database**: Salva la prenotazione
11. **Backend → App**: Conferma prenotazione riuscita
12. **App**: Mostra messaggio di successo

### Scenario: Admin vede dashboard

1. **App**: Admin fa login con credenziali speciali
2. **Backend**: Verifica ruolo = 'admin' nel database
3. **App → Backend**: GET `/api/prenotazioni/all` (tutte le prenotazioni)
4. **Backend → Database**: Query complessa con JOIN per collegare utenti e prenotazioni
5. **App**: Mostra dashboard con statistiche e lista completa

## 🛡️ Sicurezza

### Password
- **bcrypt**: Cripta le password prima di salvarle
- Nessuno può vedere la password originale, nemmeno nel database

### Autenticazione
- **JWT Token**: Come un "biglietto d'ingresso" digitale
- L'app deve inviare il token con ogni richiesta protetta
- Il server verifica il token prima di permettere l'accesso

### Prevenzione Attacchi
- **SQL Injection**: Usa parametri preparati (`?`) nelle query
- **CORS**: Controlla quali siti possono chiamare le API
- **Validazione Input**: Controlla che i dati ricevuti siano corretti

## 🚨 Gestione Errori

### Nel Frontend
```javascript
try {
  const response = await api.login(credentials);
  // Login riuscito
} catch (error) {
  // Mostra errore all'utente
  Alert.alert('Errore', 'Login fallito');
}
```

### Nel Backend
```javascript
db.query('SELECT ...', (err, results) => {
  if (err) {
    console.error('Errore database:', err);
    return res.status(500).json({ error: 'Database error' });
  }
  // Query riuscita
});
```

## 🔧 Configurazione e Deploy

### Variabili di Ambiente (.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=bookyourlesson
JWT_SECRET=chiave_segreta
PORT=3000
```

### Per Sviluppatori Principianti

**Per modificare l'app:**
1. **Frontend**: Modifica i file in `mobile/screens/` per cambiare l'aspetto
2. **Backend**: Modifica i file in `backend/routes/` per cambiare la logica
3. **Database**: Modifica `bookyourlesson.sql` per cambiare la struttura dati

**Per aggiungere nuove funzionalità:**
1. Crea nuova schermata in `mobile/screens/`
2. Aggiungi nuova route in `backend/routes/`
3. Modifica il database se serve
4. Collega frontend e backend con fetch()

---

**Questa documentazione copre tutti gli aspetti tecnici dell'app BookYourLesson! 📚**