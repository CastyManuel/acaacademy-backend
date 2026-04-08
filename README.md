<<<<<<< HEAD
# 🎓 EduConnect - Plataforma de Gestão Escolar

Plataforma completa com chat em tempo real, feed de postagens e gestão acadêmica.

## 📁 Estrutura

```
educonnect/
├── frontend/          # HTML + CSS + JS (SPA)
│   ├── index.html
│   ├── manifest.json  # PWA
│   ├── css/style.css
│   └── js/
│       ├── api.js     # Comunicação com backend
│       ├── app.js     # Controlador principal
│       ├── pages.js   # Renderização das páginas
│       └── chat.js    # Sistema de chat
│
└── backend/           # Node.js + MySQL + WebSocket
    ├── server.js      # Servidor principal
    ├── database.sql   # Schema do banco de dados
    ├── .env.example   # Variáveis de ambiente
    ├── package.json
    ├── config/
    │   └── database.js
    ├── middleware/
    │   └── auth.js    # Autenticação JWT
    └── routes/
        ├── auth.js        # Login / Registro
        ├── posts.js       # Feed de postagens
        ├── communities.js # Chat / Comunidades
        ├── messages.js    # Mensagens rápidas
        └── user.js        # Dados do usuário
```

## 🚀 Como Instalar

### 1. Banco de Dados (MySQL)
```bash
mysql -u root -p < backend/database.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Edite .env com suas credenciais do MySQL
npm install
npm start
```

### 3. Frontend
Copie a pasta `frontend/` para o diretório público do seu servidor (Apache, Nginx, etc.)
ou abra `frontend/index.html` direto no navegador para modo demo.

Para servir pelo Node.js, copie o conteúdo de `frontend/` para `backend/public/`.

## ⚡ Funcionalidades

- ✅ Login e Cadastro com JWT
- ✅ Feed de postagens (likes + comentários)
- ✅ Chat em tempo real (WebSocket)
- ✅ 3 Comunidades: Turma, Todos, Secretaria
- ✅ Status de mensagem (enviado/entregue/visto)
- ✅ Dados: Conta, Notas, Mensalidade, Horário
- ✅ Envio rápido de mensagem
- ✅ Notificações
- ✅ PWA (instalável)
- ✅ Responsivo (sidebar desktop, bottom nav mobile)
- ✅ Skeleton loading + animações
- ✅ Modo demo (funciona sem backend)

## 🔧 Tecnologias

**Frontend:** HTML5, CSS3, JavaScript (Vanilla)
**Backend:** Node.js, Express, Socket.IO
**Banco:** MySQL
**Auth:** JWT + bcrypt
=======
# acaacademy-backend
aluno page backnd mca academy
>>>>>>> 3ce205566c4ab3be11561b0a6a5ef815992a90b0
