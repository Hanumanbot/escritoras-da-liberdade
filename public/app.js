/**
 * Escritoras da Liberdade - Projeto Baobá
 * Plataforma Popular de Ensino para Pessoas Pretas
 * Sala Online até 100 Participantes, Escrevivência, Desempenho e Pagamento de Bolsas.
 */

// Application State
const state = {
  currentRole: 'aluno', // 'aluno' (Educanda), 'professor' (Educadora), 'master' (Coordenação Baobá)
  currentTenantId: 'tenant-baoba-salvador',
  currentUserId: 'aluno-marielle',
  activeTab: 'alunoTabDesempenho',
  classroom: {
    id: 'sala-escrevivencia-100',
    title: 'Oficina Magna Ao Vivo: Escrevivência, Memória e Narrativas de Resistência',
    subject: 'Literatura Negra & Escrevivência',
    professorName: 'Profa. Me. Dandara Nascimento',
    participantsCount: 84, // 84 educandas conectadas out of 100
    isMuted: true,
    isVideoOn: false,
    isScreenSharing: false,
    activeMode: 'grid', // 'grid', 'whiteboard', 'jitsi'
    handRaised: false,
    page: 1,
    pageSize: 12,
    messages: [],
    handRaises: [],
    participants: []
  },
  currentExam: null,
  examAnswers: {},
  performanceChart: null
};

// Generate 84-100 realistic Black women writers, scholars, and students for the live classroom
function generateParticipants(count = 84) {
  const names = [
    "Marielle Oliveira", "Esperança Garcia", "Aqualtune Silva", "Anita Sacramento", "Dandara Santos",
    "Carolina de Jesus", "Luísa Mahin", "Beatriz Nascimento", "Conceição Evaristo", "Lélia Gonzalez",
    "Maria Firmina dos Reis", "Sueli Carneiro", "Tereza de Benguela", "Elza Soares Ribeiro", "Leci Brandão",
    "Jovelina Pérola Negra", "Glória Maria", "Taís Araújo Souza", "Zezé Motta", "Ruth de Souza",
    "Benedita da Silva", "Djamila Ribeiro", "Eliane Potiguara", "Geni Guimarães", "Miriam Alves",
    "Cristiane Sobral", "Lia de Itamaracá", "Dona Ivone Lara", "Clementina de Jesus", "Marcela Silva",
    "Tainá Ramos", "Nayara Santos", "Camila Pitanga Costa", "Izaura Pereira", "Valquíria Souza",
    "Roberta Estrela D'Alva", "Ana Maria Gonçalves", "Katiuscia Ribeiro", "Jaqueline Gomes de Jesus", "Cidinha da Silva",
    "Vilma Reis", "Makota Valdina", "Mãe Stella de Oxóssi", "Mãe Menininha", "Aline Djokic",
    "Fernanda Miranda", "Lúcia Xavier", "Winnie Bueno", "Juliana Borges", "Stephanie Ribeiro",
    "Giovana Xavier", "Larissa Luz", "Gaby Amarantos", "Juçara Marçal", "Fabiana Cozza",
    "Ellen Oléria", "Liniker de Barros", "Raquel Virgínia", "Assucena Assucena", "Xênia França",
    "Luedji Luna", "Bia Ferreira", "Doralyce Gonzaga", "Preta Rara", "Katú Mirim",
    "Mel Duarte", "Linn da Quebrada", "Mc Soffia", "Tássia Reis", "Yzalú Carvalho",
    "Jéssica Ellen", "Pathy Dejesus", "Sheron Menezzes", "Erika Januza", "Cris Vianna",
    "Zezé Polessa", "Aílton Krenak (Convidado)", "Silvio Almeida (Convidado)", "Kabengele Munanga (Convidado)",
    "Nei Lopes (Convidado)", "Muniz Sodré (Convidado)", "Moisés Patrício", "Rosana Paulino", "Castiel Vitorino"
  ];

  return names.slice(0, count).map((name, index) => {
    return {
      id: `p-${index + 1}`,
      name: name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&skinColor=darkBrown,brown,yellow`,
      role: index === 0 ? 'Monitora' : 'Educanda',
      isSpeaking: index === 1 || index === 4,
      isMuted: index !== 1 && index !== 4,
      isVideo: index % 2 === 0,
      handRaised: index === 0 || index === 2
    };
  });
}

document.addEventListener("DOMContentLoaded", () => {
  state.classroom.participants = generateParticipants(84);
  initApp();
});

async function initApp() {
  setupEventListeners();
  updateHeaderTenant();
  updateHeaderRole();
  await loadRoleView();
}

function setupEventListeners() {
  const tenantSelect = document.getElementById("tenantSelect");
  if (tenantSelect) {
    tenantSelect.addEventListener("change", (e) => {
      state.currentTenantId = e.target.value;
      updateHeaderTenant();
      loadRoleView();
    });
  }
}

function updateHeaderTenant() {
  const tenantNames = {
    'tenant-baoba-salvador': { name: 'Polo Dandara dos Palmares (Salvador - BA)', badge: 'DANDARA' },
    'tenant-baoba-sp': { name: 'Núcleo Carolina Maria de Jesus (São Paulo - SP)', badge: 'CAROLINA' },
    'tenant-baoba-rj': { name: 'Polo Lélia Gonzalez (Rio de Janeiro - RJ)', badge: 'LÉLIA' }
  };

  const t = tenantNames[state.currentTenantId] || tenantNames['tenant-baoba-salvador'];
  document.getElementById("tenantNameHeader").textContent = t.name;
  document.getElementById("tenantBadgeHeader").textContent = t.badge;
  document.getElementById("tenantSelect").value = state.currentTenantId;
}

function setRole(role) {
  state.currentRole = role;
  
  if (role === 'aluno') {
    state.currentUserId = 'aluno-marielle';
  } else if (role === 'professor') {
    state.currentUserId = 'prof-dandara';
  } else {
    state.currentUserId = 'user-master-baoba';
  }

  updateHeaderRole();
  loadRoleView();
}

function updateHeaderRole() {
  document.querySelectorAll(".role-pill").forEach(btn => {
    btn.classList.remove("active");
    btn.classList.add("text-stone-400");
  });

  const btnMap = {
    aluno: "roleBtnAluno",
    professor: "roleBtnProfessor",
    master: "roleBtnMaster"
  };

  const activeBtn = document.getElementById(btnMap[state.currentRole]);
  if (activeBtn) {
    activeBtn.classList.add("active");
    activeBtn.classList.remove("text-stone-400");
  }

  const nameEl = document.getElementById("userNameDisplay");
  const roleEl = document.getElementById("userRoleDisplay");
  const avatarEl = document.getElementById("userAvatar");

  if (state.currentRole === 'aluno') {
    nameEl.textContent = "Marielle Oliveira";
    roleEl.textContent = "Educanda de Literatura";
    avatarEl.src = "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150";
  } else if (state.currentRole === 'professor') {
    nameEl.textContent = "Profa. Me. Dandara Nascimento";
    roleEl.textContent = "Educadora de Escrevivência";
    avatarEl.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
  } else {
    nameEl.textContent = "Coordenação Geral (Baobá)";
    roleEl.textContent = "Gestão de Editais e Fomento";
    avatarEl.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150";
  }

  renderNavigationTabs();
}

function renderNavigationTabs() {
  const tabsContainer = document.getElementById("navigationTabs");
  const quickActionContainer = document.getElementById("headerQuickAction");

  if (state.currentRole === 'aluno') {
    tabsContainer.innerHTML = `
      <button onclick="switchTab('alunoTabDesempenho')" id="tab_alunoTabDesempenho" class="tab-btn active px-4 py-2 text-xs font-bold rounded-lg text-stone-300 hover:text-white transition flex items-center gap-2">
        <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        Meu Desempenho & Memoriais
      </button>
      <button onclick="switchTab('alunoTabProvas')" id="tab_alunoTabProvas" class="tab-btn px-4 py-2 text-xs font-bold rounded-lg text-stone-400 hover:text-white transition flex items-center gap-2">
        <svg class="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
        Produções Textuais & Ensaios
      </button>
      <button onclick="switchTab('alunoTabSala')" id="tab_alunoTabSala" class="tab-btn px-4 py-2 text-xs font-bold rounded-lg text-stone-400 hover:text-white transition flex items-center gap-2">
        <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        Oficina Ao Vivo (84/100 Educandas)
      </button>
    `;
    quickActionContainer.innerHTML = `
      <button onclick="switchTab('alunoTabSala')" class="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/30 transition">
        <span class="w-2 h-2 rounded-full bg-stone-950 animate-ping"></span>
        Entrar na Oficina Ao Vivo
      </button>
    `;
    state.activeTab = 'alunoTabDesempenho';
  } else if (state.currentRole === 'professor') {
    tabsContainer.innerHTML = `
      <button onclick="switchTab('profTabSala')" id="tab_profTabSala" class="tab-btn active px-4 py-2 text-xs font-bold rounded-lg text-stone-300 hover:text-white transition flex items-center gap-2">
        <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        Sala de Aula Host (100 Vagas)
      </button>
      <button onclick="switchTab('profTabCorrecao')" id="tab_profTabCorrecao" class="tab-btn px-4 py-2 text-xs font-bold rounded-lg text-stone-400 hover:text-white transition flex items-center gap-2">
        <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
        Avaliar Produções & Ensaios
      </button>
      <button onclick="switchTab('profTabRelatorios')" id="tab_profTabRelatorios" class="tab-btn px-4 py-2 text-xs font-bold rounded-lg text-stone-400 hover:text-white transition flex items-center gap-2">
        <svg class="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        Prestação de Contas (Relatórios)
      </button>
    `;
    quickActionContainer.innerHTML = `
      <button onclick="openSubmitReportModal()" class="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/30 transition">
        + Lançar Relatório Mensal
      </button>
    `;
    state.activeTab = 'profTabSala';
  } else {
    // Master Baobá
    tabsContainer.innerHTML = `
      <button onclick="switchTab('masterTabFinanceiro')" id="tab_masterTabFinanceiro" class="tab-btn active px-4 py-2 text-xs font-bold rounded-lg text-stone-300 hover:text-white transition flex items-center gap-2">
        <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        Acompanhamento & Liberação de Pagamentos
      </button>
      <button onclick="switchTab('masterTabTenants')" id="tab_masterTabTenants" class="tab-btn px-4 py-2 text-xs font-bold rounded-lg text-stone-400 hover:text-white transition flex items-center gap-2">
        <svg class="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
        Polos Regionais Baobá
      </button>
    `;
    quickActionContainer.innerHTML = `
      <button onclick="renderMasterReports()" class="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/30 transition">
        Auditar e Liberar Bolsas
      </button>
    `;
    state.activeTab = 'masterTabFinanceiro';
  }
}

function switchTab(tabId) {
  state.activeTab = tabId;

  document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.add("hidden"));
  const targetPane = document.getElementById(tabId);
  if (targetPane) targetPane.classList.remove("hidden");

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("active");
    btn.classList.add("text-stone-400");
  });
  const activeTabBtn = document.getElementById(`tab_${tabId}`);
  if (activeTabBtn) {
    activeTabBtn.classList.add("active");
    activeTabBtn.classList.remove("text-stone-400");
  }

  if (tabId === 'alunoTabDesempenho') {
    renderStudentPerformance();
  } else if (tabId === 'alunoTabProvas') {
    renderStudentActivities();
  } else if (tabId === 'alunoTabSala') {
    renderClassroom(false);
  } else if (tabId === 'profTabSala') {
    renderClassroom(true);
  } else if (tabId === 'profTabCorrecao') {
    renderProfSubmissions();
  } else if (tabId === 'profTabRelatorios') {
    renderProfReports();
  } else if (tabId === 'masterTabFinanceiro') {
    renderMasterReports();
  } else if (tabId === 'masterTabTenants') {
    renderMasterTenants();
  }
}

async function loadRoleView() {
  document.querySelectorAll(".role-container").forEach(c => c.classList.add("hidden"));

  if (state.currentRole === 'aluno') {
    document.getElementById("alunoContainer").classList.remove("hidden");
    switchTab('alunoTabDesempenho');
  } else if (state.currentRole === 'professor') {
    document.getElementById("professorContainer").classList.remove("hidden");
    switchTab('profTabSala');
  } else {
    document.getElementById("masterContainer").classList.remove("hidden");
    switchTab('masterTabFinanceiro');
  }
}

/* ========================================================================= */
/* EDUCANDA: DESEMPENHO E ATIVIDADES                                         */
/* ========================================================================= */

async function renderStudentPerformance() {
  try {
    const res = await fetch(`/api/student/performance?aluno_id=${state.currentUserId}`);
    const json = await res.json();
    if (!json.success) return;

    const data = json.data;
    document.getElementById("alunoAvgScore").textContent = data.metrics.average_grade;
    document.getElementById("alunoAttendance").textContent = `${data.metrics.attendance_rate}%`;
    document.getElementById("alunoTasksCount").textContent = `${data.metrics.activities_completed} Entregues`;

    const feedbackList = document.getElementById("alunoFeedbackList");
    feedbackList.innerHTML = "";
    
    const graded = data.submissions.filter(s => s.feedback);
    if (graded.length === 0) {
      feedbackList.innerHTML = `<p class="text-xs text-stone-500">Nenhum parecer recebido ainda.</p>`;
    } else {
      graded.forEach(s => {
        const item = document.createElement("div");
        item.className = "bg-stone-800/60 border border-amber-900/40 rounded-2xl p-3.5 space-y-1.5";
        item.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-amber-300">${s.activity_title}</span>
            <span class="px-2 py-0.5 rounded text-[11px] font-black bg-emerald-500/20 text-emerald-400">Nota: ${s.score.toFixed(1)}</span>
          </div>
          <p class="text-[11px] text-stone-200 leading-relaxed italic">"${s.feedback}"</p>
          <div class="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-700/40">
            <span class="font-semibold text-amber-400">${s.professor_name}</span>
            <span>${s.graded_at ? s.graded_at.split(' ')[0] : 'Avaliado'}</span>
          </div>
        `;
        feedbackList.appendChild(item);
      });
    }

    renderPerformanceChart(data.chart_data.subjects, data.chart_data.grades);
  } catch (err) {
    console.error("Error loading performance:", err);
  }
}

function renderPerformanceChart(labels, values) {
  const ctx = document.getElementById("studentPerformanceChart");
  if (!ctx) return;

  if (state.performanceChart) {
    state.performanceChart.destroy();
  }

  state.performanceChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Aproveitamento Acadêmico (0 a 10.0)',
        data: values,
        backgroundColor: [
          'rgba(217, 119, 6, 0.9)',
          'rgba(234, 88, 12, 0.9)',
          'rgba(245, 158, 11, 0.9)',
          'rgba(16, 185, 129, 0.9)',
          'rgba(180, 83, 9, 0.9)'
        ],
        borderRadius: 10,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          min: 0,
          max: 10,
          grid: { color: 'rgba(68, 64, 60, 0.3)' },
          ticks: { color: '#a8a29e' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#fef3c7', font: { size: 11, weight: 'bold' } }
        }
      }
    }
  });
}

async function renderStudentActivities() {
  const container = document.getElementById("alunoActivitiesGrid");
  container.innerHTML = `<div class="col-span-full text-center py-8 text-stone-400">Carregando ensaios e atividades...</div>`;

  try {
    const res = await fetch(`/api/student/activities?aluno_id=${state.currentUserId}`);
    const json = await res.json();
    if (!json.success) return;

    container.innerHTML = "";

    json.activities.forEach(act => {
      const card = document.createElement("div");
      card.className = "bg-stone-900 border border-stone-800 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/40 transition shadow-sm";
      
      const isGraded = act.submission_status === 'corrigido';
      const isPending = act.submission_status === 'pendente';
      const isDone = isGraded || isPending;

      let statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Disponível para Resolução</span>`;
      if (isGraded) {
        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Nota: ${act.user_score} / ${act.max_score}</span>`;
      } else if (isPending) {
        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">Em Análise Pedagógica</span>`;
      }

      card.innerHTML = `
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs uppercase tracking-wider text-amber-400 font-extrabold">${act.type.toUpperCase()}</span>
            ${statusBadge}
          </div>
          <h3 class="text-base font-bold text-white line-clamp-2">${act.title}</h3>
          <p class="text-xs text-stone-400">${act.subject}</p>
          <div class="flex items-center gap-2 text-xs text-stone-400 pt-2 border-t border-stone-800">
            <span>Educadora: ${act.professor_name}</span>
            <span>•</span>
            <span>Prazo: ${act.due_date}</span>
          </div>
        </div>
        <div class="pt-4 mt-4 border-t border-stone-800/80 flex items-center justify-between">
          <span class="text-xs font-bold text-stone-300">Valor: ${act.max_score} pts</span>
          <button onclick='openExamModal(${JSON.stringify(act)})' class="px-4 py-2 rounded-xl ${isDone ? 'bg-stone-800 hover:bg-stone-700 text-stone-300' : 'bg-amber-600 hover:bg-amber-500 text-stone-950 font-black'} text-xs transition">
            ${isDone ? 'Ver Texto / Refazer' : 'Escrever Ensaio Agora →'}
          </button>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading student activities:", err);
  }
}

function openExamModal(activity) {
  state.currentExam = activity;
  state.examAnswers = {};

  document.getElementById("examModalBadge").textContent = activity.type.toUpperCase();
  document.getElementById("examModalTitle").textContent = activity.title;
  document.getElementById("examModalMeta").textContent = `${activity.professor_name} • ${activity.subject} • Valor: ${activity.max_score} pts`;

  const qContainer = document.getElementById("examModalQuestionsList");
  qContainer.innerHTML = "";

  if (activity.questions && activity.questions.length > 0) {
    activity.questions.forEach((q, idx) => {
      const qDiv = document.createElement("div");
      qDiv.className = "bg-stone-800/40 border border-stone-800 rounded-2xl p-4 space-y-3";
      
      let optionsHtml = "";
      q.options.forEach((opt, optIdx) => {
        optionsHtml += `
          <label class="flex items-start gap-3 p-3 rounded-xl border border-stone-700/60 hover:bg-stone-800/80 cursor-pointer transition">
            <input type="radio" name="question_${q.id}" value="${optIdx}" onchange="recordExamAnswer('${q.id}', ${optIdx})" class="mt-0.5 text-amber-600 focus:ring-amber-500">
            <span class="text-xs text-stone-200">${opt}</span>
          </label>
        `;
      });

      qDiv.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-amber-400">Questão ${idx + 1} de ${activity.questions.length}</span>
          <span class="text-[11px] text-stone-400 font-semibold">${q.weight || 2.5} pontos</span>
        </div>
        <p class="text-xs font-semibold text-stone-100">${q.text}</p>
        <div class="space-y-2 pt-1">
          ${optionsHtml}
        </div>
      `;
      qContainer.appendChild(qDiv);
    });
  }

  // Open essay area
  const essayDiv = document.createElement("div");
  essayDiv.className = "bg-stone-800/40 border border-stone-800 rounded-2xl p-4 space-y-2";
  essayDiv.innerHTML = `
    <span class="text-xs font-bold text-amber-400">Texto Argumentativo & Memorial de Escrevivência</span>
    <textarea id="examOpenText" rows="4" class="w-full bg-stone-900 border border-stone-700 rounded-xl p-3 text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="Escreva aqui suas reflexões, vivências e considerações sobre a temática da oficina..."></textarea>
  `;
  qContainer.appendChild(essayDiv);

  document.getElementById("examModal").classList.remove("hidden");
}

function recordExamAnswer(qId, optionIdx) {
  state.examAnswers[qId] = optionIdx;
}

function closeExamModal() {
  document.getElementById("examModal").classList.add("hidden");
}

async function submitExamAnswers() {
  if (!state.currentExam) return;

  const openText = document.getElementById("examOpenText") ? document.getElementById("examOpenText").value : "";
  state.examAnswers["memorial_texto"] = openText;

  try {
    const res = await fetch("/api/student/submit-activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activity_id: state.currentExam.id,
        aluno_id: state.currentUserId,
        tenant_id: state.currentTenantId,
        answers: state.examAnswers
      })
    });
    const json = await res.json();
    if (json.success) {
      alert(`Parabéns, companheira! Produção textual submetida com sucesso.\nNota estimada: ${json.score} pts.\nEnviada para o parecer final da educadora.`);
      closeExamModal();
      renderStudentActivities();
      renderStudentPerformance();
    }
  } catch (err) {
    alert("Erro ao enviar produção: " + err.message);
  }
}


/* ========================================================================= */
/* SALA DE AULA ONLINE (100 PARTICIPANTES, WEBRTC, QUADRO, CHAT, MÃOS)      */
/* ========================================================================= */

function renderClassroom(isHost) {
  const targetWrapperId = isHost ? "classroomHostWrapper" : "classroomStudentWrapper";
  const wrapper = document.getElementById(targetWrapperId);
  if (!wrapper) return;

  const currentParticipants = state.classroom.participants;
  const startIdx = (state.classroom.page - 1) * state.classroom.pageSize;
  const totalPages = Math.ceil(currentParticipants.length / state.classroom.pageSize);

  wrapper.innerHTML = `
    <div class="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[750px]">
      
      <!-- Classroom Top Bar -->
      <div class="p-4 bg-stone-950/80 border-b border-stone-800 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping"></div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-black text-white">${state.classroom.title}</h2>
              <span class="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">AO VIVO</span>
            </div>
            <p class="text-xs text-stone-400">${state.classroom.professorName} • ${state.classroom.subject}</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="bg-stone-800/80 border border-stone-700/60 rounded-xl p-1 flex items-center text-xs">
            <button onclick="setClassroomMode('grid')" class="px-3 py-1 rounded-lg font-bold ${state.classroom.activeMode === 'grid' ? 'bg-amber-600 text-stone-950' : 'text-stone-400 hover:text-white'}">
              👥 Mosaico (100)
            </button>
            <button onclick="setClassroomMode('whiteboard')" class="px-3 py-1 rounded-lg font-bold ${state.classroom.activeMode === 'whiteboard' ? 'bg-amber-600 text-stone-950' : 'text-stone-400 hover:text-white'}">
              ✏️ Quadro de Escrita
            </button>
            <button onclick="setClassroomMode('jitsi')" class="px-3 py-1 rounded-lg font-bold ${state.classroom.activeMode === 'jitsi' ? 'bg-amber-600 text-stone-950' : 'text-stone-400 hover:text-white'}">
              🎥 WebRTC Sala Real
            </button>
          </div>

          <div class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-300">
            <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            <span>84 / 100 Conectadas</span>
          </div>
        </div>
      </div>

      <!-- Main Stage & Chat Panel -->
      <div class="flex-1 flex flex-col lg:flex-row min-h-[550px]">
        
        <!-- Left: Stage -->
        <div class="flex-1 p-4 bg-stone-950/40 flex flex-col justify-between">
          <div id="classroomStageArea" class="flex-1"></div>

          ${state.classroom.activeMode === 'grid' ? `
            <div class="pt-3 flex items-center justify-between text-xs text-stone-400 border-t border-stone-800/80 mt-2">
              <span>Exibindo ${startIdx + 1}-${Math.min(startIdx + state.classroom.pageSize, currentParticipants.length)} de ${currentParticipants.length} educandas conectadas</span>
              <div class="flex items-center gap-2">
                <button onclick="changeClassroomPage(-1)" ${state.classroom.page === 1 ? 'disabled class="opacity-40 cursor-not-allowed"' : 'class="hover:text-white"'} class="px-2.5 py-1 bg-stone-800 rounded-lg">Anterior</button>
                <span class="font-bold text-amber-400">Página ${state.classroom.page} de ${totalPages}</span>
                <button onclick="changeClassroomPage(1)" ${state.classroom.page === totalPages ? 'disabled class="opacity-40 cursor-not-allowed"' : 'class="hover:text-white"'} class="px-2.5 py-1 bg-stone-800 rounded-lg">Próxima</button>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Right Side: Chat & Fila de Mãos Levantadas -->
        <div class="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-stone-800 bg-stone-900/90 flex flex-col">
          
          <div class="p-3.5 border-b border-stone-800 flex items-center justify-between text-xs">
            <span class="font-extrabold text-white flex items-center gap-1.5">
              💬 Roda de Diálogo & Dúvidas
            </span>
            <span id="handRaisesBadge" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              1 Mão Levantada
            </span>
          </div>

          <div id="classroomHandsList" class="p-3 bg-amber-950/30 border-b border-stone-800 space-y-2">
            <div class="flex items-center justify-between text-[11px] text-amber-300 font-bold">
              <span>✋ Fila de Fala / Dúvidas:</span>
            </div>
            <div id="handsQueueItems" class="space-y-1.5 max-h-24 overflow-y-auto"></div>
          </div>

          <div id="classroomMessagesStream" class="flex-1 p-3 overflow-y-auto space-y-3 text-xs max-h-[380px]"></div>

          <div class="p-3 border-t border-stone-800 bg-stone-950/60 flex items-center gap-2">
            <input type="text" id="classroomMsgInput" onkeydown="if(event.key==='Enter') sendClassroomMessage()" placeholder="Compartilhe sua reflexão com a roda..." class="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500">
            <button onclick="sendClassroomMessage()" class="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-black text-xs transition">
              Enviar
            </button>
          </div>

        </div>

      </div>

      <!-- Bottom Control Bar -->
      <div class="p-3.5 bg-stone-950 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
        
        <div class="flex items-center gap-2">
          <button onclick="toggleClassroomMic()" id="btnClassroomMic" class="px-3.5 py-2 rounded-xl text-xs font-bold ${state.classroom.isMuted ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'} flex items-center gap-1.5 transition">
            ${state.classroom.isMuted ? '🔇 Microfone Mutado' : '🎙️ Microfone Aberto'}
          </button>
          <button onclick="toggleClassroomVideo()" id="btnClassroomVideo" class="px-3.5 py-2 rounded-xl text-xs font-bold ${!state.classroom.isVideoOn ? 'bg-stone-800 text-stone-300 hover:bg-stone-700' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'} flex items-center gap-1.5 transition">
            ${state.classroom.isVideoOn ? '📹 Câmera Ativa' : '📷 Abrir Câmera'}
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="toggleRaiseHand()" id="btnRaiseHand" class="px-4 py-2 rounded-xl text-xs font-bold ${state.classroom.handRaised ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'} flex items-center gap-2 transition">
            ✋ ${state.classroom.handRaised ? 'Baixar Minha Mão' : 'Levantar a Mão (Pedir a Palavra)'}
          </button>
        </div>

        ${isHost ? `
          <div class="flex items-center gap-2 border-l border-stone-800 pl-3">
            <button onclick="hostMuteAll()" class="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition">
              🚫 Mutar Todas (84)
            </button>
            <button onclick="hostShareScreen()" class="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-black transition">
              🖥️ Compartilhar Texto
            </button>
            <button onclick="hostLaunchPoll()" class="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition">
              📊 Roda de Votação
            </button>
          </div>
        ` : `
          <div class="text-[11px] text-stone-400">
            Escritoras da Liberdade • Espaço de Acolhimento e Escuta Coletiva
          </div>
        `}

      </div>

    </div>
  `;

  renderStageArea(isHost);
  loadClassroomMessages();
  loadHandRaises();
}

function setClassroomMode(mode) {
  state.classroom.activeMode = mode;
  renderClassroom(state.currentRole === 'professor');
}

function changeClassroomPage(delta) {
  const totalPages = Math.ceil(state.classroom.participants.length / state.classroom.pageSize);
  const newPage = state.classroom.page + delta;
  if (newPage >= 1 && newPage <= totalPages) {
    state.classroom.page = newPage;
    renderClassroom(state.currentRole === 'professor');
  }
}

function renderStageArea(isHost) {
  const container = document.getElementById("classroomStageArea");
  if (!container) return;

  if (state.classroom.activeMode === 'grid') {
    const startIdx = (state.classroom.page - 1) * state.classroom.pageSize;
    const currentSlice = state.classroom.participants.slice(startIdx, startIdx + state.classroom.pageSize);

    let tilesHtml = `
      <!-- Spotlight Primary Speaker Tile (Educadora) -->
      <div class="mb-4 bg-stone-900 border-2 border-amber-500/60 rounded-2xl p-4 flex flex-col justify-between h-48 relative overflow-hidden shadow-xl">
        <div class="absolute inset-0 bg-gradient-to-r from-amber-950/80 via-stone-900/90 to-orange-950/70 flex items-center justify-center">
          <div class="text-center space-y-2">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" class="w-16 h-16 rounded-full mx-auto ring-4 ring-amber-500 object-cover">
            <h4 class="text-white font-black text-sm">Profa. Me. Dandara Nascimento (Educadora Titular)</h4>
            <p class="text-xs text-amber-300">Transmitindo em 1080p • Conceito de Escrevivência e Memória</p>
          </div>
        </div>
        <div class="relative z-10 flex items-center justify-between">
          <span class="px-2.5 py-1 rounded-md bg-amber-600 text-stone-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-stone-950 animate-pulse"></span> Educadora Convidada
          </span>
          <span class="px-2 py-0.5 rounded bg-stone-900/90 text-[11px] text-emerald-400 font-mono">1080p HD</span>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
    `;

    currentSlice.forEach(p => {
      tilesHtml += `
        <div class="participant-tile bg-stone-900 border border-stone-800 rounded-2xl p-2.5 flex flex-col justify-between h-28 relative overflow-hidden ${p.isSpeaking ? 'speaking-pulse border-amber-500' : ''}">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold text-amber-400 truncate max-w-[80px]">${p.role}</span>
            <div class="flex items-center gap-1">
              ${p.handRaised ? '<span class="text-xs" title="Mão levantada">✋</span>' : ''}
              ${p.isMuted ? '<span class="text-[10px] text-rose-400">🔇</span>' : '<span class="text-[10px] text-emerald-400">🎙️</span>'}
            </div>
          </div>
          
          <div class="flex flex-col items-center justify-center my-auto">
            <img src="${p.avatar}" alt="${p.name}" class="w-10 h-10 rounded-full bg-stone-800 ring-2 ${p.isSpeaking ? 'ring-amber-400' : 'ring-stone-700'}">
          </div>

          <div class="flex items-center justify-between text-[11px] font-bold text-stone-200">
            <span class="truncate max-w-[90px]">${p.name}</span>
          </div>
        </div>
      `;
    });

    tilesHtml += `</div>`;
    container.innerHTML = tilesHtml;

  } else if (state.classroom.activeMode === 'whiteboard') {
    container.innerHTML = `
      <div class="h-full flex flex-col bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden p-3 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-3 bg-stone-800/80 p-2.5 rounded-xl border border-stone-700/60 text-xs">
          <div class="flex items-center gap-2">
            <span class="font-bold text-white">Quadro de Escrita Coletiva:</span>
            <button onclick="setWhiteboardColor('#ffffff')" class="w-6 h-6 rounded-full bg-white border border-stone-400 focus:ring-2 focus:ring-amber-500"></button>
            <button onclick="setWhiteboardColor('#f59e0b')" class="w-6 h-6 rounded-full bg-amber-500 focus:ring-2 focus:ring-amber-500"></button>
            <button onclick="setWhiteboardColor('#ea580c')" class="w-6 h-6 rounded-full bg-orange-600 focus:ring-2 focus:ring-amber-500"></button>
            <button onclick="setWhiteboardColor('#10b981')" class="w-6 h-6 rounded-full bg-emerald-500 focus:ring-2 focus:ring-amber-500"></button>
          </div>

          <div class="flex items-center gap-2">
            <label class="text-stone-400 text-[11px]">Traço:</label>
            <input type="range" id="wbLineWidth" min="2" max="18" value="4" class="w-20 cursor-pointer accent-amber-500">
            <button onclick="clearWhiteboard()" class="px-3 py-1 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30 font-bold transition">
              Limpar Quadro
            </button>
          </div>
        </div>

        <div class="flex-1 bg-stone-950 rounded-xl border border-stone-800 relative overflow-hidden min-h-[380px]">
          <canvas id="whiteboardCanvas" class="w-full h-full block"></canvas>
        </div>
      </div>
    `;

    setTimeout(initWhiteboardCanvas, 100);

  } else if (state.classroom.activeMode === 'jitsi') {
    container.innerHTML = `
      <div class="h-full flex flex-col bg-stone-950 rounded-2xl overflow-hidden min-h-[460px] border border-stone-800">
        <div class="p-2.5 bg-stone-900 border-b border-stone-800 flex items-center justify-between text-xs">
          <span class="text-stone-300 font-bold">Sala WebRTC SFU Escritoras da Liberdade (Suporta 100 participantes)</span>
          <span class="text-[11px] text-emerald-400 font-bold">Criptografia & Acolhimento</span>
        </div>
        <iframe 
          src="https://meet.jit.si/EscritorasDaLiberdadeBaobaOficinaMagna#config.startWithAudioMuted=true&config.prejoinPageEnabled=false" 
          allow="camera; microphone; display-capture; autoplay; clipboard-write" 
          class="w-full flex-1 min-h-[420px] border-none">
        </iframe>
      </div>
    `;
  }
}

let wbCanvas, wbCtx, isDrawing = false, wbColor = "#f59e0b", wbWidth = 4;

function initWhiteboardCanvas() {
  wbCanvas = document.getElementById("whiteboardCanvas");
  if (!wbCanvas) return;

  wbCanvas.width = wbCanvas.parentElement.clientWidth;
  wbCanvas.height = wbCanvas.parentElement.clientHeight || 400;
  wbCtx = wbCanvas.getContext("2d");

  wbCtx.fillStyle = "#d97706";
  wbCtx.font = "bold 16px sans-serif";
  wbCtx.fillText("Escritoras da Liberdade • Quadro Coletivo de Escrevivência", 24, 36);
  wbCtx.fillStyle = "#e7e5e4";
  wbCtx.font = "italic 13px sans-serif";
  wbCtx.fillText('"A nossa escrevivência não é para adormecer os da casa-grande,', 24, 65);
  wbCtx.fillText(' mas para acordá-los de seus sonos injustos." — Conceição Evaristo', 24, 85);

  wbCanvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    wbCtx.beginPath();
    wbCtx.moveTo(e.offsetX, e.offsetY);
  });

  wbCanvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;
    const widthSlider = document.getElementById("wbLineWidth");
    wbWidth = widthSlider ? widthSlider.value : 4;

    wbCtx.strokeStyle = wbColor;
    wbCtx.lineWidth = wbWidth;
    wbCtx.lineCap = "round";
    wbCtx.lineTo(e.offsetX, e.offsetY);
    wbCtx.stroke();
  });

  window.addEventListener("mouseup", () => {
    isDrawing = false;
  });
}

function setWhiteboardColor(color) {
  wbColor = color;
}

function clearWhiteboard() {
  if (!wbCtx || !wbCanvas) return;
  wbCtx.clearRect(0, 0, wbCanvas.width, wbCanvas.height);
}

function toggleClassroomMic() {
  state.classroom.isMuted = !state.classroom.isMuted;
  const btn = document.getElementById("btnClassroomMic");
  if (btn) {
    btn.className = `px-3.5 py-2 rounded-xl text-xs font-bold ${state.classroom.isMuted ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'} flex items-center gap-1.5 transition`;
    btn.innerHTML = state.classroom.isMuted ? '🔇 Microfone Mutado' : '🎙️ Microfone Aberto';
  }
}

function toggleClassroomVideo() {
  state.classroom.isVideoOn = !state.classroom.isVideoOn;
  const btn = document.getElementById("btnClassroomVideo");
  if (btn) {
    btn.className = `px-3.5 py-2 rounded-xl text-xs font-bold ${!state.classroom.isVideoOn ? 'bg-stone-800 text-stone-300 hover:bg-stone-700' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'} flex items-center gap-1.5 transition`;
    btn.innerHTML = state.classroom.isVideoOn ? '📹 Câmera Ativa' : '📷 Abrir Câmera';
  }
}

async function toggleRaiseHand() {
  state.classroom.handRaised = !state.classroom.handRaised;
  const btn = document.getElementById("btnRaiseHand");
  if (btn) {
    btn.className = `px-4 py-2 rounded-xl text-xs font-bold ${state.classroom.handRaised ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'} flex items-center gap-2 transition`;
    btn.innerHTML = `✋ ${state.classroom.handRaised ? 'Baixar Minha Mão' : 'Levantar a Mão (Pedir a Palavra)'}`;
  }

  if (state.classroom.handRaised) {
    await fetch("/api/classroom/raise-hand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classroom_id: state.classroom.id,
        aluno_id: state.currentUserId,
        aluno_name: "Marielle Oliveira"
      })
    });
  }
  loadHandRaises();
}

async function loadHandRaises() {
  try {
    const res = await fetch(`/api/classroom/${state.classroom.id}`);
    const json = await res.json();
    if (!json.success) return;

    const listContainer = document.getElementById("handsQueueItems");
    const badge = document.getElementById("handRaisesBadge");
    if (!listContainer) return;

    listContainer.innerHTML = "";
    const raises = json.hand_raises || [];
    badge.textContent = `${raises.length} ${raises.length === 1 ? 'Mão Levantada' : 'Mãos Levantadas'}`;

    if (raises.length === 0) {
      listContainer.innerHTML = `<span class="text-[11px] text-stone-400 italic">Nenhuma educanda aguardando fala.</span>`;
    } else {
      raises.forEach(r => {
        const item = document.createElement("div");
        item.className = "flex items-center justify-between bg-stone-900/80 px-2.5 py-1.5 rounded-lg border border-amber-500/30 text-[11px]";
        item.innerHTML = `
          <span class="text-amber-200 font-bold">✋ ${r.aluno_name}</span>
          ${state.currentRole === 'professor' ? `
            <button onclick="dismissHandRaise(${r.id})" class="px-2 py-0.5 rounded-md bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 text-[10px] font-extrabold">
              Conceder a Palavra
            </button>
          ` : ''}
        `;
        listContainer.appendChild(item);
      });
    }
  } catch (err) {
    console.error("Error loading hand raises:", err);
  }
}

async function dismissHandRaise(id) {
  await fetch("/api/classroom/lower-hand", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: id, classroom_id: state.classroom.id })
  });
  loadHandRaises();
}

async function loadClassroomMessages() {
  try {
    const res = await fetch(`/api/classroom/${state.classroom.id}`);
    const json = await res.json();
    if (!json.success) return;

    const stream = document.getElementById("classroomMessagesStream");
    if (!stream) return;

    stream.innerHTML = "";
    json.messages.forEach(msg => {
      const isTeacher = msg.role === 'professor';
      const div = document.createElement("div");
      div.className = `p-2.5 rounded-2xl border ${isTeacher ? 'bg-amber-950/40 border-amber-500/40' : 'bg-stone-800/40 border-stone-700/40'} space-y-1`;
      div.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="font-bold text-[11px] ${isTeacher ? 'text-amber-300' : 'text-stone-200'}">${msg.user_name}</span>
          <span class="text-[9px] text-stone-400">${msg.created_at ? msg.created_at.split(' ')[1] : ''}</span>
        </div>
        <p class="text-xs text-stone-200 leading-snug">${msg.message}</p>
      `;
      stream.appendChild(div);
    });

    stream.scrollTop = stream.scrollHeight;
  } catch (err) {
    console.error("Error loading messages:", err);
  }
}

async function sendClassroomMessage() {
  const input = document.getElementById("classroomMsgInput");
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  const userName = state.currentRole === 'professor' ? "Profa. Me. Dandara Nascimento" : "Marielle Oliveira";

  try {
    await fetch("/api/classroom/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classroom_id: state.classroom.id,
        user_id: state.currentUserId,
        user_name: userName,
        role: state.currentRole,
        message: text
      })
    });
    input.value = "";
    loadClassroomMessages();
  } catch (err) {
    console.error("Error sending message:", err);
  }
}

function hostMuteAll() {
  state.classroom.participants.forEach(p => {
    p.isMuted = true;
    p.isSpeaking = false;
  });
  renderClassroom(true);
  alert("Todas as 84 participantes da oficina foram silenciadas pela educadora.");
}

function hostShareScreen() {
  alert("Compartilhamento de material de leitura e slides em 1080p ativo para todas as 100 vagas!");
}

function hostLaunchPoll() {
  const question = prompt("Qual tema ou votação deseja lançar para as educandas?", "Qual obra de Conceição Evaristo devemos debater na próxima roda?");
  if (question) {
    alert(`Enquete lançada para todas as participantes conectadas: "${question}"`);
  }
}


/* ========================================================================= */
/* EDUCADORA: CORREÇÃO DE ATIVIDADES E RELATÓRIOS MENSAIS                    */
/* ========================================================================= */

async function renderProfSubmissions() {
  const tbody = document.getElementById("profSubmissionsTableBody");
  tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-stone-400">Carregando produções das educandas...</td></tr>`;

  try {
    const res = await fetch(`/api/professor/submissions?professor_id=${state.currentUserId}`);
    const json = await res.json();
    if (!json.success) return;

    tbody.innerHTML = "";
    const pendingCount = json.submissions.filter(s => s.status === 'pendente').length;
    document.getElementById("pendingSubmissionsBadge").textContent = `${pendingCount} Produções Aguardando Avaliação`;

    json.submissions.forEach(sub => {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-stone-800/40 transition";

      const isPending = sub.status === 'pendente';
      const statusBadge = isPending 
        ? `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Pendente de Parecer</span>`
        : `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Avaliado com Louvor</span>`;

      tr.innerHTML = `
        <td class="p-4 flex items-center gap-3">
          <img src="${sub.aluno_avatar || 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150'}" class="w-8 h-8 rounded-full object-cover ring-1 ring-amber-500/40">
          <div>
            <p class="font-bold text-white text-xs">${sub.aluno_name}</p>
            <p class="text-[11px] text-stone-400">${sub.aluno_email}</p>
          </div>
        </td>
        <td class="p-4">
          <p class="font-bold text-white text-xs">${sub.activity_title}</p>
          <p class="text-[11px] text-stone-400">${sub.subject}</p>
        </td>
        <td class="p-4 text-stone-300 text-xs">${sub.submitted_at || 'Recentemente'}</td>
        <td class="p-4">${statusBadge}</td>
        <td class="p-4 font-bold text-xs ${sub.score !== null ? 'text-amber-400' : 'text-stone-500'}">
          ${sub.score !== null ? `${sub.score.toFixed(1)} / ${sub.max_score}` : '-'}
        </td>
        <td class="p-4 text-right">
          <button onclick='openGradeModal(${JSON.stringify(sub)})' class="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-black text-xs shadow transition">
            ${isPending ? 'Avaliar Produção' : 'Revisar Parecer'}
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error loading submissions:", err);
  }
}

function openGradeModal(submission) {
  document.getElementById("gradeModalSubmissionId").value = submission.id;
  document.getElementById("gradeModalStudentName").textContent = `Avaliação: ${submission.aluno_name}`;
  document.getElementById("gradeModalActivityTitle").textContent = `${submission.activity_title} • Valor: ${submission.max_score} pts`;
  document.getElementById("gradeModalScoreInput").value = submission.score !== null ? submission.score : 9.5;
  document.getElementById("gradeModalFeedbackInput").value = submission.feedback || "";

  const answersPreview = document.getElementById("gradeModalAnswersPreview");
  answersPreview.innerHTML = JSON.stringify(submission.answers, null, 2);

  document.getElementById("gradeModal").classList.remove("hidden");
}

function closeGradeModal() {
  document.getElementById("gradeModal").classList.add("hidden");
}

async function saveGradeSubmission() {
  const subId = document.getElementById("gradeModalSubmissionId").value;
  const score = parseFloat(document.getElementById("gradeModalScoreInput").value);
  const feedback = document.getElementById("gradeModalFeedbackInput").value.trim();

  try {
    const res = await fetch("/api/professor/grade-submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submission_id: subId,
        score: score,
        feedback: feedback
      })
    });
    const json = await res.json();
    if (json.success) {
      alert("Parecer e nota atribuídos com sucesso à educanda!");
      closeGradeModal();
      renderProfSubmissions();
    }
  } catch (err) {
    alert("Erro ao gravar parecer: " + err.message);
  }
}

async function renderProfReports() {
  const tbody = document.getElementById("profReportsTableBody");
  tbody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-stone-400">Carregando relatórios mensais...</td></tr>`;

  try {
    const res = await fetch(`/api/professor/reports?professor_id=${state.currentUserId}`);
    const json = await res.json();
    if (!json.success) return;

    tbody.innerHTML = "";
    let totalPaid = 0;
    let totalPending = 0;

    json.reports.forEach(r => {
      if (r.status === 'pago') totalPaid += r.total_amount;
      if (r.status === 'pendente' || r.status === 'aprovado') totalPending += r.total_amount;

      const tr = document.createElement("tr");
      tr.className = "hover:bg-stone-800/40 transition";

      let statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Em Auditoria Baobá</span>`;
      if (r.status === 'aprovado') {
        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">Horas Aprovadas (Aguardando PIX)</span>`;
      } else if (r.status === 'pago') {
        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Bolsa Liquidada via PIX</span>`;
      }

      tr.innerHTML = `
        <td class="p-4 font-black text-white text-xs">${r.month_ref}</td>
        <td class="p-4 text-xs">${r.hours_taught} horas</td>
        <td class="p-4 text-xs">${r.classes_count} oficinas</td>
        <td class="p-4 text-xs">${r.students_assisted} educandas</td>
        <td class="p-4 font-black text-xs text-amber-400">R$ ${r.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td class="p-4">${statusBadge}</td>
        <td class="p-4 text-xs text-stone-400 font-mono">
          ${r.payment_reference ? `<span class="text-emerald-400 font-bold">Ref: ${r.payment_reference}</span>` : 'Aguardando liberação master'}
        </td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById("profTotalPaidDisplay").textContent = `R$ ${totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    document.getElementById("profTotalPendingDisplay").textContent = `R$ ${totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  } catch (err) {
    console.error("Error loading teacher reports:", err);
  }
}

function openSubmitReportModal() {
  document.getElementById("reportModal").classList.remove("hidden");
  calculateReportTotal();
}

function closeSubmitReportModal() {
  document.getElementById("reportModal").classList.add("hidden");
}

function calculateReportTotal() {
  const hours = parseFloat(document.getElementById("repInputHours").value) || 0;
  const rate = 90.0; // R$ 90,00/h
  const total = hours * rate;
  document.getElementById("repCalculatedTotal").textContent = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

async function submitTeacherReport() {
  const month = document.getElementById("repInputMonth").value.trim();
  const hours = parseFloat(document.getElementById("repInputHours").value);
  const classes = parseInt(document.getElementById("repInputClasses").value);
  const students = parseInt(document.getElementById("repInputStudents").value);
  const desc = document.getElementById("repInputDescription").value.trim();

  if (!desc) {
    alert("Por favor, descreva as oficinas e os conteúdos pedagógicos desenvolvidos.");
    return;
  }

  try {
    const res = await fetch("/api/professor/submit-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        professor_id: state.currentUserId,
        tenant_id: state.currentTenantId,
        month_ref: month,
        hours_taught: hours,
        classes_count: classes,
        students_assisted: students,
        description: desc,
        hourly_rate: 90.0
      })
    });
    const json = await res.json();
    if (json.success) {
      alert("Relatório mensal enviado com sucesso para a Coordenação Geral do Projeto Baobá! O processo de auditoria e liberação do PIX foi iniciado.");
      closeSubmitReportModal();
      renderProfReports();
    }
  } catch (err) {
    alert("Erro ao enviar relatório: " + err.message);
  }
}


/* ========================================================================= */
/* MASTER BAOBÁ: ACOMPANHAMENTO DE RELATÓRIOS E LIBERAÇÃO DE PIX             */
/* ========================================================================= */

async function renderMasterReports() {
  const tbody = document.getElementById("masterReportsTableBody");
  tbody.innerHTML = `<tr><td colspan="8" class="p-6 text-center text-stone-400">Auditando relatórios dos Polos Baobá...</td></tr>`;

  const statusFilter = document.getElementById("masterFilterStatus") ? document.getElementById("masterFilterStatus").value : 'all';
  const tenantFilter = document.getElementById("masterFilterTenant") ? document.getElementById("masterFilterTenant").value : 'all';

  try {
    const res = await fetch(`/api/master/reports?status=${statusFilter}&tenant_id=${tenantFilter}`);
    const json = await res.json();
    if (!json.success) return;

    tbody.innerHTML = "";

    document.getElementById("masterKpiPaid").textContent = `R$ ${(json.stats.total_pago || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    document.getElementById("masterKpiPending").textContent = `R$ ${(json.stats.total_pendente || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    json.reports.forEach(r => {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-stone-800/40 transition";

      let statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Pendente Auditoria</span>`;
      if (r.status === 'aprovado') {
        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">Horas Aprovadas</span>`;
      } else if (r.status === 'pago') {
        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Bolsa Liquidada</span>`;
      }

      tr.innerHTML = `
        <td class="p-4 flex items-center gap-3">
          <img src="${r.professor_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" class="w-8 h-8 rounded-full object-cover ring-1 ring-amber-500/40">
          <div>
            <p class="font-bold text-white text-xs">${r.professor_name}</p>
            <p class="text-[11px] text-stone-400">${r.discipline || 'Educadora'}</p>
          </div>
        </td>
        <td class="p-4">
          <span class="px-2 py-0.5 rounded bg-stone-800 text-[11px] font-bold text-amber-300">${r.tenant_name}</span>
        </td>
        <td class="p-4 font-black text-white text-xs">${r.month_ref}</td>
        <td class="p-4 text-xs">${r.hours_taught}h (${r.classes_count} oficinas)</td>
        <td class="p-4 text-xs">${r.students_assisted} educandas</td>
        <td class="p-4 font-black text-xs text-amber-400">R$ ${r.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td class="p-4">${statusBadge}</td>
        <td class="p-4 text-right">
          ${r.status === 'pago' ? `
            <span class="text-xs text-emerald-400 font-bold">✓ Pago (${r.payment_reference})</span>
          ` : `
            <button onclick='openMasterPaymentModal(${JSON.stringify(r)})' class="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/30 transition">
              Auditar e Liberar PIX →
            </button>
          `}
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error loading master reports:", err);
  }
}

function openMasterPaymentModal(report) {
  document.getElementById("masterModalReportId").value = report.id;
  document.getElementById("masterModalDocenteName").textContent = `Relatório Docente: ${report.professor_name}`;
  document.getElementById("masterModalTenantName").textContent = `${report.tenant_name} • Mês: ${report.month_ref}`;
  document.getElementById("masterModalHours").textContent = `${report.hours_taught} horas`;
  document.getElementById("masterModalClasses").textContent = `${report.classes_count} oficinas`;
  document.getElementById("masterModalStudents").textContent = `${report.students_assisted} educandas`;
  document.getElementById("masterModalDescription").textContent = report.description;
  document.getElementById("masterModalTotalAmount").textContent = `R$ ${report.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  document.getElementById("masterPaymentModal").classList.remove("hidden");
}

function closeMasterPaymentModal() {
  document.getElementById("masterPaymentModal").classList.add("hidden");
}

async function approveReportMasterOnly() {
  const reportId = document.getElementById("masterModalReportId").value;
  const feedback = document.getElementById("masterModalFeedback").value.trim();

  try {
    const res = await fetch("/api/master/review-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        report_id: reportId,
        status: "aprovado",
        feedback: feedback || "Horas e oficinas validadas com sucesso pela Coordenação Baobá."
      })
    });
    const json = await res.json();
    if (json.success) {
      alert("Relatório aprovado! Ficou registrado como pronto para liberação de pagamento.");
      closeMasterPaymentModal();
      renderMasterReports();
    }
  } catch (err) {
    alert("Erro ao aprovar relatório: " + err.message);
  }
}

async function releasePaymentMasterNow() {
  const reportId = document.getElementById("masterModalReportId").value;
  const pixCode = `PIX-BAOBA-${Math.floor(100000 + Math.random() * 900000)}`;

  try {
    const res = await fetch("/api/master/release-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        report_id: reportId,
        payment_reference: pixCode
      })
    });
    const json = await res.json();
    if (json.success) {
      alert(`PAGAMENTO / BOLSA LIBERADA COM SUCESSO!\n\nProjeto Baobá - Fundo de Equidade Racial\nComprovante: ${json.payment_reference}\nData/Hora: ${json.payment_date}\nStatus: Liquidado via PIX.\nA educadora foi notificada.`);
      closeMasterPaymentModal();
      renderMasterReports();
    }
  } catch (err) {
    alert("Erro ao liberar pagamento: " + err.message);
  }
}

async function rejectReportMaster() {
  const reportId = document.getElementById("masterModalReportId").value;
  const feedback = prompt("Informe as orientações de ajuste para a educadora:", "Favor anexar a lista de presença das 4 horas complementares.");
  if (!feedback) return;

  try {
    const res = await fetch("/api/master/review-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        report_id: reportId,
        status: "rejeitado",
        feedback: feedback
      })
    });
    const json = await res.json();
    if (json.success) {
      alert("Relatório devolvido à educadora para ajustes.");
      closeMasterPaymentModal();
      renderMasterReports();
    }
  } catch (err) {
    alert("Erro: " + err.message);
  }
}

async function renderMasterTenants() {
  const container = document.getElementById("masterTenantsGrid");
  container.innerHTML = `<div class="col-span-full text-center py-6 text-stone-400">Carregando polos regionais...</div>`;

  try {
    const res = await fetch("/api/master/overview");
    const json = await res.json();
    if (!json.success) return;

    container.innerHTML = "";
    json.overview.tenants.forEach(t => {
      const card = document.createElement("div");
      card.className = "bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 hover:border-amber-500/40 transition";
      card.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="px-2.5 py-0.5 rounded text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">${t.badge}</span>
          <span class="text-xs text-emerald-400 font-bold">Polo Ativo</span>
        </div>
        <div>
          <h3 class="text-base font-bold text-white">${t.name}</h3>
          <p class="text-xs text-stone-400">Capacidade simultânea: ${t.max_participants} educandas por sala</p>
        </div>
        <div class="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800 text-xs">
          <div class="bg-stone-800/60 p-2.5 rounded-xl">
            <span class="text-stone-400 text-[11px] block">Educandas</span>
            <span class="font-extrabold text-white text-sm">${t.active_students} inscritas</span>
          </div>
          <div class="bg-stone-800/60 p-2.5 rounded-xl">
            <span class="text-stone-400 text-[11px] block">Educadoras</span>
            <span class="font-extrabold text-white text-sm">${t.active_professors} docentes</span>
          </div>
        </div>
        <button onclick="state.currentTenantId='${t.id}'; updateHeaderTenant(); switchTab('masterTabFinanceiro');" class="w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-amber-300 transition">
          Ver Relatórios deste Polo →
        </button>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading master overview:", err);
  }
}
