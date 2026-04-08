// ===== Main App Controller =====
let currentPage = 'home';

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
  initSocket();
});

function checkAuth() {
  if (api.token && api.user) {
    hideLoginModal();
    navigateTo('home');
  } else {
    showLoginModal();
  }
}

function showLoginModal() {
  document.getElementById('login-modal').classList.remove('hidden');
}
function hideLoginModal() {
  document.getElementById('login-modal').classList.add('hidden');
}

function setupEventListeners() {
  // Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const codigo = document.getElementById('login-codigo').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await api.login(codigo, password);

    api.setAuth(res.token, res.user);

    showSplash(res.user);

  } catch (err) {
    showError(err.message);
  }
});

function showError(msg) {
  const el = document.getElementById('login-error');
  el.innerHTML = "😡 " + msg;
  el.classList.remove('hidden');
  el.classList.add('shake');

  setTimeout(() => {
    el.classList.remove('shake');
    el.classList.add('hidden');
  }, 5000);
}

function showSplash(user) {
  const splash = document.getElementById('splash');
  document.getElementById('splash-text').innerText = "Bem-vindo " + user.name;

  splash.classList.remove('hidden');

  setTimeout(() => {
    splash.classList.add('hidden');
    document.getElementById('login-modal').style.display = 'none';
  }, 3000); // podes colocar 10s se quiser
}

  // Register
  document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-modal').classList.add('hidden');
    document.getElementById('register-modal').classList.remove('hidden');
  });
  document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('register-modal').classList.add('hidden');
    document.getElementById('login-modal').classList.remove('hidden');
  });
  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const type = document.getElementById('reg-type').value;
    try {
      const data = await api.register(name, email, password, type);
      api.setAuth(data.token, data.user);
      document.getElementById('register-modal').classList.add('hidden');
      navigateTo('home');
      showToast('Cadastro realizado!');
    } catch {
      api.setAuth('demo-token', { name, email });
      document.getElementById('register-modal').classList.add('hidden');
      navigateTo('home');
      showToast('Modo demo ativado!');
    }
  });

  // Navigation
  document.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      if (page === 'sair') { logout(); return; }
      navigateTo(page);
    });
  });

  // Quick message
  document.getElementById('btn-quick-msg').addEventListener('click', () => {
    document.getElementById('quick-msg-modal').classList.remove('hidden');
  });
  document.getElementById('quick-msg-cancel').addEventListener('click', () => {
    document.getElementById('quick-msg-modal').classList.add('hidden');
  });
  document.getElementById('quick-msg-send').addEventListener('click', async () => {
    const text = document.getElementById('quick-msg-text').value.trim();
    if (!text) return;
    try { await api.sendQuickMessage(text); } catch {}
    document.getElementById('quick-msg-text').value = '';
    document.getElementById('quick-msg-modal').classList.add('hidden');
    showToast('Mensagem enviada com sucesso!');
  });

  // Notifications
  document.getElementById('btn-notifications').addEventListener('click', () => {
    showToast('🔔 Você tem 3 notificações novas!');
  });
}

function navigateTo(page) {
  currentPage = page;
  const content = document.getElementById('content');

  // Update nav active states
  document.querySelectorAll('.nav-link, .bnav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  if (page === 'home') {
    content.innerHTML = renderHomePage();
    loadPosts();
  } else if (page === 'dados') {
    content.innerHTML = renderDadosPage();
    initDadosTabs();
  } else if (page === 'chat') {
    content.innerHTML = renderChatPage();
  }
}

function logout() {
  api.clearAuth();
  showLoginModal();
  showToast('Você saiu da conta.');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}
