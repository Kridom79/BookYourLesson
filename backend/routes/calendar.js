// backend/routes/calendar.js
const express = require('express');
const db = require('../db');
const router = express.Router();

console.log('📅 Loading calendar routes...');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Calendar routes working!' });
});

// Generate slots for next 2 months
router.post('/generate-slots', (req, res) => {
  console.log('🔄 Generating available slots...');
  
  const { startDate, endDate } = req.body;
  
  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days from now
  
  // Clear existing future slots
  const clearQuery = `
    DELETE FROM orari_disponibili 
    WHERE data >= CURDATE() AND disponibile = TRUE
    AND NOT EXISTS (
      SELECT 1 FROM prenotazioni p 
      WHERE p.data = orari_disponibili.data 
      AND p.orario = orari_disponibili.orario 
      AND p.stato = 'confermata'
    )
  `;
  
  db.query(clearQuery, (err) => {
    if (err) {
      console.error('❌ Error clearing old slots:', err.message);
      return res.status(500).json({ error: 'Failed to clear old slots' });
    }
    
    // Generate new slots
    const slots = [];
    const timeSlots = [
      '09:00:00', '10:00:00', '11:00:00', 
      '15:00:00', '16:00:00', '17:00:00', '18:00:00'
    ];
    
    let currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      
      // Only Monday to Friday (1-5)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const dateString = currentDate.toISOString().split('T')[0];
        const weekNumber = getWeekNumber(currentDate);
        
        timeSlots.forEach(time => {
          const tipoSlot = time.startsWith('0') || time.startsWith('1') ? 'mattina' : 'pomeriggio';
          slots.push([dateString, time, tipoSlot, weekNumber]);
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if (slots.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No slots to generate',
        slotsCreated: 0 
      });
    }
    
    // Insert all slots
    const insertQuery = `
      INSERT IGNORE INTO orari_disponibili (data, orario, tipo_slot, settimana, disponibile) 
      VALUES ?
    `;
    
    const values = slots.map(slot => [...slot, true]);
    
    db.query(insertQuery, [values], (err, result) => {
      if (err) {
        console.error('❌ Error inserting slots:', err.message);
        return res.status(500).json({ error: 'Failed to generate slots' });
      }
      
      console.log(`✅ Generated ${result.affectedRows} available slots`);
      
      res.json({ 
        success: true, 
        message: `Generated ${result.affectedRows} available slots`,
        slotsCreated: result.affectedRows,
        period: {
          from: start.toISOString().split('T')[0],
          to: end.toISOString().split('T')[0]
        }
      });
    });
  });
});

// Auto-generate slots for current week if empty
router.post('/auto-generate', (req, res) => {
  console.log('🤖 Auto-generating slots...');
  
  // Check if we have any future slots
  const checkQuery = `
    SELECT COUNT(*) as count 
    FROM orari_disponibili 
    WHERE data >= CURDATE() AND disponibile = TRUE
  `;
  
  db.query(checkQuery, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    const currentCount = results[0].count;
    
    if (currentCount < 50) { // If less than 50 slots available, generate more
      const startDate = new Date();
      const endDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 2 months
      
      // Call generate-slots
      req.body = { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
      
      // Recursive call to generate-slots
      return router.handle({ method: 'POST', url: '/generate-slots', body: req.body }, res);
    } else {
      res.json({ 
        success: true, 
        message: `Already have ${currentCount} slots available`,
        slotsCreated: 0 
      });
    }
  });
});

// Get week number
function getWeekNumber(date) {
  const firstJan = new Date(date.getFullYear(), 0, 1);
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayOfYear = ((today - firstJan + 86400000) / 86400000);
  return Math.ceil(dayOfYear / 7);
}

module.exports = router;