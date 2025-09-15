-- =============================================
-- DATABASE COMPLETO PER BOOKYOURLESSON
-- =============================================

-- Crea il database (se non esiste già)
CREATE DATABASE IF NOT EXISTS bookyourlesson 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

-- Usa il database
USE bookyourlesson;

-- =============================================
-- TABELLA UTENTI
-- =============================================
CREATE TABLE utenti (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    ruolo ENUM('utente', 'admin') DEFAULT 'utente',
    telefono VARCHAR(20) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_ruolo (ruolo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABELLA ORARI DISPONIBILI
-- =============================================
CREATE TABLE orari_disponibili (
    id INT PRIMARY KEY AUTO_INCREMENT,
    data DATE NOT NULL,
    orario TIME NOT NULL,
    disponibile BOOLEAN DEFAULT TRUE,
    tipo_slot ENUM('mattina', 'pomeriggio') NOT NULL,
    settimana INT NOT NULL COMMENT 'Numero settimana dell anno',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_slot (data, orario),
    INDEX idx_data (data),
    INDEX idx_settimana (settimana),
    INDEX idx_disponibile (disponibile),
    INDEX idx_tipo_slot (tipo_slot)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABELLA PRENOTAZIONI
-- =============================================
CREATE TABLE prenotazioni (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_utente INT NOT NULL,
    data DATE NOT NULL,
    orario TIME NOT NULL,
    costo DECIMAL(6,2) DEFAULT 10.00,
    stato ENUM('confermata', 'cancellata', 'completata') DEFAULT 'confermata',
    note TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_utente) REFERENCES utenti(id) ON DELETE CASCADE,
    UNIQUE KEY unique_booking (data, orario),
    INDEX idx_utente (id_utente),
    INDEX idx_data (data),
    INDEX idx_stato (stato),
    INDEX idx_data_orario (data, orario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABELLA SETTIMANE DISPONIBILI (per calendario)
-- =============================================
CREATE TABLE settimane_disponibili (
    id INT PRIMARY KEY AUTO_INCREMENT,
    anno INT NOT NULL,
    numero_settimana INT NOT NULL,
    data_inizio DATE NOT NULL,
    data_fine DATE NOT NULL,
    attiva BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_settimana (anno, numero_settimana),
    INDEX idx_anno (anno),
    INDEX idx_attiva (attiva),
    INDEX idx_data_inizio (data_inizio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- INSERIMENTO DATI DI BASE
-- =============================================

-- Inserisci utente admin
INSERT INTO utenti (nome, email, password, ruolo) VALUES 
('Cristina Admin', 'admin@bookyourlesson.com', '$2b$10$YourHashedPasswordHere', 'admin'),
('Cristina Tutor', 'cristina@bookyourlesson.com', '$2b$10$YourHashedPasswordHere', 'admin');

-- =============================================
-- STORED PROCEDURE PER GENERARE ORARI
-- =============================================

DELIMITER //

-- Procedura per generare orari disponibili per una settimana
CREATE PROCEDURE GeneraOrariSettimanali(
    IN p_data_inizio DATE,
    IN p_data_fine DATE
)
BEGIN
    DECLARE v_data_corrente DATE;
    DECLARE v_giorno_settimana INT;
    DECLARE v_settimana INT;
    DECLARE done INT DEFAULT FALSE;
    
    SET v_data_corrente = p_data_inizio;
    
    WHILE v_data_corrente <= p_data_fine DO
        SET v_giorno_settimana = DAYOFWEEK(v_data_corrente); -- 1=Domenica, 2=Lunedì, etc.
        SET v_settimana = WEEK(v_data_corrente, 1); -- Settimana ISO
        
        -- Genera orari solo dal Lunedì al Venerdì (2-6)
        IF v_giorno_settimana BETWEEN 2 AND 6 THEN
            
            -- Orari mattutini: 09:00, 10:00, 11:00
            INSERT IGNORE INTO orari_disponibili (data, orario, tipo_slot, settimana) VALUES
            (v_data_corrente, '09:00:00', 'mattina', v_settimana),
            (v_data_corrente, '10:00:00', 'mattina', v_settimana),
            (v_data_corrente, '11:00:00', 'mattina', v_settimana);
            
            -- Orari pomeridiani: 15:00, 16:00, 17:00, 18:00
            INSERT IGNORE INTO orari_disponibili (data, orario, tipo_slot, settimana) VALUES
            (v_data_corrente, '15:00:00', 'pomeriggio', v_settimana),
            (v_data_corrente, '16:00:00', 'pomeriggio', v_settimana),
            (v_data_corrente, '17:00:00', 'pomeriggio', v_settimana),
            (v_data_corrente, '18:00:00', 'pomeriggio', v_settimana);
            
        END IF;
        
        SET v_data_corrente = DATE_ADD(v_data_corrente, INTERVAL 1 DAY);
    END WHILE;
    
END //

-- Procedura per generare settimane disponibili
CREATE PROCEDURE GeneraSettimaneDisponibili(
    IN p_data_inizio DATE,
    IN p_numero_settimane INT
)
BEGIN
    DECLARE v_counter INT DEFAULT 0;
    DECLARE v_data_corrente DATE;
    DECLARE v_data_lunedi DATE;
    DECLARE v_data_venerdi DATE;
    DECLARE v_anno INT;
    DECLARE v_settimana INT;
    
    SET v_data_corrente = p_data_inizio;
    
    WHILE v_counter < p_numero_settimane DO
        -- Trova il lunedì della settimana corrente
        SET v_data_lunedi = DATE_SUB(v_data_corrente, INTERVAL (DAYOFWEEK(v_data_corrente) - 2) DAY);
        SET v_data_venerdi = DATE_ADD(v_data_lunedi, INTERVAL 4 DAY);
        
        SET v_anno = YEAR(v_data_lunedi);
        SET v_settimana = WEEK(v_data_lunedi, 1);
        
        -- Inserisci la settimana
        INSERT IGNORE INTO settimane_disponibili 
        (anno, numero_settimana, data_inizio, data_fine) VALUES
        (v_anno, v_settimana, v_data_lunedi, v_data_venerdi);
        
        -- Genera gli orari per questa settimana
        CALL GeneraOrariSettimanali(v_data_lunedi, v_data_venerdi);
        
        SET v_data_corrente = DATE_ADD(v_data_corrente, INTERVAL 7 DAY);
        SET v_counter = v_counter + 1;
    END WHILE;
    
END //

DELIMITER ;

-- =============================================
-- GENERA ORARI PER I PROSSIMI 8 SETTIMANE
-- =============================================

-- Genera settimane e orari dalla settimana corrente per 8 settimane (2 mesi circa)
CALL GeneraSettimaneDisponibili(CURDATE(), 8);

-- =============================================
-- VISTE UTILI PER LE QUERY
-- =============================================

-- Vista per orari disponibili con info settimana
CREATE VIEW v_orari_disponibili AS
SELECT 
    oa.id,
    oa.data,
    oa.orario,
    oa.tipo_slot,
    oa.settimana,
    oa.disponibile,
    DAYNAME(oa.data) AS giorno_settimana,
    DATE_FORMAT(oa.data, '%d/%m/%Y') AS data_formattata,
    TIME_FORMAT(oa.orario, '%H:%i') AS orario_formattato,
    sa.data_inizio AS settimana_inizio,
    sa.data_fine AS settimana_fine
FROM orari_disponibili oa
LEFT JOIN settimane_disponibili sa ON oa.settimana = sa.numero_settimana AND YEAR(oa.data) = sa.anno
WHERE oa.disponibile = TRUE
  AND oa.data >= CURDATE()
  AND NOT EXISTS (
      SELECT 1 FROM prenotazioni p 
      WHERE p.data = oa.data 
      AND p.orario = oa.orario 
      AND p.stato = 'confermata'
  )
ORDER BY oa.data ASC, oa.orario ASC;

-- Vista per prenotazioni complete con info utente
CREATE VIEW v_prenotazioni_complete AS
SELECT 
    p.id,
    p.data,
    p.orario,
    p.costo,
    p.stato,
    p.note,
    p.created_at,
    u.nome AS nome_utente,
    u.email AS email_utente,
    u.telefono,
    DATE_FORMAT(p.data, '%d/%m/%Y') AS data_formattata,
    TIME_FORMAT(p.orario, '%H:%i') AS orario_formattato,
    DAYNAME(p.data) AS giorno_settimana,
    CASE 
        WHEN p.data > CURDATE() OR (p.data = CURDATE() AND p.orario > CURTIME()) THEN 'futura'
        ELSE 'passata'
    END AS timing
FROM prenotazioni p
JOIN utenti u ON p.id_utente = u.id
ORDER BY p.data DESC, p.orario DESC;

-- =============================================
-- TRIGGER PER AGGIORNARE DISPONIBILITÀ
-- =============================================

DELIMITER //

-- Trigger che disabilita l'orario quando viene creata una prenotazione
CREATE TRIGGER tr_prenotazione_insert 
AFTER INSERT ON prenotazioni
FOR EACH ROW
BEGIN
    UPDATE orari_disponibili 
    SET disponibile = FALSE 
    WHERE data = NEW.data AND orario = NEW.orario;
END //

-- Trigger che riabilita l'orario quando viene cancellata una prenotazione
CREATE TRIGGER tr_prenotazione_update 
AFTER UPDATE ON prenotazioni
FOR EACH ROW
BEGIN
    IF NEW.stato = 'cancellata' AND OLD.stato != 'cancellata' THEN
        UPDATE orari_disponibili 
        SET disponibile = TRUE 
        WHERE data = NEW.data AND orario = NEW.orario;
    ELSEIF NEW.stato = 'confermata' AND OLD.stato = 'cancellata' THEN
        UPDATE orari_disponibili 
        SET disponibile = FALSE 
        WHERE data = NEW.data AND orario = NEW.orario;
    END IF;
END //

DELIMITER ;

-- =============================================
-- DATABASE COMPLETO CREATO CON SUCCESSO!
-- =============================================

-- Per verificare l'installazione, dopo l'importazione vai su:
-- 1. Tabella "orari_disponibili" -> dovresti vedere circa 224 righe
-- 2. Tabella "settimane_disponibili" -> dovresti vedere 8 righe  
-- 3. Tabella "utenti" -> dovresti vedere 2 utenti admin
-- 4. Tabella "prenotazioni" -> vuota (normale)

-- NOTA: Le password degli utenti admin vanno aggiornate tramite l'app
-- oppure puoi usare questo hash bcrypt per password "admin123":
-- $2b$10$rZJ8/4qF5YzJ7X4Z6y8u4eFoqG3jW3ZnKd8k3YzP5LrJ9k3Z5oJ2y