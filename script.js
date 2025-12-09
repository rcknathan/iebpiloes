// --------------------------------------------
// 🔥 Firebase Import (usando CDN para funcionar no navegador)
// --------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 🔥 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCaji1-Lp0_lA_6lBBCIsiO3vSxEwVnK18",
  authDomain: "ieb-piloes-sistema.firebaseapp.com",
  projectId: "ieb-piloes-sistema",
  storageBucket: "ieb-piloes-sistema.firebasestorage.app",
  messagingSenderId: "351930661090",
  appId: "1:351930661090:web:efe375e08aa65871eb46bb"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Coleção
const membrosRef = collection(db, "membros");

// --------------------------------------------
// 🔵 Funções Firestore (substituindo localStorage)
// --------------------------------------------

// LISTAR TODOS
async function getMembers() {
  const snap = await getDocs(membrosRef);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ADICIONAR
async function addMember(member) {
  await addDoc(membrosRef, member);
}

// ATUALIZAR
async function updateMember(id, member) {
  await updateDoc(doc(db, "membros", id), member);
}

// DELETAR
async function deleteMemberDB(id) {
  await deleteDoc(doc(db, "membros", id));
}

// --------------------------------------------
// 🔵 Controle de abas
// --------------------------------------------
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    tabContents.forEach(content => content.style.display = 'none');
    document.getElementById(tab).style.display = 'block';
  });
});

// --------------------------------------------
// 🔵 Renderizar Tabela
// --------------------------------------------
async function renderTable(filter = '') {
  let members = await getMembers();
  members.sort((a, b) => a.nome.localeCompare(b.nome));

  const filtered = members.filter(m =>
    m.nome.toLowerCase().includes(filter.toLowerCase())
  );

  const tableBody = document.querySelector('#membersTable tbody');
  tableBody.innerHTML = '';

  filtered.forEach((m) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${m.nome}</td>
      <td>${formatDate(m.nascimento)}</td>
      <td>${m.contato}</td>
      <td>${m.batizado}</td>
      <td>
        <button onclick="editMember('${m.id}')">Editar</button>
        <button onclick="deleteMember('${m.id}')" style="background:#e53935;">Excluir</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

// --------------------------------------------
// 🔵 Aniversariantes
// --------------------------------------------
async function renderBirthdays() {
  const members = await getMembers();
  const month = parseInt(monthFilter.value);
  const order = orderFilter.value;

  let monthMembers = members.filter(m =>
    new Date(m.nascimento).getMonth() === month
  );

  if (order === 'nome') {
    monthMembers.sort((a, b) => a.nome.localeCompare(b.nome));
  } else {
    monthMembers.sort((a, b) => new Date(a.nascimento) - new Date(b.nascimento));
  }

  const birthdayList = document.getElementById('birthdayList');
  birthdayList.innerHTML = '';

  if (monthMembers.length === 0) {
    birthdayList.innerHTML = '<p style="text-align:center; color:#555;">Nenhum aniversariante neste mês.</p>';
    return;
  }

  const div = document.createElement('div');
  div.classList.add('month');
  div.textContent = monthFilter.options[month].textContent;
  birthdayList.appendChild(div);

  monthMembers.forEach(m => {
    const card = document.createElement('div');
    card.classList.add('birthday-card');

    card.innerHTML = `
      <span class="birthday-name">${m.nome}</span>
      <span class="birthday-date">${formatDate(m.nascimento)}</span>
    `;

    birthdayList.appendChild(card);
  });
}

// --------------------------------------------
// 🔵 Formulário
// --------------------------------------------
const form = document.getElementById('memberForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const nascimento = document.getElementById('nascimento').value;
  const contato = document.getElementById('contato').value;
  const batizado = document.getElementById('batizado').value;
  const editId = document.getElementById('editIndex').value;

  const memberData = { nome, nascimento, contato, batizado };

  if (editId) {
    await updateMember(editId, memberData);
    document.getElementById('editIndex').value = "";
  } else {
    await addMember(memberData);
  }

  form.reset();
  renderTable();
  renderBirthdays();
});

window.editMember = async function(id) {
  const members = await getMembers();
  const m = members.find(x => x.id === id);

  document.getElementById('nome').value = m.nome;
  document.getElementById('nascimento').value = m.nascimento;
  document.getElementById('contato').value = m.contato;
  document.getElementById('batizado').value = m.batizado;
  document.getElementById('editIndex').value = id;

  tabButtons.forEach(b => b.classList.remove('active'));
  tabContents.forEach(c => c.style.display = 'none');

  document.querySelector('.tab-btn[data-tab="cadastro"]').classList.add('active');
  document.getElementById('cadastro').style.display = 'block';
};

window.deleteMember = async function(id) {
  if (!confirm('Deseja excluir este membro?')) return;
  await deleteMemberDB(id);
  renderTable();
  renderBirthdays();
};

// --------------------------------------------
// 🔵 Utilitários
// --------------------------------------------
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR");
}

// --------------------------------------------
// 🔵 Eventos
// --------------------------------------------
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', () => renderTable(searchInput.value));

const monthFilter = document.getElementById('monthFilter');
const orderFilter = document.getElementById('orderFilter');
monthFilter.addEventListener('change', renderBirthdays);
orderFilter.addEventListener('change', renderBirthdays);

// --------------------------------------------
// 🔵 Inicialização
// --------------------------------------------
function renderMonthOptions() {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  monthFilter.innerHTML = months
    .map((m, i) => `<option value="${i}">${m}</option>`)
    .join('');
  monthFilter.value = new Date().getMonth();
}

renderMonthOptions();
renderTable();
renderBirthdays();
