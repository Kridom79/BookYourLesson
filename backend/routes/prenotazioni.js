// backend/routes/prenotazioni.js
const express = require('express');
const db = require('../db');
const router = express.Router();

console.log('📝 Loading prenotazioni routes...');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Prenotazioni routes working!' });
});

// CREATE BOOKING - Crea nuova prenotazione
router.post('/', (req, res) => {
  const { userId, data, orario } = req.body;
  
  console.log('📝 Tentativo prenotazione:', { userId, data, orario });
  
  if (!userId || !data || !orario) {
    return res.status(400).json({ 
      error: 'User ID, date and time are required',
      code: 'MISSING_FIELDS'
    });
  }

  // Verifica che lo slot sia disponibile
  const checkQuery = `
    SELECT * FROM prenotazioni 
    WHERE data = ? AND orario = ? AND stato = 'confermata'
  `;
  
  db.query(checkQuery, [data, orario], (err, existing) => {
    if (err) {
      console.error('❌ Errore verifica disponibilità:', err.message);
      return res.status(500).json({ 
        error: 'Database error checking availability',
        code: 'DB_ERROR'
      });
    }
    
    if (existing.length > 0) {
      console.log('⚠️ Slot già prenotato:', data, orario);
      return res.status(400).json({ 
        error: 'This time slot is already booked',
        code: 'SLOT_TAKEN'
      });
    }

    // Crea la prenotazione
    const insertQuery = `
      INSERT INTO prenotazioni (id_utente, data, orario, costo, stato) 
      VALUES (?, ?, ?, 10.00, 'confermata')
    `;
    
    db.query(insertQuery, [userId, data, orario], (err, result) => {
      if (err) {
        console.error('❌ Errore creazione prenotazione:', err.message);
        return res.status(500).json({ 
          error: 'Failed to create booking',
          code: 'INSERT_ERROR'
        });
      }
      
      console.log('✅ Prenotazione creata:', result.insertId);
      
      res.status(201).json({ 
        success: true,
        message: 'Booking created successfully',
        bookingId: result.insertId,
        details: {
          userId,
          data,
          orario,
          cost: '10.00',
          status: 'confermata'
        }
      });
    });
  });
});

// GET USER BOOKINGS - Ottieni prenotazioni utente
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  
  console.log('📋 Richiesta prenotazioni per utente:', userId);
  
  if (!userId) {
    return res.status(400).json({ 
      error: 'User ID is required',
      code: 'MISSING_USER_ID'
    });
  }
  
  const query = `
    SELECT 
      p.id,
      p.data,
      p.orario,
      p.costo,
      p.stato,
      p.note,
      p.created_at,
      DATE_FORMAT(p.data, '%Y-%m-%d') as data_formatted,
      TIME_FORMAT(p.orario, '%H:%i') as orario_formatted,
      DAYNAME(p.data) as giorno_nome,
      CASE 
        WHEN p.data > CURDATE() OR (p.data = CURDATE() AND p.orario > CURTIME()) THEN 'upcoming'
        ELSE 'past'
      END as timing
    FROM prenotazioni p
    WHERE p.id_utente = ?
    ORDER BY p.data DESC, p.orario DESC
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('❌ Errore recupero prenotazioni:', err.message);
      return res.status(500).json({ 
        error: 'Database error retrieving bookings',
        code: 'DB_ERROR'
      });
    }
    
    console.log(`✅ Trovate ${results.length} prenotazioni per utente ${userId}`);
    
    res.json({
      success: true,
      bookings: results,
      total: results.length,
      upcoming: results.filter(b => b.timing === 'upcoming').length,
      past: results.filter(b => b.timing === 'past').length
    });
  });
});

// GET ALL BOOKINGS - Tutte le prenotazioni (admin)
router.get('/all', (req, res) => {
  console.log('📊 Richiesta tutte le prenotazioni (admin)');
  
  const query = `
    SELECT 
      p.id,
      p.data,
      p.orario,
      p.costo,
      p.stato,
      p.note,
      p.created_at,
      u.nome as nome_utente,
      u.email as email_utente,
      u.telefono,
      DATE_FORMAT(p.data, '%Y-%m-%d') as data_formatted,
      TIME_FORMAT(p.orario, '%H:%i') as orario_formatted,
      DAYNAME(p.data) as giorno_nome,
      CASE 
        WHEN p.data > CURDATE() OR (p.data = CURDATE() AND p.orario > CURTIME()) THEN 'upcoming'
        ELSE 'past'
      END as timing
    FROM prenotazioni p
    JOIN utenti u ON p.id_utente = u.id
    ORDER BY p.data DESC, p.orario DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Errore recupero tutte prenotazioni:', err.message);
      return res.status(500).json({ 
        error: 'Database error retrieving all bookings',
        code: 'DB_ERROR'
      });
    }
    
    console.log(`✅ Trovate ${results.length} prenotazioni totali`);
    
    res.json({
      success: true,
      bookings: results,
      total: results.length,
      confirmed: results.filter(b => b.stato === 'confermata').length,
      cancelled: results.filter(b => b.stato === 'cancellata').length,
      upcoming: results.filter(b => b.timing === 'upcoming' && b.stato === 'confermata').length
    });
  });
});

// PUT UPDATE BOOKING - Aggiorna prenotazione
router.put('/:bookingId', (req, res) => {
  const { bookingId } = req.params;
  const { stato, note } = req.body;
  
  console.log('✏️ Aggiornamento prenotazione:', bookingId, { stato, note });
  
  if (!bookingId) {
    return res.status(400).json({ 
      error: 'Booking ID is required',
      code: 'MISSING_BOOKING_ID'
    });
  }

  if (!stato) {
    return res.status(400).json({ 
      error: 'Status is required',
      code: 'MISSING_STATUS'
    });
  }

  const query = `
    UPDATE prenotazioni 
    SET stato = ?, note = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  db.query(query, [stato, note || null, bookingId], (err, result) => {
    if (err) {
      console.error('❌ Errore aggiornamento prenotazione:', err.message);
      return res.status(500).json({ 
        error: 'Database error updating booking',
        code: 'DB_ERROR'
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Booking not found',
        code: 'BOOKING_NOT_FOUND'
      });
    }
    
    console.log('✅ Prenotazione aggiornata:', bookingId);
    
    res.json({ 
      success: true,
      message: 'Booking updated successfully',
      bookingId,
      newStatus: stato
    });
  });
});

// DELETE BOOKING - Cancella prenotazione (admin)
router.delete('/:bookingId', (req, res) => {
  const { bookingId } = req.params;
  
  console.log('🗑️ Cancellazione prenotazione:', bookingId);
  
  if (!bookingId) {
    return res.status(400).json({ 
      error: 'Booking ID is required',
      code: 'MISSING_BOOKING_ID'
    });
  }

  // Aggiorna stato a cancellata invece di eliminare
  const query = `
    UPDATE prenotazioni 
    SET stato = 'cancellata', updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  db.query(query, [bookingId], (err, result) => {
    if (err) {
      console.error('❌ Errore cancellazione prenotazione:', err.message);
      return res.status(500).json({ 
        error: 'Database error cancelling booking',
        code: 'DB_ERROR'
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Booking not found',
        code: 'BOOKING_NOT_FOUND'
      });
    }
    
    console.log('✅ Prenotazione cancellata:', bookingId);
    
    res.json({ 
      success: true,
      message: 'Booking cancelled successfully',
      bookingId
    });
  });
});

// GET BOOKING BY ID - Dettagli prenotazione specifica
router.get('/:bookingId', (req, res) => {
  const { bookingId } = req.params;
  
  console.log('🔍 Richiesta dettagli prenotazione:', bookingId);
  
  if (!bookingId) {
    return res.status(400).json({ 
      error: 'Booking ID is required',
      code: 'MISSING_BOOKING_ID'
    });
  }
  
  const query = `
    SELECT 
      p.*,
      u.nome as nome_utente,
      u.email as email_utente,
      u.telefono,
      DATE_FORMAT(p.data, '%Y-%m-%d') as data_formatted,
      TIME_FORMAT(p.orario, '%H:%i') as orario_formatted,
      DAYNAME(p.data) as giorno_nome
    FROM prenotazioni p
    JOIN utenti u ON p.id_utente = u.id
    WHERE p.id = ?
  `;
  
  db.query(query, [bookingId], (err, results) => {
    if (err) {
      console.error('❌ Errore recupero prenotazione:', err.message);
      return res.status(500).json({ 
        error: 'Database error retrieving booking',
        code: 'DB_ERROR'
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ 
        error: 'Booking not found',
        code: 'BOOKING_NOT_FOUND'
      });
    }
    
    console.log('✅ Prenotazione trovata:', bookingId);
    
    res.json({
      success: true,
      booking: results[0]
    });
  });
});

// CLEAR ALL BOOKINGS - Cancella tutte le prenotazioni e ripristina slot (Admin only)
router.delete('/clear-all', (req, res) => {
  console.log('🗑️ Admin request: Clear all bookings and regenerate slots');
  
  // Inizia una transazione
  db.beginTransaction((err) => {
    if (err) {
      console.error('❌ Errore avvio transazione:', err.message);
      return res.status(500).json({ 
        error: 'Database transaction error',
        code: 'TRANSACTION_ERROR'
      });
    }

    // Step 1: Cancella tutte le prenotazioni confermate
    const updateBookingsQuery = `
      UPDATE prenotazioni 
      SET stato = 'cancellata' 
      WHERE stato = 'confermata'
    `;
    
    db.query(updateBookingsQuery, (err, bookingResults) => {
      if (err) {
        console.error('❌ Errore cancelling bookings:', err.message);
        return db.rollback(() => {
          res.status(500).json({ 
            error: 'Database error cancelling bookings',
            code: 'DB_ERROR'
          });
        });
      }

      console.log(`✅ Cancelled ${bookingResults.affectedRows} bookings`);

      // Step 2: Cancella tutti gli slot esistenti
      const deleteSlotQuery = 'DELETE FROM orari_disponibili';
      
      db.query(deleteSlotQuery, (err, deleteResults) => {
        if (err) {
          console.error('❌ Errore deleting slots:', err.message);
          return db.rollback(() => {
            res.status(500).json({ 
              error: 'Database error deleting slots',
              code: 'DB_ERROR'
            });
          });
        }

        console.log(`✅ Deleted ${deleteResults.affectedRows} existing slots`);

        // Step 3: Rigenera tutti gli slot per 12 settimane
        regenerateAvailableSlots((err, newSlotsCount) => {
          if (err) {
            console.error('❌ Errore regenerating slots:', err.message);
            return db.rollback(() => {
              res.status(500).json({ 
                error: 'Error regenerating available slots',
                code: 'REGENERATE_ERROR'
              });
            });
          }

          // Commit della transazione
          db.commit((err) => {
            if (err) {
              console.error('❌ Errore commit transazione:', err.message);
              return db.rollback(() => {
                res.status(500).json({ 
                  error: 'Transaction commit error',
                  code: 'COMMIT_ERROR'
                });
              });
            }

            console.log(`🎉 Success: ${bookingResults.affectedRows} bookings cancelled, ${newSlotsCount} slots regenerated`);
            
            res.json({
              success: true,
              message: `Calendar reset complete! Cancelled ${bookingResults.affectedRows} booking(s) and generated ${newSlotsCount} new available slots.`,
              cancelledCount: bookingResults.affectedRows,
              newSlotsCount: newSlotsCount
            });
          });
        });
      });
    });
  });
});

// Funzione helper per rigenerare gli slot disponibili
function regenerateAvailableSlots(callback) {
  const timeSlots = [
    '09:00:00', '10:00:00', '11:00:00',  // Mattina
    '15:00:00', '16:00:00', '17:00:00', '18:00:00'  // Pomeriggio
  ];

  // CORREZIONE: Usa lo stesso calcolo di total-reset.js  
  const startDate = new Date(2025, 7, 25); // Anno, Mese (0-based), Giorno - 25 agosto 2025
  startDate.setHours(0, 0, 0, 0);

  const slotsToInsert = [];
  
  // Genera 12 settimane di slot (Lunedì = 0, Martedì = 1, ... Venerdì = 4)
  for (let week = 0; week < 12; week++) {
    for (let day = 0; day <= 4; day++) { // SOLO giorni lavorativi: 0=Lun, 1=Mar, 2=Mer, 3=Gio, 4=Ven
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + (week * 7) + day);
      
      const dateString = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
      
      for (const timeSlot of timeSlots) {
        const tipo_slot = timeSlot < '13:00:00' ? 'mattina' : 'pomeriggio';
        slotsToInsert.push([dateString, timeSlot, 1, tipo_slot]);
      }
    }
  }

  console.log(`📊 Total slots to insert: ${slotsToInsert.length}`);

  // Inserisce tutti gli slot in batch
  const insertQuery = 'INSERT INTO orari_disponibili (data, orario, disponibile, tipo_slot) VALUES ?';
  
  db.query(insertQuery, [slotsToInsert], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      console.log(`✅ Successfully inserted ${results.affectedRows} slots`);
      callback(null, results.affectedRows);
    }
  });
}

module.exports = router;