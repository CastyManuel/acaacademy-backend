const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// Envio rápido (header)
router.post('/quick', auth, async (req, res) => {
  try {
    const { text } = req.body;
    await db.execute('INSERT INTO mensagens_rapidas (usuario_id, text) VALUES (?, ?)', [req.userId, text]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Erro ao enviar mensagem' }); }
});

module.exports = router;
