# 🔐 CREDENZIALI ADMIN - BookYourLesson

## 👑 Account Amministratore Disponibili

### Admin #1 (Principale)
- **Email**: `admin@bookyourlesson.com`
- **Password**: `admin123`
- **Nome**: Cristina Admin
- **Stato**: ✅ Attivo

### Admin #2 (Backup)
- **Email**: `cristina@bookyourlesson.com`
- **Password**: [password personalizzata]
- **Nome**: Cristina Tutor
- **Stato**: ✅ Attivo

## 🛡️ Funzionalità Dashboard Admin

### Accesso
1. Apri l'app BookYourLesson
2. Nella schermata di login, inserisci le credenziali admin
3. Dopo il login, vedrai un badge "👑 ADMIN" sotto il nome
4. Clicca su "🛡️ Admin Dashboard" per accedere

### Funzionalità Disponibili

**📊 Statistiche in Tempo Reale:**
- Totale prenotazioni nel sistema
- Prenotazioni confermate
- Prenotazioni cancellate
- Prenotazioni future programmate

**📅 Calendario Completo:**
- Vista di tutte le lezioni prenotate
- Filtri per tipo: Tutte / Future / Passate
- Informazioni dettagliate per ogni prenotazione

**👥 Gestione Studenti:**
- Lista completa degli utenti registrati
- Dati di contatto (nome, email)
- Storico prenotazioni per studente

**⚙️ Azioni Amministrative:**
- Cancellazione prenotazioni studenti
- Refresh automatico dei dati
- Conferma prima di cancellazioni

## 🖥️ Gestione Database

### Script Disponibili
```bash
# Naviga nella cartella backend
cd backend

# Verifica account admin esistenti
node check-admin.js

# Crea nuovo account admin
node create-admin.js
```

### Accesso Diretto Database
- **URL**: http://localhost/phpmyadmin/index.php?route=/database/structure&db=bookyourlesson
- **Database**: `bookyourlesson`
- **Tabella utenti**: Colonna `ruolo` = 'admin'

## 🔄 Reset Password Admin

Se devi cambiare la password dell'admin:

### Opzione 1: Via Database (phpMyAdmin)
1. Vai su http://localhost/phpmyadmin
2. Seleziona database `bookyourlesson`
3. Apri tabella `utenti`
4. Trova l'admin (email: admin@bookyourlesson.com)
5. Modifica la password (deve essere hashata con bcrypt)

### Opzione 2: Via Script
```bash
cd backend
node create-admin.js
# Lo script aggiornerà automaticamente la password
```

## ⚠️ Note di Sicurezza

1. **Cambia la password predefinita** `admin123` dopo il primo accesso
2. **Non condividere** le credenziali admin
3. **Tieni al sicuro** l'accesso al database
4. **Verifica regolarmente** gli accessi admin nei log

## 🚨 Risoluzione Problemi

### Admin non compare nell'app
1. Verifica che il ruolo sia 'admin' nel database
2. Fai logout e login di nuovo
3. Controlla che il backend sia connesso al database

### Dashboard admin non si carica
1. Verifica connessione database
2. Controlla che l'API `/api/prenotazioni/all` funzioni
3. Riavvia il server backend se necessario

### Password non funziona
1. Usa `admin123` per l'account principale
2. Esegui `node check-admin.js` per vedere tutti gli admin
3. Ricrea l'account con `node create-admin.js`

---

📞 **Per supporto**: Verifica prima i log del backend e dell'app mobile per eventuali errori di connessione.
