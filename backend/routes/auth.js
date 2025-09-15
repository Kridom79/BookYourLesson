// AUTH ROUTES - Versione funzionante dal server minimo
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

console.log('🔧 Loading WORKING auth routes...');

// Test route
router.get('/test', (req, res) => {
  console.log('✅ Auth test route hit');
  res.json({ message: 'Auth routes working!' });
});

// LOGIN - Versione funzionante
router.post('/login', (req, res) => {
  console.log('\n=== 🔐 LOGIN REQUEST ===');
  console.log('Body received:', req.body);
  
  const { email, password } = req.body || {};
  
  console.log('Email:', email);
  console.log('Password length:', password ? password.length : 0);
  
  if (!email || !password) {
    console.log('❌ Missing credentials');
    return res.status(400).json({ error: 'Email and password required' });
  }

  console.log('🔍 Querying database...');
  
  db.query('SELECT * FROM utenti WHERE email = ?', [email], (err, results) => {
    console.log('📊 Query callback executed');
    
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    console.log('✅ Query successful, results:', results.length);
    
    if (results.length === 0) {
      console.log('❌ User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = results[0];
    console.log('👤 User:', user.email, '| Role:', user.ruolo);
    
    bcrypt.compare(password, user.password, (compareErr, isValid) => {
      console.log('🔑 Password comparison done');
      
      if (compareErr) {
        console.error('❌ Bcrypt error:', compareErr);
        return res.status(500).json({ error: 'Auth error' });
      }
      
      console.log('Password valid:', isValid);
      
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      console.log('✅ Login successful!');
      
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          ruolo: user.ruolo || 'utente'
        }
      });
    });
  });
});

// REGISTER - Versione funzionante
router.post('/register', (req, res) => {
  console.log('\n=== 📝 REGISTER REQUEST ===');
  console.log('Body received:', req.body);
  
  const { nome, email, password } = req.body || {};
  
  if (!nome || !email || !password) {
    console.log('❌ Missing fields');
    return res.status(400).json({ error: 'All fields required' });
  }

  console.log('🔍 Checking email:', email);
  
  // Check if email exists
  db.query('SELECT id FROM utenti WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    if (results.length > 0) {
      console.log('❌ Email exists');
      return res.status(400).json({ error: 'Email already exists' });
    }

    console.log('✅ Email available, hashing...');
    
    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.error('❌ Hash error:', hashErr);
        return res.status(500).json({ error: 'Server error' });
      }
      
      console.log('✅ Password hashed, inserting...');
      
      db.query(
        'INSERT INTO utenti (nome, email, password) VALUES (?, ?, ?)',
        [nome, email, hashedPassword],
        (insertErr, result) => {
          if (insertErr) {
            console.error('❌ Insert error:', insertErr);
            return res.status(500).json({ error: 'Failed to create user' });
          }
          
          console.log('✅ User created with ID:', result.insertId);
          
          res.status(201).json({ 
            message: 'User created successfully',
            userId: result.insertId 
          });
        }
      );
    });
  });
});

console.log('✅ Working auth routes loaded');
module.exports = router;