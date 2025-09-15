// backend/routes/orari.js
const express = require('express');
const db = require('../db');
const router = express.Router();

console.log('📅 Loading orari routes...');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Orari routes working!' });
});

// Get available slots
router.get('/', (req, res) => {
  // Bypass auto-generation temporarily and go directly to getAvailableSlots
  console.log('📊 Getting available slots (bypassing auto-generation)...');
  getAvailableSlots(res);
});

function getAvailableSlots(res) {
  const query = `
    SELECT 
      oa.id,
      oa.data,
      oa.orario,
      DATE_FORMAT(oa.data, '%Y-%m-%d') as data_formatted,
      TIME_FORMAT(oa.orario, '%H:%i') as orario_formatted
    FROM orari_disponibili oa
    WHERE oa.disponibile = TRUE
      AND oa.data >= CURDATE()
      AND NOT EXISTS (
        SELECT 1 FROM prenotazioni p 
        WHERE p.data = oa.data 
        AND p.orario = oa.orario 
        AND p.stato = 'confermata'
      )
    ORDER BY oa.data ASC, oa.orario ASC
    LIMIT 500
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({
      success: true,
      slots: results,
      total: results.length
    });
  });
}

function getWeekNumber(date) {
  const firstJan = new Date(date.getFullYear(), 0, 1);
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayOfYear = ((today - firstJan + 86400000) / 86400000);
  return Math.ceil(dayOfYear / 7);
}

// Get weeks
router.get('/settimane', (req, res) => {
  const query = `
    SELECT 
      sa.numero_settimana,
      sa.anno,
      DATE_FORMAT(sa.data_inizio, '%Y-%m-%d') as data_inizio,
      DATE_FORMAT(sa.data_fine, '%Y-%m-%d') as data_fine
    FROM settimane_disponibili sa
    WHERE sa.data_inizio >= CURDATE()
    ORDER BY sa.data_inizio ASC
    LIMIT 10
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({
      success: true,
      settimane: results,
      total: results.length
    });
  });
});

module.exports = router;