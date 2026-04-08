const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// Listar comunidades
router.get('/', auth, async (req, res) => {
  try {
    const [communities] = await db.execute(`
      SELECT c.*, 
        (SELECT text FROM mensagens WHERE comunidade_id = c.id ORDER BY created_at DESC LIMIT 1) as lastMessage,
        (SELECT COUNT(*) FROM mensagens WHERE comunidade_id = c.id AND status != 'read' AND usuario_id != ?) as unread
      FROM comunidades c
      JOIN comunidade_membros cm ON cm.comunidade_id = c.id
      WHERE cm.usuario_id = ?
    `, [req.userId, req.userId]);
    res.json(communities);
  } catch { res.status(500).json({ error: 'Erro ao buscar comunidades' }); }
});

// Mensagens de uma comunidade
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const [messages] = await db.execute(`
      SELECT m.*, u.name as senderName, u.type as senderType
      FROM mensagens m JOIN usuarios u ON m.usuario_id = u.id
      WHERE m.comunidade_id = ?
      ORDER BY m.created_at ASC LIMIT 100
    `, [req.params.id]);

    const result = messages.map(m => ({
      id: m.id,
      text: m.text,
      time: new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      sender: m.usuario_id === req.userId ? 'me' : 'other',
      senderName: m.senderName,
      senderType: m.senderType,
      status: m.status,
    }));
    res.json(result);
  } catch { res.status(500).json({ error: 'Erro' }); }
});

// Enviar mensagem
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const [result] = await db.execute(
      'INSERT INTO mensagens (comunidade_id, usuario_id, text) VALUES (?, ?, ?)',
      [req.params.id, req.userId, text]
    );

    // Atualizar status para "delivered" depois de 1s (simulação)
    setTimeout(async () => {
      await db.execute("UPDATE mensagens SET status = 'delivered' WHERE id = ?", [result.insertId]);
    }, 1000);

    res.json({ id: result.insertId, text });
  } catch { res.status(500).json({ error: 'Erro ao enviar mensagem' }); }
});

module.exports = router;
