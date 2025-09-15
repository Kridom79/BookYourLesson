// INDEX.JS FUNZIONANTE - Version fix definitiva
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting BookYourLesson Backend...');

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`\n🌐 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Test database connection
try {
  const db = require('./db');
  console.log('✅ Database module loaded');
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
}

// Basic route
app.get('/', (req, res) => {
  console.log('✅ Root route accessed');
  res.json({ 
    message: '🎓 BookYourLesson API is running!',
    tutor: 'Cristina',
    version: '1.0.0'
  });
});

// Load auth routes
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Auth routes error:', error.message);
}

// Load orari routes
try {
  const orariRoutes = require('./routes/orari');
  app.use('/api/orari', orariRoutes);
  console.log('✅ Orari routes loaded');
} catch (error) {
  console.error('❌ Orari routes error:', error.message);
}

// Load prenotazioni routes
try {
  const prenotazioniRoutes = require('./routes/prenotazioni');
  app.use('/api/prenotazioni', prenotazioniRoutes);
  console.log('✅ Prenotazioni routes loaded');
} catch (error) {
  console.error('❌ Prenotazioni routes error:', error.message);
}

// Load calendar routes
try {
  const calendarRoutes = require('./routes/calendar');
  app.use('/api/calendar', calendarRoutes);
  console.log('✅ Calendar routes loaded');
} catch (error) {
  console.error('❌ Calendar routes error:', error.message);
}

// Error handler
app.use((err, req, res, next) => {
  console.error('🚨 Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎯 ============================`);
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`🌐 Also available on http://192.168.1.4:${PORT}`);
  console.log(`🏠 And locally on http://localhost:${PORT}`);
  console.log(`🎯 ============================\n`);
});

module.exports = app;