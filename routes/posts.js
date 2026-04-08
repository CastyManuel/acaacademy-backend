const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();



// Listar postagens
router.get('/', async (req, res) => {
  try {
    const [posts] = await db.execute(`
      SELECT 
        p.*, 
        u.nome as author, 
        u.avatar,
        CASE 
          WHEN u.codigo IN ('MCAACD','MMCASC') THEN 'verified'
          WHEN u.codigo = 'MCAP' THEN 'pro'
          ELSE ''
        END as badge
      FROM postagens p 
      JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.created_at DESC 
      LIMIT 50
    `);

  const result = posts.map(p => ({
  id: p.id,
  author: p.author,
  avatar: p.avatar,
  badge: p.badge,
  content: p.content,
  media: p.image, // 🔥 agora é media
  likes: p.likes_count,
  comments: p.comments_count,
  time: timeAgo(p.created_at),
}));
    res.json(result);

  } catch {
    res.status(500).json({ error: 'Erro ao buscar postagens' });
  }
});

// Criar postagem
router.post('/', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const [result] = await db.execute(
      'INSERT INTO postagens (usuario_id, content) VALUES (?, ?)',
      [req.userId, content]
    );
    res.json({ id: result.insertId, content });
  } catch { res.status(500).json({ error: 'Erro ao criar postagem' }); }
});

// Like
router.post('/:id/like', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const [existing] = await db.execute(
      'SELECT id FROM likes WHERE postagem_id = ? AND usuario_id = ?',
      [postId, req.userId]
    );
    if (existing.length > 0) {
      await db.execute('DELETE FROM likes WHERE postagem_id = ? AND usuario_id = ?', [postId, req.userId]);
      await db.execute('UPDATE postagens SET likes_count = likes_count - 1 WHERE id = ?', [postId]);
      res.json({ liked: false });
    } else {
      await db.execute('INSERT INTO likes (postagem_id, usuario_id) VALUES (?, ?)', [postId, req.userId]);
      await db.execute('UPDATE postagens SET likes_count = likes_count + 1 WHERE id = ?', [postId]);
      res.json({ liked: true });
    }
  } catch { res.status(500).json({ error: 'Erro' }); }
});

/// Buscar comentários de uma postagem
router.get('/:id/comments', async (req, res) => {
  try {
    const [comments] = await db.execute(`
      SELECT c.*, u.nome, u.avatar 
      FROM comentarios c
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.postagem_id = ? 
      ORDER BY c.created_at ASC
    `, [req.params.id]);

    res.json(comments);
  } catch (err) {
    console.error(err); // mostra o erro real no console
    res.status(500).json({ error: 'Erro ao buscar comentários' });
  }
});

// Inserir comentário em uma postagem
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if(!text) return res.status(400).json({ error: 'Comentário vazio' });

    await db.execute(
      'INSERT INTO comentarios (postagem_id, usuario_id, text) VALUES (?, ?, ?)',
      [req.params.id, req.userId, text]
    );

    await db.execute(
      'UPDATE postagens SET comments_count = comments_count + 1 WHERE id = ?',
      [req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao postar comentário' });
  }
});

// Apagar postagem
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.execute(
      'DELETE FROM postagens WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.userId]
    );
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Erro ao apagar' });
  }
});

function timeAgo(date) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'Agora';
  if (diff < 3600) return `Há ${Math.floor(diff/60)} min`;
  if (diff < 86400) return `Há ${Math.floor(diff/3600)} horas`;
  return `Há ${Math.floor(diff/86400)} dias`;
}

module.exports = router;
