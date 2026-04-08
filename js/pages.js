// ===== Page Renderers =====

function renderHomePage() {
  return `
    <div class="max-width">
      <div class="create-post">
        <div class="avatar">${api.user?.name?.charAt(0) || 'A'}</div>
        <div class="create-post-input" onclick="showToast('Em breve: criar postagens!')">No que você está pensando?</div>
      </div>
      <div id="posts-container">
        ${renderSkeletons(3)}
      </div>
    </div>
  `;
}

function renderSkeletons(count) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="post-card">
        <div class="post-header">
          <div class="skeleton skeleton-avatar"></div>
          <div style="flex:1">
            <div class="skeleton skeleton-text short"></div>
            <div class="skeleton skeleton-text" style="width:30%;height:10px"></div>
          </div>
        </div>
        <div style="padding:0 16px 16px">
          <div class="skeleton skeleton-text long"></div>
          <div class="skeleton skeleton-text" style="width:70%"></div>
        </div>
        <div class="skeleton skeleton-img"></div>
      </div>
    `;
  }
  return html;
}

// function renderPostCard(post) {
//   return `
//     <div class="post-card" onclick="openPostDetail(${post.id})">
//       <div class="post-header">
//         <div class="avatar"> <img class="avatar"  src="${post.avatar}" alt=""></div>
//         <div>
   
//           <div class="post-author">${post.author} <img src="assets/verif.png" alt="" width="25px">  </div>
//           <div class="post-time">${post.time || 'Agora'}</div>
//         </div>
//       </div>
//       <div class="post-content">${post.content}</div>
//       ${post.image ? '<div class="post-image"></div>' : ''}
//       <div class="post-actions">
//         <div class="post-action ${post.liked ? 'liked' : ''}" onclick="event.stopPropagation();toggleLike(${post.id})">
//           👍 ${post.likes || 0}
//         </div>
//         <div class="post-action">💬 ${post.comments || 0}</div>
//       </div>
//     </div>
//   `;
// }
function getBadgeIcon(badge) {
  if (badge === 'verified') {
    return '    <img src="assets/verif.png" alt="" width="25px">';
  }
  if (badge === 'pro') {
    return '    <img src="assets/verif.png" alt="" width="25px">';
  }
  return '';
}


function isVideo(file) {
  if (!file) return false;
  return file.toLowerCase().endsWith('.mp4');
}
function renderPostCard(post) {
  const media = post.media || post.image; 
  const isVid = isVideo(media);

  // Adiciona onclick para abrir o detalhe da postagem
  return `
    <div class="post-card" data-id="${post.id}" onclick="openPostDetail(${post.id})">

      <div class="post-header">
        <img class="avatar" src="${post.avatar || 'assets/default.png'}">
        <div>
          <div class="post-author">
            ${post.author} ${getBadgeIcon(post.badge)}
          </div>
          <div class="post-time">${post.time || 'Agora'}</div>
        </div>
      </div>

      <div class="post-content">${post.content || ''}</div>

      ${
        media
          ? isVid
            ? `<div class="video-container">
                 <video 
                   class="post-video"
                   src="http://localhost:3000/${media}"
                   muted
                   autoplay
                   loop
                   playsinline
                   onclick="event.stopPropagation(); toggleSound(this)"
                 ></video>
               </div>`
            : `<img class="post-image" src="http://localhost:3000/${media}" />`
          : ''
      }

      <div class="post-actions">
        <div class="post-action like-btn" onclick="event.stopPropagation(); toggleLikeInline(${post.id}, this.closest('.post-card'))">
          <i class="fa-regular fa-thumbs-up"></i> <span class="like-count">${post.likes || 0}</span>
        </div>
        <div class="post-action comment-btn" onclick="event.stopPropagation(); openPostDetail(${post.id})">
          <i class="fa-regular fa-comment"></i> <span class="comment-count">${post.comments || 0}</span>
        </div>
      </div>

    </div>
  `;
}
// Eventos após renderizar
function attachPostEvents() {
  document.querySelectorAll('.post-card').forEach(card => {
    const id = card.dataset.id;
    const likeBtn = card.querySelector('.like-btn');
    const commentBtn = card.querySelector('.comment-btn');
    const commentSection = card.querySelector('.comments-section');
    const commentInput = card.querySelector('.comment-input');
    const submitBtn = card.querySelector('.submit-comment');

    // Like sem recarregar
    likeBtn.onclick = (e) => {
      e.stopPropagation();
      toggleLikeInline(id, card);
    };

    // // Mostrar/ocultar comentários
    // commentBtn.onclick = (e) => {
    //   e.stopPropagation();
    //   if (commentSection.style.display === 'none') {
    //     commentSection.style.display = 'block';
    //     loadComments(id, card);
    //   } else {
    //     commentSection.style.display = 'none';
    //   }
    // };

    // // Enviar comentário
    // submitBtn.onclick = (e) => {
    //   e.stopPropagation();
    //   const text = commentInput.value.trim();
    //   if (!text) return;
    //   api.postComment(id, text).then(() => {
    //     commentInput.value = '';
    //     loadComments(id, card);
    //   });
    // };
  });
}

// Toggle Like sem recarregar o container
function toggleLikeInline(id, card) {
  const post = postsData.find(p => p.id == id);
  if (!post) return;
  post.liked = !post.liked;
  post.likes += post.liked ? 1 : -1;
  card.querySelector('.like-count').innerText = post.likes;
  // API call
  api.likePost(id).catch(() => {});
}

// // Carregar comentários
// async function loadComments(id, card) {
//   const commentsContainer = card.querySelector('.existing-comments');
//   try {
//     const comments = await api.getComments(id);
//     commentsContainer.innerHTML = comments.map(c => `
//       <div class="comment">
//         <img class="avatar" src="${c.avatar || 'assets/default.png'}">
//         <div><strong>${c.name}</strong> ${c.text}</div>
//       </div>
//     `).join('');
//     card.querySelector('.comment-count').innerText = comments.length;
//   } catch {
//     commentsContainer.innerHTML = '<em>Erro ao carregar comentários</em>';
//   }
// }

// Carregar posts + anexar eventos
async function loadPosts() {
  const container = document.getElementById('posts-container');
  if (!container) return;
  try {
    const posts = await api.getPosts();
    postsData = posts;
    container.innerHTML = posts.map(renderPostCard).join('');
    attachPostEvents();
  } catch {
    setTimeout(() => {
      postsData = mockPosts;
      container.innerHTML = mockPosts.map(renderPostCard).join('');
      attachPostEvents();
    }, 1200);
  }
}
async function openPostDetail(id) {
  const post = postsData.find(p => p.id === id);
  if (!post) return;

  const media = post.media || post.image;
  const isVid = isVideo(media);

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';

  modal.innerHTML = `
    <div class="modal post-detail">
      <div class="post-header">
        <div class="avatar">${post.author?.charAt(0)}</div>
        <div>
          <div class="post-author">${post.author}</div>
          <div class="post-time">${post.time || 'Agora'}</div>
        </div>
      </div>

      <div class="post-content">${post.content}</div>

      ${
        media
          ? isVid
            ? `<video src="http://localhost:3000/${media}" controls class="modal-video"></video>`
            : `<img src="http://localhost:3000/${media}" class="modal-image">`
          : ''
      }

      <div class="comments-section" style="margin-top:12px;">
        <div class="existing-comments">Carregando comentários...</div>
        <div style="display:flex; gap:6px; margin-top:8px;">
          <input type="text" class="comment-input" placeholder="Escreva um comentário..." style="flex:1; padding:6px 10px; border-radius:8px; border:1px solid var(--border);">
          <button class="submit-comment" style="padding:6px 12px; border:none; border-radius:8px; background:var(--primary); color:white; cursor:pointer;">Enviar</button>
        </div>
      </div>

      <div class="modal-actions">
        <button class="close-btn">Fechar</button>
      </div>
    </div>
  `;

  // Fechar modal clicando fora ou no botão
  modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
  modal.querySelector('.close-btn').onclick = () => modal.remove();

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden'; // bloqueia scroll

  // Restabelece scroll quando modal fechar
  const observer = new MutationObserver(() => {
    if (!document.body.contains(modal)) {
      document.body.style.overflow = '';
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true });

  const commentInput = modal.querySelector('.comment-input');
  const submitBtn = modal.querySelector('.submit-comment');
  const commentsContainer = modal.querySelector('.existing-comments');

async function loadComments() {
  try {
    const comments = await api.getComments(id);
    if (!Array.isArray(comments)) {
      console.warn('Comentários não são array:', comments);
      commentsContainer.innerHTML = '<em>Erro ao carregar comentários</em>';
      return;
    }

    commentsContainer.innerHTML = comments.map(c => `
      <div class="comment" style="display:flex; gap:8px; margin-bottom:6px; align-items:flex-start;">
        <img class="avatar" src="${c.avatar || 'assets/default.png'}" style="width:24px; height:24px; border-radius:50%;">
        <div><strong>${c.nome}</strong> ${c.text}</div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Erro ao carregar comentários:', err);
    commentsContainer.innerHTML = '<em>Erro ao carregar comentários</em>';
  }
}
  await loadComments();

  // Enviar comentário
  submitBtn.onclick = async () => {
    const text = commentInput.value.trim();
    if(!text) return;
    try {
      await api.addComment(id, text);
      commentInput.value = '';
      await loadComments();
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar comentário');
    }
  };
}

function toggleSound(video) {
  video.muted = !video.muted;
}

// //Mock posts for offline/demo
// const mockPosts = [
//   { id:1, author:'Secretaria Acadêmica', avatar:'assets/logo-dark.png', time:'Há 2 horas', content:'📢 As inscrições para o semestre 2026.2 já estão abertas!', image:true, likes:24, comments:8 },
//   { id:2, author:'Director', avatar:'CM', time:'Há 4 horas', content:'A prova de Matemática II foi remarcada para sexta-feira. Estudem os capítulos 5 a 8. 📚', likes:15, comments:12 },
//   { id:3, author:'Casty Program', avatar:'CP', time:'Há 6 horas', content:'🏆 Parabéns aos alunos da Olimpíada de Ciências! Resultados na próxima semana.', image:true, likes:45, comments:20 },
//   { id:4, author:'Biblioteca Central', avatar:'BC', time:'Há 8 horas', content:'📖 Novos livros disponíveis! Confira o acervo atualizado.', likes:18, comments:5 },
//   { id:5, author:'Prof Castigo', avatar:'assets/profile.png', time:'Há 1 dia', content:'🎉 Festa junina no dia 24! Preparem suas quadrilhas!', image:true, likes:67, comments:32 },
// ];
let postsData = [];


// async function loadPosts() {
//   const container = document.getElementById('posts-container');
//   if (!container) return;
//   try {
//     const posts = await api.getPosts();
//     container.innerHTML = posts.map(renderPostCard).join('');
//   } catch {
//     // Fallback to mock data
//     setTimeout(() => {
//       container.innerHTML = mockPosts.map(renderPostCard).join('');
//     }, 1200);
//   }
// }

// ///let postsData = [...mockPosts];
function toggleLike(id) {
  const post = postsData.find(p => p.id === id);
  if (post) { post.liked = !post.liked; post.likes += post.liked ? 1 : -1; }
  api.likePost(id).catch(() => {});
  const container = document.getElementById('posts-container');
  if (container) container.innerHTML = postsData.map(renderPostCard).join('');
}
// function openPostDetail(id) {
//   const post = postsData.find(p => p.id === id);
//   if (!post) return;

//   const media = post.media || post.image;

//   const modal = document.createElement('div');
//   modal.className = 'modal-overlay';

//   modal.innerHTML = `
//     <div class="modal post-detail">

//       <div class="post-header">
//         <div class="avatar">${post.author?.charAt(0)}</div>
//         <div>
//           <div class="post-author">${post.author}</div>
//           <div class="post-time">${post.time}</div>
//         </div>
//       </div>

//       <div class="post-content">${post.content}</div>

//       ${
//         media
//           ? isVideo(media)
//             ? `<video src="http://localhost:3000/${media}" controls style="width:100%"></video>`
//             : `<img src="http://localhost:3000/${media}" style="width:100%">`
//           : ''
//       }

//       <div class="modal-actions">
//         <button onclick="this.closest('.modal-overlay').remove()">Fechar</button>
//       </div>

//     </div>
//   `;

//   modal.onclick = (e) => {
//     if (e.target === modal) modal.remove();
//   };

//   document.body.appendChild(modal);
// }

// ===== DADOS PAGE =====
function renderDadosPage() {
  return `
    <div class="max-width">
      <div class="dados-tabs">
        <div class="dados-tab active" data-tab="conta">Conta</div>
        <div class="dados-tab" data-tab="notas">Notas</div>
        <div class="dados-tab" data-tab="mensalidade">Mensalidade</div>
        <div class="dados-tab" data-tab="horario">Horário</div>
      </div>
      <div class="dados-content" id="dados-content">
        ${renderContaTab()}
      </div>
    </div>
  `;
}

function renderContaTab() {
  const u = api.user || {
    nome: 'Aluno Demo',
    codigo: '260001',
    email: 'aluno@escola.com',
    turma_nome: 'Turma MCA'
  };

  return `
    <h3 style="margin-bottom:16px">Minha Conta</h3>
    <div class="info-grid">
      <div class="info-item"><span class="info-label">Nome</span><span class="info-value">${u.nome}</span></div>
      <div class="info-item"><span class="info-label">Email</span><span class="info-value">${u.email || 'Não informado'}</span></div>
      <div class="info-item"><span class="info-label">Matrícula</span><span class="info-value">${u.codigo}</span></div>
      <div class="info-item"><span class="info-label">Turma</span><span class="info-value">${u.turma_nome || 'Não informado'}</span></div>
      <div class="info-item"><span class="info-label">Turno</span><span class="info-value">Manhã</span></div>
    </div>
  `;
}

function renderNotasTab(notas) {
  if (!Array.isArray(notas) || notas.length === 0) {
    return `<p>Não há notas disponíveis.</p>`;
  }

  // Calcula média, média final e resultado
  notas.forEach(n => {
    const n1 = n.n1 ?? 0;
    const n2 = n.n2 ?? 0;
    const n3 = n.n3 ?? 0;
    const n4 = n.n4 ?? 0;
   
    const  curso_nome = n.curso_nome ?? 'Verificando...'
    const exame = n.exame ?? null;

    // Média das notas
   const notasValidas = [n.n1, n.n2, n.n3, n.n4]
  .map(x => Number(x))
  .filter(x => !isNaN(x) && x > 0);
 const soma = notasValidas.reduce((a, b) => a + b, 0);
const media = notasValidas.length > 0 ? soma / notasValidas.length : 0;

n.media = notasValidas.length > 0 ? media.toFixed(1) : '-';

    // Média final considerando exame
  if (notasValidas.length === 0) {
  n.resultado = 'Sem notas';
  n.mediaFinal = '-';

} else if (media >= 10) {
  n.resultado = 'Aprovado';
  n.mediaFinal = n.media;

} else {
  if (!exame || exame == 0) {
    n.resultado = 'Reprovado';
    n.mediaFinal = n.media;
  } else {
    const mediaFinal = (media + Number(exame)) / 2;
    n.mediaFinal = mediaFinal.toFixed(1);
    n.resultado = mediaFinal >= 10 ? 'Aprovado' : 'Reprovado';
  }
}

  });

  return `
    <h3 style="margin-bottom:16px">Minhas Notas</h3>
     <div class="data-table-wrapper">
    <div style="overflow-x:auto; max-width: 100%;">
      <table class="data-table" style="width:100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th>Curso</th>
            <th>1º Nota</th>
            <th>2º Nota</th>
            <th>3º Nota</th>
            <th>4º Nota</th>
            <th>Média</th>
          </tr>
        </thead>
        <tbody>
          ${notas.map(n => `
            <tr>
              <td>${n.curso_nome ?? 'Verificando...'}</td>
              <td style="${corNota(n.n1)}">${n.n1 ?? '—'}</td>
              <td style="${corNota(n.n2)}">${n.n2 ?? '—'}</td>
              <td style="${corNota(n.n3)}">${n.n3 ?? '—'}</td>
              <td style="${corNota(n.n4)}">${n.n4 ?? '—'}</td>
              <td>${n.media ?? '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
     </div>

    <div style="margin-top:16px;">
      ${notas.map(n => `
       <p class="exame"><strong>Exame:</strong> ${n.exame ?? '-'}</p>
<p class="${n.resultado.toLowerCase()}"><strong>Resultado:</strong> ${n.resultado}</p>
<p><strong>Média Final:</strong> ${n.mediaFinal}</p>
        <hr>
      `).join('')}
    </div>
  `;
}

// Função para colorir as notas
function corNota(nota) {
  if (nota === null || nota === undefined) return '';
  if (nota < 10) return 'background-color: #f8d7da;'; // vermelho
  if (nota < 14) return 'background-color: #d1ecf1;'; // azul
  return 'background-color: #d4edda;'; // verde
}

async function renderMensalidadeTab(mensalidades) {
  try {
    let linhas = '';

    if (!Array.isArray(mensalidades) || mensalidades.length === 0) {
      linhas = `<tr><td colspan="4">Sem mensalidades disponíveis.</td></tr>`;
    } else {
      linhas = mensalidades.map(m => {
        const valor = Number(m.valor || 0).toFixed(2);
        const data = m.data_pagamento ? new Date(m.data_pagamento).toLocaleDateString() : '-';
        const status = (m.status_pagamento || '').toLowerCase();
        let statusClass = 'pendente', statusText = 'Pendente';
        if (status === 'pago') { statusClass='pago'; statusText='Pago'; }
        else if (status === 'atrasado') { statusClass='atrasado'; statusText='Atrasado'; }
        return `
          <tr>
            <td>${m.mes || m.mes_referencia || '-'}</td>
            <td>${valor} <span style="font-size:0.6rem;">MZN</span></td>
            <td>${data}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
          </tr>`;
      }).join('');
    }

    return `
      <h3 style="margin-bottom:16px">Mensalidades</h3>
       <div class="data-table-wrapper">
      <div style="overflow-x:auto">
        <table class="data-table">
          <thead>
            <tr><th>Mês</th><th>Valor</th><th>Vencimento</th><th>Status</th></tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
      </div>`;
  } catch (err) {
    console.error('Erro ao carregar mensalidades:', err);
    return `<p style="color:red;">Erro ao carregar mensalidades.</p>`;
  }
}
function renderHorarioTab(horario) {
  let tabela = `
    <h3>Horário Semanal</h3>
     <div class="data-table-wrapper">
    <table class="data-table">
      <thead>
        <tr>
          <th>Dia</th>
          <th>Hora Início</th>
          <th>Hora Fim</th>
        </tr>
      </thead>
      <tbody>
       </div>
  `;

  const dias = ['Segunda','Terça','Quarta','Quinta','Sexta'];
  dias.forEach(dia => {
    const info = horario[dia] || {};
    const ativo = info.ativo === '1';
    tabela += `
      <tr>
        <td>${dia}</td>
        <td>${ativo ? info.inicio : '-'}</td>
        <td>${ativo ? info.fim : '-'}</td>
      </tr>
    `;
  });

  tabela += `</tbody></table>`;
  return tabela;
}

async function initDadosTabs() {
  document.querySelectorAll('.dados-tab').forEach(tab => {
    tab.addEventListener('click', async () => {
      document.querySelectorAll('.dados-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const content = document.getElementById('dados-content');
      const tabName = tab.dataset.tab;

      if (tabName === 'conta') {
        content.innerHTML = renderContaTab();
      } else if (tabName === 'notas') {
        // Mostra um loading enquanto busca
        content.innerHTML = '<p>Carregando notas...</p>';
        try {
          const notas = await api.getNotas(); // rota GET /notas
          content.innerHTML = renderNotasTab(notas);
        } catch (err) {
          console.error(err);
          content.innerHTML = '<p>Erro ao carregar notas.</p>';
        }
      }else if (tabName === 'mensalidade') {
  content.innerHTML = '<p>Carregando mensalidades...</p>';
  try {
    const mensalidades = await api.getMensalidades();
    content.innerHTML = await renderMensalidadeTab(mensalidades);
  } catch (err) {
    console.error(err);
    content.innerHTML = `<p>Erro ao carregar mensalidades: ${err.message}</p>`;
  }
} else if (tabName === 'horario') {
  content.innerHTML = '<p>Carregando horário...</p>';
  try {
    const res = await api.getHorario(); // pega dados do back-end
    const horarioJSON = res.horario;    // supondo que a API devolve { horario: [...] }
    content.innerHTML = renderHorarioTab(horarioJSON);
  } catch (err) {
    console.error('Erro ao carregar horário:', err);
    content.innerHTML = '<p style="color:red;">Erro ao carregar horário.</p>';
  }
}
    });
  });
}
