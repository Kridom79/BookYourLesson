# 📚 BookYourLesson - English Lesson Booking App

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)

*Un'applicazione completa per la gestione e prenotazione di lezioni di inglese private*

</div>

## 🎯 Panoramica

**BookYourLesson** è un sistema completo che permette la gestione completa delle prenotazioni per lezioni di inglese private. L'app offre un'interfaccia intuitiva per studenti e funzionalità amministrative complete per i tutor.

### ✨ Caratteristiche Principali

**Per gli Studenti:**
- 🔐 Registrazione e login sicuro
- 📅 Prenotazione lezioni in tempo reale
- 📊 Visualizzazione storico prenotazioni
- 👩‍🏫 Informazioni dettagliate sulla tutor

**Per l'Amministratore:**
- 🎛️ Dashboard completa con tutte le prenotazioni
- ⚙️ Gestione e cancellazione prenotazioni
- 📈 Visualizzazione statistiche studenti
- 🕐 Gestione orari disponibili

## 🏗️ Architettura Tecnica

```
┌─────────────────┐    HTTP/JSON    ┌──────────────────┐    SQL    ┌─────────────┐
│   React Native  │ ←──────────────→ │  Node.js + Express │ ←────────→ │    MySQL    │
│   Mobile App    │                 │     Backend        │           │  Database   │
└─────────────────┘                 └──────────────────┘           └─────────────┘
```

### 🛠️ Stack Tecnologico

**Frontend (Mobile)**
- **React Native** con Expo
- **JavaScript ES6+**
- **React Hooks** (useState, useEffect)
- **React Navigation** per navigazione
- **Fetch API** per comunicazioni HTTP

**Backend**
- **Node.js** runtime
- **Express.js** framework web
- **MySQL** database relazionale
- **RESTful API** architecture

**Database**
- **4 tabelle principali:**
  - `utenti` - Studenti e amministratori
  - `prenotazioni` - Lezioni prenotate
  - `orari_disponibili` - Slot temporali
  - `settimane_disponibili` - Settimane attive
## 🚀 Setup e Installazione

### Prerequisiti
- Node.js (v14 o superiore)
- XAMPP o server MySQL
- Expo CLI per React Native
- Git

### 1️⃣ Clona il Repository
```bash
git clone https://github.com/TUO_USERNAME/BookYourLesson.git
cd BookYourLesson
```

### 2️⃣ Setup Database
1. Avvia XAMPP e MySQL
2. Importa il file `bookyourlesson.sql` nel tuo database MySQL
3. Configura le credenziali nel file `.env` del backend

### 3️⃣ Setup Backend
```bash
cd backend
npm install
node index.js
```

### 4️⃣ Setup Mobile App
```bash
cd mobile
npm install
npx expo start
```

### 5️⃣ Testa l'Applicazione
- Scansiona il codice QR con l'app **Expo Go**
- L'app si connetterà automaticamente al backend

## 🔐 Credenziali di Test

### Amministratore
- **Email:** admin@bookyourlesson.com
- **Password:** admin123

### Utente Test
- **Email:** mariac@gmail.com
- **Password:** Mcri123

## 📱 Screenshot e Demo

*Aggiungi qui screenshot dell'app quando sarà disponibile*

## 📖 Documentazione Completa

- [`DOCUMENTAZIONE_DETTAGLIATA.md`](./DOCUMENTAZIONE_DETTAGLIATA.md) - Guida tecnica completa
- [`GUIDA_TECNICA_DETTAGLIATA.md`](./GUIDA_TECNICA_DETTAGLIATA.md) - Implementazione e architettura
- [`ADMIN_CREDENTIALS.md`](./ADMIN_CREDENTIALS.md) - Credenziali e accessi

## 🤝 Contribuire

1. Fai fork del progetto
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Committa le tue modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Pusha al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi `LICENSE` per maggiori dettagli.

## 👩‍💻 Autore

**Maria Cristina** - [GitHub Profile](https://github.com/TUO_USERNAME)

---

<div align="center">
Made with ❤️ and ☕ by Maria Cristina
</div>