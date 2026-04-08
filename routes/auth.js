const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const router = express.Router();

// Registrar
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, type } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const avatar = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

    const [result] = await db.execute(
      'INSERT INTO usuarios (name, email, password, type, avatar) VALUES (?, ?, ?, ?, ?)',
      [name, email, hash, type || 'aluno', avatar]
    );

    const token = jwt.sign(
      { id: result.insertId, type: type || 'aluno' },
      process.env.JWT_SECRET || 'educonnect_secret',
      { expiresIn: '7d' }
    );

    // Adicionar às comunidades padrão
    const [comunidades] = await db.execute('SELECT id FROM comunidades');
    for (const c of comunidades) {
      await db.execute('INSERT IGNORE INTO comunidade_membros (comunidade_id, usuario_id) VALUES (?, ?)', [c.id, result.insertId]);
    }

    res.json({ token, user: { id: result.insertId, name, email, type: type || 'aluno', avatar } });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email já cadastrado' });
    res.status(500).json({ error: 'Erro ao cadastrar' });
  }
});

// Login
//Função para gerar JWT
// Função para gerar token JWT
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,       // id do usuário ou aluno
      type: user.tipo,   // 'aluno' ou 'usuario'
      codigo: user.codigo // código do aluno
    },
    process.env.JWT_SECRET || 'educonnect_secret',
    { expiresIn: '7d' } // ou '2h' se quiser validade menor
  );
}


// 🚀 Login
router.post('/login', async (req, res) => {
  try {
    const { codigo, senha } = req.body;

    if (!codigo || !senha) {
      return res.status(400).json({ error: 'Código e senha são obrigatórios' });
    }

    // 1️⃣ Verifica na tabela usuarios
    const [users] = await db.execute('SELECT * FROM usuarios WHERE codigo = ?', [codigo]);

    if (users.length > 0) {
      const user = users[0];

      if (!user.senha) {
        return res.status(401).json({ error: 'Senha não cadastrada. Atualize sua senha primeiro.' });
      }

      const valid = await bcrypt.compare(senha, user.senha);
      if (!valid) return res.status(401).json({ error: 'Senha inválida' });

      const firstLogin = user.needs_update ? true : false;

   return res.json({
  token: generateToken(user),
  user,
  firstLogin
});
    }

    // 2️⃣ Verifica na tabela alunos se não existe em usuarios
    const [alunos] = await db.execute(
      'SELECT * FROM alunos WHERE codigo_estudante = ?',
      [codigo]
    );

    if (alunos.length === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    const aluno = alunos[0];

    if (!aluno.senha) {
      return res.status(401).json({ error: 'Aluno sem senha cadastrada. Contate a secretaria.' });
    }

    const validAluno = await bcrypt.compare(senha, aluno.senha);
    if (!validAluno) return res.status(401).json({ error: 'Senha inválida' });

    // 3️⃣ Criar usuário automaticamente na tabela usuarios
    const hash = await bcrypt.hash(senha, 10);
    const avatar = aluno.nome
      .split(' ')
      .map(w => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const [result] = await db.execute(
      'INSERT INTO usuarios (nome, codigo, senha, tipo, needs_update) VALUES (?, ?, ?, ?, ?)',
      [aluno.nome, aluno.codigo_estudante, hash, 'aluno', 1] // needs_update = 1
    );

    // return res.json({
    //   token: generateToken(result.insertId, 'aluno'),
    //   user: {
    //     id: result.insertId,
    //     nome: aluno.nome,
    //     codigo: aluno.codigo_estudante,
    //     email: aluno.email,
    //     type: 'aluno',
    //     needs_update: 1
    //   },
    //   firstLogin: true // força atualizar senha
    // });


    const novoUser = {
  id: result.insertId,
  tipo: 'aluno',
  codigo: aluno.codigo_estudante
};
return res.json({
  token: generateToken(novoUser),
  user: {
    id: result.insertId,
    nome: aluno.nome,
    codigo: aluno.codigo_estudante,
    email: aluno.email,
    type: 'aluno',
    needs_update: 1
  },
  firstLogin: true
});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no login' });
  }
});

// 🔑 Alterar senha
router.post('/change-password', async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'ID do usuário e nova senha são obrigatórios' });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await db.execute(
      'UPDATE usuarios SET senha = ?, needs_update = 0 WHERE id = ?',
      [hash, userId]
    );

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
});


module.exports = router;
