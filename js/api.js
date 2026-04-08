// ===== API Helper =====
const API_URL = 'http://localhost:3000/api';

const api = {
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),

  setAuth(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  clearAuth() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async request(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_URL}${endpoint}`, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro na requisição');
    return data;
  },

  // Auth
login: (codigo, senha) => api.request('/auth/login', 'POST', { codigo, senha }),
  register: (name, email, password, type) => api.request('/auth/register', 'POST', { name, email, password, type }),

  // Posts
  getPosts: () => api.request('/posts'),
  createPost: (content) => api.request('/posts', 'POST', { content }),
  likePost: (id) => api.request(`/posts/${id}/like`, 'POST'),
  getComments: (postId) => api.request(`/posts/${postId}/comments`),
  addComment: (postId, text) => api.request(`/posts/${postId}/comments`, 'POST', { text }),

  // Messages
  sendQuickMessage: (text) => api.request('/messages/quick', 'POST', { text }),
  getCommunities: () => api.request('/communities'),
  getMessages: (communityId) => api.request(`/communities/${communityId}/messages`),

  // User data
  getProfile: () => api.request('/user/profile'),
  getNotas: () => api.request('/user/notas'),
  getMensalidades: () => api.request('/user/mensalidades'),
  getHorario: () => api.request('/user/horario'),
};
