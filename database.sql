-- =============================================
-- EduConnect - Estrutura do Banco de Dados
-- Execute este arquivo no MySQL para criar as tabelas
-- =============================================

-- CREATE DATABASE IF NOT EXISTS educonnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE educonnect;

-- -- Usuários
-- CREATE TABLE usuario (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   name VARCHAR(100) NOT NULL,
--   email VARCHAR(100) NOT NULL UNIQUE,
--   password VARCHAR(255) NOT NULL,
--   type ENUM('aluno', 'secretaria', 'professor') DEFAULT 'aluno',
--   avatar VARCHAR(10) DEFAULT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Comunidades
CREATE TABLE comunidades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10) DEFAULT '👥',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Membros das comunidades
CREATE TABLE comunidade_membros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  comunidade_id INT NOT NULL,
  usuario_id INT NOT NULL,
  FOREIGN KEY (comunidade_id) REFERENCES comunidades(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE(comunidade_id, usuario_id)
);

-- Mensagens do chat
CREATE TABLE mensagens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  comunidade_id INT NOT NULL,
  usuario_id INT NOT NULL,
  text TEXT NOT NULL,
  status ENUM('sent', 'delivered', 'read') DEFAULT 'sent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (comunidade_id) REFERENCES comunidades(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Postagens (Feed)
CREATE TABLE postagens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  content TEXT NOT NULL,
  image VARCHAR(255) DEFAULT NULL,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Likes
CREATE TABLE likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  postagem_id INT NOT NULL,
  usuario_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (postagem_id) REFERENCES postagens(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE(postagem_id, usuario_id)
);

-- Comentários
CREATE TABLE comentarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  postagem_id INT NOT NULL,
  usuario_id INT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (postagem_id) REFERENCES postagens(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- -- Notificações
-- CREATE TABLE notificacoes (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   usuario_id INT NOT NULL,
--   title VARCHAR(200) NOT NULL,
--   message TEXT,
--   is_read BOOLEAN DEFAULT FALSE,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
-- );

-- -- Notas
-- CREATE TABLE notas (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   usuario_id INT NOT NULL,
--   disciplina VARCHAR(100) NOT NULL,
--   bimestre1 DECIMAL(4,1) DEFAULT NULL,
--   bimestre2 DECIMAL(4,1) DEFAULT NULL,
--   bimestre3 DECIMAL(4,1) DEFAULT NULL,
--   bimestre4 DECIMAL(4,1) DEFAULT NULL,
--   media DECIMAL(4,1) DEFAULT NULL,
--   FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
-- );

-- -- Mensalidades
-- CREATE TABLE mensalidades (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   usuario_id INT NOT NULL,
--   mes VARCHAR(20) NOT NULL,
--   valor DECIMAL(10,2) NOT NULL,
--   vencimento DATE NOT NULL,
--   status ENUM('pago', 'pendente', 'atrasado') DEFAULT 'pendente',
--   FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
-- );

-- -- Horários
-- CREATE TABLE horarios (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   usuario_id INT NOT NULL,
--   dia_semana ENUM('Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta') NOT NULL,
--   horario_inicio TIME NOT NULL,
--   horario_fim TIME NOT NULL,
--   disciplina VARCHAR(100) NOT NULL,
--   FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
-- );

-- Mensagens rápidas (header)
CREATE TABLE mensagens_rapidas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- =============================================
-- Dados iniciais
-- =============================================

INSERT INTO comunidades (name, icon, description) VALUES
  ('Turma 3A', '🎓', 'Grupo da turma 3A'),
  ('Todos os Alunos', '👥', 'Comunidade geral'),
  ('Secretaria', '📋', 'Canal da secretaria');

-- Senha padrão: 123456 (hash bcrypt)
INSERT INTO usuarios (name, email, password, type, avatar) VALUES
  ('Aluno Demo', 'aluno@escola.com', '$2a$10$xVqYLGZmGhFGhKjT8BkHZ.5Y6GjG8jMjZ0KjLjXqXqXqXqXqXqXq', 'aluno', 'AD'),
  ('Secretaria', 'secretaria@escola.com', '$2a$10$xVqYLGZmGhFGhKjT8BkHZ.5Y6GjG8jMjZ0KjLjXqXqXqXqXqXqXq', 'secretaria', 'SC');
ALTER TABLE usuarios ADD COLUMN needs_update TINYINT(1) DEFAULT 0;










DELIMITER $$
DELIMITER $$

CREATE TRIGGER after_aluno_insert
AFTER INSERT ON alunos
FOR EACH ROW
BEGIN
    -- Verifica se já existe na tabela usuarios
    IF NOT EXISTS (
        SELECT 1 FROM usuarios WHERE codigo = NEW.codigo_estudante
    ) THEN
        INSERT INTO usuarios (nome, codigo, senha, tipo, needs_update)
        VALUES (NEW.nome, NEW.codigo_estudante, NEW.senha, 'aluno', 1);
    END IF;
END$$

DELIMITER ;