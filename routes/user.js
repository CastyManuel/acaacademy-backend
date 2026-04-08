const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// // Rota de teste
// router.get('/', (req, res) => {
//   res.json([
//     { id: 1, author: "Teste", content: "Funcionando!", likes: 10, comments: 2, media: null }
//   ]);
// });


router.get('/profile', auth, async (req, res) => {
  try {
    // Busca primeiro na tabela usuarios + turma
    const [result] = await db.execute(`
      SELECT 
        u.id,
        u.nome,
        u.codigo,
        u.tipo,
        u.created_at,
        u.email,         -- adicionar email de usuarios
        t.nome AS turma_nome
      FROM usuarios u
      LEFT JOIN alunos a ON a.codigo_estudante = u.codigo
      LEFT JOIN turmas t ON t.id = a.turma_id
      WHERE u.codigo = ?
    `, [req.userId]);

    if (result.length > 0) {
      return res.json(result[0]);
    }

    // Fallback: buscar direto em alunos + turmas (com email)
    const [alunos] = await db.execute(`
      SELECT 
        a.codigo_estudante AS id,
        a.nome,
        a.codigo_estudante AS codigo,
        'aluno' AS tipo,
        NULL AS created_at,
        a.email,            -- pegar email da tabela alunos
        t.nome AS turma_nome
      FROM alunos a
      LEFT JOIN turmas t ON t.id = a.turma_id
      WHERE a.codigo_estudante = ?
    `, [req.userCodigo]);

    if (alunos.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(alunos[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

// Rota para obter notas do usuário/aluno
router.get('/notas', auth, async (req, res) => {
  try {
    // Buscar o código do aluno a partir do token
    const userCodigo = req.userCodigo; // você precisa setar isso no middleware auth ao gerar o token

    // Buscar notas do aluno usando o código
    const [notas] = await db.execute(`
 SELECT n.*, a.curso_id, c.nome AS curso_nome
  FROM notas n
  JOIN alunos a ON a.id = n.aluno_id
  JOIN cursos c ON c.id = a.curso_id
  WHERE a.codigo_estudante = ?
    `, [userCodigo]);

    res.json(notas);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar notas' });
  }
});
// rota completa que o frontend espera
// Rota de mensalidades corrigida
router.get('/mensalidades', auth, async (req, res) => {
  try {
    // Verifica se o token trouxe o código do aluno
    if (!req.userCodigo) return res.status(401).json({ error: 'Usuário não autenticado' });

    // Busca aluno usando o código do token
    const [alunos] = await db.execute(
      'SELECT * FROM alunos WHERE codigo_estudante = ?',
      [req.userCodigo]
    );
    const aluno = alunos[0];
    if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado' });

    // Busca o curso do aluno
    const [cursos] = await db.execute('SELECT * FROM cursos WHERE id = ?', [aluno.curso_id]);
    const curso = cursos[0];
    if (!curso) return res.status(404).json({ error: 'Curso não encontrado' });

    const duracao = Number(curso.duracao);
    const inicioCurso = new Date(aluno.inicio_curso);

    // Busca mensalidades já existentes
    const [mensalidadesDB] = await db.execute(
      'SELECT * FROM mensalidades WHERE aluno_id = ?',
      [aluno.id]
    );

    // Mapeia mensalidades existentes
    const mensalidadesMap = {};
    mensalidadesDB.forEach(m => { mensalidadesMap[m.mes_referencia] = m; });

    const mesesAno = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const mensalidades = [];

    for (let i = 0; i < duracao; i++) {
      const dataMes = new Date(inicioCurso);
      dataMes.setMonth(dataMes.getMonth() + i);

      const mesRef = i + 1;
      const nomeMes = mesesAno[dataMes.getMonth()];
      const existente = mensalidadesMap[mesRef] || {};
      const status = existente.status_pagamento || 'pendente';
      const dataPagamento = existente.data_pagamento || null;

      mensalidades.push({
        mes: mesRef,
        nome_mes: nomeMes,
        valor: curso.preco,
        status_pagamento: status,
        data_pagamento: dataPagamento
      });
    }

    res.json(mensalidades);
  } catch (err) {
    console.error('Erro ao buscar mensalidades:', err);
    res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
  }
});
// routes/user.js ou similar
router.get('/horario', auth, async (req, res) => { 
  try {
    // Busca aluno pelo código do token
    const [alunos] = await db.execute(
      'SELECT * FROM alunos WHERE codigo_estudante = ?',
      [req.userCodigo]
    );

    if (!alunos[0]) {
      console.error('Aluno não encontrado para o código:', req.userCodigo);
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    const aluno = alunos[0];

    // Busca turma do aluno
    const [turmas] = await db.execute(
      'SELECT * FROM turmas WHERE id = ?',
      [aluno.turma_id]
    );

    if (!turmas[0]) {
      console.error('Turma não encontrada para o aluno:', aluno.codigo_estudante, 'Turma ID:', aluno.turma_id);
      return res.status(404).json({ error: 'Turma não encontrada' });
    }

    const turma = turmas[0];

    // Log completo do JSON do horário
    console.log('JSON do horário do aluno:', turma.horario);

    // Converte o JSON do horário
    let horario;
    try {
      horario = JSON.parse(turma.horario);
    } catch (parseErr) {
      console.error('Erro ao parsear JSON do horário:', parseErr, 'Conteúdo:', turma.horario);
      return res.status(500).json({ error: 'JSON do horário inválido', details: parseErr.message });
    }

    res.json({ horario });

  } catch (err) {
    console.error('Erro ao buscar horário:', err); // Mostra stack completa no terminal
    res.status(500).json({ error: 'Erro ao buscar horário', details: err.message });
  }
});
module.exports = router;
