let chatCommunities = [];
let chatMessages = {};
let activeCommunity = null;
let socket = null;

async function loadCommunities() {
  try {
    const communities = await api.request('/communities', 'GET');
    chatCommunities = communities;
    updateCommunityList();
  } catch {
    console.error('Erro ao carregar comunidades, usando fallback estático');
    chatCommunities = [
      { id:1, name:'Turma 3A', icon:'🎓', lastMessage:'Sem mensagens', time:'--', unread:0 },
      { id:2, name:'Todos os Alunos', icon:'👥', lastMessage:'Sem mensagens', time:'--', unread:0 },
      { id:3, name:'Secretaria', icon:'📋', lastMessage:'Sem mensagens', time:'--', unread:0 },
    ];
    updateCommunityList();
  }
}

async function loadMessages(communityId) {
  try {
    const messages = await api.request(`/communities/${communityId}/messages`, 'GET');
    chatMessages[communityId] = messages;
    if (communityId === activeCommunity) openCommunity(activeCommunity);
  } catch {
    console.error('Erro ao carregar mensagens');
    chatMessages[communityId] = [];
  }
}

// Atualiza lista no DOM
function updateCommunityList() {
  const chatList = document.getElementById('chat-list');
  if (!chatList) return;
  chatList.innerHTML = chatCommunities.map(c => `
    <div class="chat-item" onclick="openCommunity(${c.id})">
      <div class="chat-item-icon">${c.icon}</div>
      <div class="chat-item-info">
        <div class="chat-item-name">${c.name}</div>
        <div class="chat-item-last">${c.lastMessage || 'Sem mensagens'}</div>
      </div>
      <div class="chat-item-meta">
        <span class="chat-item-time">${c.time || '--'}</span>
        ${c.unread > 0 ? `<span class="chat-unread">${c.unread}</span>` : ''}
      </div>
    </div>
  `).join('');
}


function initSocket() {
  try {
    socket = io('http://localhost:3000');
    socket.on('new_message', (msg) => {
      if (msg.communityId === activeCommunity) {
        const container = document.getElementById('chat-messages');
        if (container) {
          container.innerHTML += renderMessage(msg);
          container.scrollTop = container.scrollHeight;
        }
      }
    });
  } catch { /* Socket not available, using mock */ }
}

function renderChatPage() {
  return `
    <div class="chat-container">
      <div class="chat-list" id="chat-list">
        <div class="chat-list-header">Conversas</div>
        ${chatCommunities.map(c => `
          <div class="chat-item" onclick="openCommunity(${c.id})">
            <div class="chat-item-icon">${c.icon}</div>
            <div class="chat-item-info">
              <div class="chat-item-name">${c.name}</div>
              <div class="chat-item-last">${c.lastMessage}</div>
            </div>
            <div class="chat-item-meta">
              <span class="chat-item-time">${c.time}</span>
              ${c.unread > 0 ? `<span class="chat-unread">${c.unread}</span>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
      <div class="chat-area hidden-mobile" id="chat-area">
        <div style="flex:1;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:14px">
          Selecione uma conversa para começar
        </div>
      </div>
    </div>
  `;
}

function renderMessage(msg) {
  const statusIcon = msg.status === 'read' ? '✓✓' : msg.status === 'delivered' ? '✓✓' : '✓';
  const statusClass = msg.status === 'read' ? 'read' : '';
  return `
    <div class="msg ${msg.sender === 'me' ? 'sent' : 'received'}">
      ${msg.senderName && msg.sender === 'other' ? `<div class="msg-sender">${msg.senderName}</div>` : ''}
      <div class="msg-text">${msg.text}</div>
      <div class="msg-meta">
        <span class="msg-time">${msg.time}</span>
        ${msg.sender === 'me' ? `<span class="msg-status ${statusClass}">${statusIcon}</span>` : ''}
      </div>
    </div>
  `;
}
async function openCommunity(id) {
  activeCommunity = id;

  // Carrega mensagens do backend se ainda não tiver
  if (!chatMessages[id]) await loadMessages(id);

  const comm = chatCommunities.find(c => c.id === id);
  const msgs = chatMessages[id] || [];

  const chatList = document.getElementById('chat-list');
  const chatArea = document.getElementById('chat-area');

  if (window.innerWidth < 769) {
    chatList.classList.add('hidden-mobile');
    chatArea.classList.remove('hidden-mobile');
  }

  chatArea.innerHTML = `
    <div class="chat-area-header">
      <span class="chat-back" onclick="closeCommunity()">←</span>
      <div class="chat-item-icon" style="width:36px;height:36px;font-size:18px">${comm.icon}</div>
      <div>
        <div style="font-weight:600;font-size:14px">${comm.name}</div>
        <div style="font-size:10px;opacity:.8">Online</div>
      </div>
    </div>
    <div class="chat-messages" id="chat-messages">
      ${msgs.map(renderMessage).join('')}
    </div>
    <div class="chat-input-bar">
      <button class="icon-btn" onclick="showToast('🎤 Gravação em breve!')">🎤</button>
      <input type="text" id="chat-input" placeholder="Digite uma mensagem..." onkeydown="if(event.key==='Enter')sendChatMessage()">
      <button class="chat-send" onclick="sendChatMessage()">➤</button>
    </div>
  `;

  document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;

  if (socket) socket.emit('join_community', id);

  // Zera contador de unread
  const community = chatCommunities.find(c => c.id === id);
  if (community) {
    community.unread = 0;
    updateCommunityList();
  }
}
function closeCommunity() {
  activeCommunity = null;
  const chatList = document.getElementById('chat-list');
  const chatArea = document.getElementById('chat-area');
  chatList.classList.remove('hidden-mobile');
  chatArea.classList.add('hidden-mobile');
  chatArea.innerHTML = `<div style="flex:1;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:14px">Selecione uma conversa</div>`;
}
async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  if (!input || !input.value.trim() || !activeCommunity) return;

  const text = input.value.trim();
  input.value = '';

  // Chama API
  try {
    const msg = await api.request(`/communities/${activeCommunity}/messages`, 'POST', { text });
    msg.sender = 'me';
    msg.status = 'sent';

    if (!chatMessages[activeCommunity]) chatMessages[activeCommunity] = [];
    chatMessages[activeCommunity].push(msg);

    const container = document.getElementById('chat-messages');
    container.innerHTML += renderMessage(msg);
    container.scrollTop = container.scrollHeight;

    // Simula entrega
    setTimeout(() => {
      msg.status = 'delivered';
      container.innerHTML = chatMessages[activeCommunity].map(renderMessage).join('');
      container.scrollTop = container.scrollHeight;
    }, 1000);

    // Notifica via socket
    if (socket) socket.emit('send_message', { communityId: activeCommunity, text });
  } catch {
    showToast('Erro ao enviar mensagem!');
  }
}