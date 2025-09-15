# Guida Semplice - Come è Strutturata l'App BookYourLesson

Questa guida spiega in modo semplice come funziona l'app e dove si trova ogni cosa. È pensata per essere letta ad altri sviluppatori per far capire la struttura.

## Come è Fatta l'App Mobile (React Native)

### LoginScreen - La Schermata di Login

Nel file `LoginScreen.js` ho utilizzato questi state:
- `const [email, setEmail] = useState('')` per salvare quello che l'utente scrive nel campo email
- `const [password, setPassword] = useState('')` per la password
- `const [loading, setLoading] = useState(false)` per mostrare la rotellina quando sta caricando
- `const [showPassword, setShowPassword] = useState(false)` per decidere se far vedere la password o i puntini

Componenti React Native usati:
- `TextInput` per i campi dove scrivere email e password
- `TouchableOpacity` per il bottone "Login" - quando lo tocchi chiama la funzione `handleLogin`
- `Alert.alert()` per mostrare i messaggi di errore tipo "Password sbagliata"
- `ScrollView` per far scorrere la pagina se non ci sta tutto

### RegisterScreen - La Registrazione

Nel file `RegisterScreen.js` ho questi state:
- `const [nome, setNome] = useState('')` per il nome dell'utente
- `const [email, setEmail] = useState('')` per l'email
- `const [password, setPassword] = useState('')` per la password
- `const [confirmPassword, setConfirmPassword] = useState('')` per confermare la password

La logica è: l'utente riempie i campi, clicca "Registrati", l'app controlla che le password coincidano, poi manda tutto al server.

### HomeScreen - La Homepage

Nel file `HomeScreen.js` ho messo:
- Le informazioni sulla tutor Cristina
- La sua foto (che prendo da `me.jpeg.jpg`)
- Un bottone "Book Your Lessons" che porta alla schermata calendario
- Un bottone "My Lessons" per vedere lo storico
- Se l'utente è admin, appare anche "Admin Dashboard"

Uso il componente `Image` per mostrare la foto e `TouchableOpacity` per i bottoni.

### CalendarScreen - Il Calendario per Prenotare

Nel file `CalendarScreen.js` ho questi state importanti:
- `const [availableSlots, setAvailableSlots] = useState([])` per tutti gli orari liberi che arrivano dal server
- `const [selectedSlots, setSelectedSlots] = useState([])` per gli orari che l'utente ha selezionato
- `const [loading, setLoading] = useState(true)` per la rotellina di caricamento

Ho usato `useEffect(() => { loadAvailableSlots(); }, [])` per caricare gli orari appena si apre la schermata.

Il componente più importante qui è `WeeklyCalendar` che ho creato io - mostra la settimana con tutti gli orari divisi per giorni.

### StoricoScreen - Lo Storico Prenotazioni

Nel file `StoricoScreen.js`:
- `const [bookings, setBookings] = useState([])` per salvare tutte le prenotazioni dell'utente
- `const [loading, setLoading] = useState(true)` per il caricamento

Uso `useEffect` per caricare le prenotazioni quando si apre la schermata.

### AdminScreen - La Dashboard Admin

Nel file `AdminScreen.js`:
- `const [allBookings, setAllBookings] = useState([])` per tutte le prenotazioni di tutti gli studenti
- Posso cancellare prenotazioni usando `Alert.alert` per chiedere conferma

## Componenti Personalizzati che Ho Creato

### BackgroundWrapper
Nel file `BackgroundWrapper.js` ho fatto un componente che mette lo sfondo con la bandiera inglese dietro a tutto. 
Lo uso così: `<BackgroundWrapper> contenuto qui </BackgroundWrapper>`

### Card  
Nel file `Card.js` ho creato quei rettangoli bianchi con gli angoli arrotondati e l'ombra.
Li uso per contenere form, informazioni, liste.

### AppHeader
Nel file `AppHeader.js` ho fatto l'intestazione con il titolo "BookYourLesson" e il sottotitolo.
Lo uso così: `<AppHeader title="BookYourLesson" subtitle="Learn English with Cristina" />`

### WeeklyCalendar
Nel file `WeeklyCalendar.js` ho creato il calendario settimanale. 
Riceve come props gli orari disponibili e quando clicchi su un orario lo seleziona (diventa verde).

## Come l'App Parla col Server (api.js)

Nel file `utils/api.js` ho messo tutte le funzioni per parlare col server:

### Funzione login:
```javascript
const login = async (credentials) => {
  const response = await fetch('http://192.168.1.4:3000/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  return response.json();
};
```
Questa manda email e password al server e riceve indietro il token se è tutto ok.

### Funzione per prendere gli orari:
```javascript
const getAvailableSlots = async () => {
  const response = await fetch('http://192.168.1.4:3000/api/orari/available');
  return response.json();
};
```
Questa chiede al server tutti gli orari liberi.

### Sistema automatico per trovare il server:
Ho fatto un sistema che prova diversi indirizzi IP finché trova quello giusto, così funziona sia sul telefono che sull'emulatore.

## Come è Fatto il Server (Backend)

### File Principale - index.js

Nel file `backend/index.js` ho:
- `const app = express()` per creare il server
- `app.use(express.json())` per capire i dati JSON che arrivano dall'app
- `app.use(cors())` per permettere all'app di chiamare il server
- `app.listen(3000, '0.0.0.0')` per far partire il server sulla porta 3000

### Connessione Database - db.js

Nel file `backend/db.js`:
```javascript
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bookyourlesson'
});
```
Questo dice al server come collegarsi al database MySQL.

### Route di Autenticazione - auth.js

Nel file `backend/routes/auth.js` ho fatto:

**Per il login:**
- Ricevo email e password dall'app
- Cerco l'utente nel database: `SELECT * FROM utenti WHERE email = ?`
- Controllo la password con bcrypt
- Se è giusta, creo un token JWT e lo mando all'app

**Per la registrazione:**
- Ricevo nome, email e password
- Cripto la password con bcrypt
- Salvo tutto nel database: `INSERT INTO utenti (nome, email, password) VALUES (?, ?, ?)`

### Route Prenotazioni - prenotazioni.js

Nel file `backend/routes/prenotazioni.js`:

**Per creare una prenotazione:**
- Ricevo userId, data e orario dall'app
- Controllo che lo slot sia libero
- Salvo nel database: `INSERT INTO prenotazioni (id_utente, data, orario, costo) VALUES (?, ?, ?, 10.00)`

**Per vedere le prenotazioni utente:**
- Uso una query con JOIN per unire utenti e prenotazioni:
```sql
SELECT p.*, u.nome 
FROM prenotazioni p 
JOIN utenti u ON p.id_utente = u.id 
WHERE p.id_utente = ?
```

**Per l'admin (tutte le prenotazioni):**
- Query più complessa che prende tutto e calcola statistiche

### Route Orari - orari.js

Nel file `backend/routes/orari.js`:
- `GET /available` restituisce tutti gli orari liberi dal database
- Uso `SELECT * FROM orari_disponibili WHERE disponibile = true`

## Come Funziona il Database

### Tabella utenti
```sql
CREATE TABLE utenti (
  id INT PRIMARY KEY,
  nome VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  ruolo ENUM('utente', 'admin')
);
```
Qui salvo tutti gli account - studenti e admin. Le password sono criptate con bcrypt.

### Tabella prenotazioni
```sql
CREATE TABLE prenotazioni (
  id INT PRIMARY KEY,
  id_utente INT,
  data DATE,
  orario TIME,
  stato ENUM('confermata', 'cancellata'),
  costo DECIMAL(5,2)
);
```
Ogni riga è una lezione prenotata. `id_utente` collega alla tabella utenti.

### Tabella orari_disponibili
```sql
CREATE TABLE orari_disponibili (
  id INT PRIMARY KEY,
  data DATE,
  orario TIME,
  disponibile BOOLEAN
);
```
Qui ci sono tutti gli slot quando Cristina è libera.

## Come Funziona Tutto Insieme - Esempio Pratico

**Quando uno studente vuole prenotare:**

1. **CalendarScreen** si apre e chiama `loadAvailableSlots()`
2. **api.js** manda `fetch()` a `http://server:3000/api/orari/available`
3. **backend/routes/orari.js** riceve la richiesta
4. **orari.js** fa la query `SELECT * FROM orari_disponibili WHERE disponibile = true`
5. **MySQL** restituisce gli orari liberi
6. **orari.js** manda i dati in JSON all'app
7. **CalendarScreen** riceve i dati e li mette in `setAvailableSlots()`
8. **WeeklyCalendar** mostra gli orari nel calendario
9. **Utente** clicca su un orario → diventa verde (selezionato)
10. **Utente** clicca "Book Selected Slots"
11. **App** manda `fetch()` a `/api/prenotazioni/` con i dati
12. **backend** salva nel database e conferma
13. **App** mostra "Prenotazione riuscita!"

## Sicurezza 

**Password:** Uso bcrypt per criptarle - anche se rubano il database non possono vederle.

**Token:** Dopo il login creo un JWT che dura 24 ore - è come un biglietto che prova che hai fatto login.

**SQL Injection:** Uso sempre i `?` nelle query invece di concatenare stringhe.

## File di Configurazione

**package.json (mobile):** Qui ci sono tutte le librerie React Native che ho installato.

**package.json (backend):** Qui ci sono express, mysql2, bcrypt, jsonwebtoken, ecc.

**.env (backend):** Le password del database e le chiavi segrete stanno qui.

**bookyourlesson.sql:** Lo script per creare tutte le tabelle del database.

Questa è la struttura base dell'app - un'app mobile che parla con un server, che parla con un database. Semplice ma funzionale!