// ===============================
// ===== FIREBASE CONFIG =========
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCaji1-Lp0_lA_6lBBCIsiO3vSxEwVnK18",
  authDomain: "ieb-piloes-sistema.firebaseapp.com",
  projectId: "ieb-piloes-sistema",
  storageBucket: "ieb-piloes-sistema.firebasestorage.app",
  messagingSenderId: "351930661090",
  appId: "1:351930661090:web:efe375e08aa65871eb46bb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===============================
// ===== FIRESTORE CRUD ==========
// ===============================
async function getMembers() {
  const snap = await getDocs(collection(db, "membros"));
  const data = [];
  snap.forEach(docSnap => data.push({ id: docSnap.id, ...docSnap.data() }));
  return data;
}

async function saveMember(member) {
  await addDoc(collection(db, "membros"), member);
}

async function updateMember(id, member) {
  await updateDoc(doc(db, "membros", id), member);
}

async function deleteMemberById(id) {
  await deleteDoc(doc(db, "membros", id));
}

function sortMembersByName(members) {
  return members.sort((a, b) => a.nome.localeCompare(b.nome));
}

// ===============================
// ===== CONTROLE DE ABAS ========
// ===============================
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    tabContents.forEach(sec => sec.style.display = 'none');
    document.getElementById(tab).style.display = 'block';
  });
});

// ===============================
// ===== ELEMENTOS DOM ===========
// ===============================
const form = document.getElementById('memberForm');
const tableBody = document.querySelector('#membersTable tbody');
const tableInfantilBody = document.querySelector('#infantilTable tbody');

const birthdayList = document.getElementById('birthdayList');
const searchInput = document.getElementById('searchInput');
const searchInfantil = document.getElementById('searchInfantil');
const monthFilter = document.getElementById('monthFilter');
const orderFilter = document.getElementById('orderFilter');

// ===============================
// ===== FUNÇÃO IDADE (SEGURA) ====
// ===============================
function getAge(dateStr) {
  if (!dateStr) return 0;
  const [y, m, d] = dateStr.split('-').map(Number);
  const birth = new Date(y, m - 1, d);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const diffMonth = today.getMonth() - birth.getMonth();

  if (diffMonth < 0 || (diffMonth === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// ===============================
// ===== FORMATAR DATA (STRING) ==
// ===============================
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

// ===============================
// ===== TABELA MEMBROS ==========
// ===============================
async function renderTable(filter = '') {
  let members = await getMembers();
  members = sortMembersByName(members);

  members = members.filter(m => getAge(m.nascimento) > 10);

  const filtered = members.filter(m =>
    m.nome.toLowerCase().includes(filter.toLowerCase())
  );

  tableBody.innerHTML = '';
  filtered.forEach(m => {
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

// ===============================
// ===== TABELA INFANTIL =========
// ===============================
async function renderInfantil(filter = '') {
  let members = await getMembers();
  members = sortMembersByName(members);

  members = members.filter(m => getAge(m.nascimento) <= 10);

  const filtered = members.filter(m =>
    m.nome.toLowerCase().includes(filter.toLowerCase())
  );

  tableInfantilBody.innerHTML = '';
  filtered.forEach(m => {
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
    tableInfantilBody.appendChild(tr);
  });
}

// ===============================
// ===== ANIVERSARIANTES =========
// ===============================
function renderMonthOptions() {
  const months = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
  ];

  monthFilter.innerHTML = '';
  months.forEach((m, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = m;
    monthFilter.appendChild(opt);
  });

  monthFilter.value = new Date().getMonth();
}

async function renderBirthdays() {
  const members = await getMembers();
  const month = parseInt(monthFilter.value);
  const order = orderFilter.value;

  let filtered = members.filter(m => {
    if (!m.nascimento) return false;
    const mMonth = parseInt(m.nascimento.split('-')[1], 10) - 1;
    return mMonth === month;
  });

  if (order === "nome") {
    filtered.sort((a, b) => a.nome.localeCompare(b.nome));
  } else {
    filtered.sort((a, b) => a.nascimento.localeCompare(b.nascimento));
  }

  birthdayList.innerHTML = '';

  if (filtered.length === 0) {
    birthdayList.innerHTML = '<p style="text-align:center;color:#555;">Nenhum aniversariante neste mês.</p>';
    return;
  }

  const div = document.createElement('div');
  div.classList.add('month');
  div.textContent = monthFilter.options[month].textContent;
  birthdayList.appendChild(div);

  filtered.forEach(m => {
    const card = document.createElement('div');
    card.classList.add('birthday-card');

    const nameElem = document.createElement('span');
    nameElem.classList.add('birthday-name');
    nameElem.textContent = m.nome;

    const dateElem = document.createElement('span');
    dateElem.classList.add('birthday-date');
    dateElem.textContent = formatDate(m.nascimento);

    card.appendChild(nameElem);
    card.appendChild(dateElem);
    birthdayList.appendChild(card);
  });
}

// ===============================
// ===== FORM SUBMIT =============
// ===============================
form.addEventListener('submit', async e => {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const nascimento = document.getElementById('nascimento').value;
  const contato = document.getElementById('contato').value;
  const batizado = document.getElementById('batizado').value;
  const editIndex = document.getElementById('editIndex').value;

  const data = { nome, nascimento, contato, batizado };

  if (editIndex) {
    await updateMember(editIndex, data);
    document.getElementById('editIndex').value = '';
  } else {
    await saveMember(data);
  }

  form.reset();
  renderTable(searchInput.value);
  renderInfantil(searchInfantil.value);
  renderBirthdays();
});

// ===============================
// ===== EDITAR MEMBRO ===========
// ===============================
window.editMember = async function(id) {
  const members = await getMembers();
  const m = members.find(x => x.id === id);

  document.getElementById('nome').value = m.nome;
  document.getElementById('nascimento').value = m.nascimento;
  document.getElementById('contato').value = m.contato;
  document.getElementById('batizado').value = m.batizado;
  document.getElementById('editIndex').value = id;

  document.querySelector('.tab-btn[data-tab="cadastro"]').click();
};

// ===============================
// ===== EXCLUIR MEMBRO ==========
// ===============================
window.deleteMember = async function(id) {
  if (!confirm("Deseja excluir este membro?")) return;
  await deleteMemberById(id);
  renderTable(searchInput.value);
  renderInfantil(searchInfantil.value);
  renderBirthdays();
};

// ===============================
// ===== IMPRESSÃO MEMBROS =======
// ===============================
document.getElementById('printBtn').addEventListener('click', async () => {
  let members = await getMembers();
  members = members.filter(m => getAge(m.nascimento) > 10);

  if (members.length === 0) {
    alert("Nenhum membro para imprimir.");
    return;
  }

  printGeneric(members, "Lista de Membros - IEB");
});

// ===============================
// ===== IMPRESSÃO INFANTIL ======
// ===============================
document.getElementById('printInfantilBtn').addEventListener('click', async () => {
  let members = await getMembers();
  members = members.filter(m => getAge(m.nascimento) <= 10);

  if (members.length === 0) {
    alert("Nenhuma criança para imprimir.");
    return;
  }

  printGeneric(members, "Lista de Crianças - Departamento Infantil");
});

// ===============================
// ===== PRINT GENÉRICO ==========
// ===============================
function printGeneric(list, title) {
  let html = `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          h2 { text-align:center; color:#041e43; margin-bottom:20px; }
          table { width:100%; border-collapse:collapse; }
          th, td { border:1px solid #ccc; padding:8px; text-align:center; }
          th { background:#041e43; color:white; }
          tr:nth-child(even){ background:#f9f9f9; }
        </style>
      </head>
      <body>
        <h2>${title}</h2>
        <table>
          <tr>
            <th>Nome</th>
            <th>Nascimento</th>
            <th>Contato</th>
            <th>Batizado</th>
          </tr>
  `;

  list.forEach(m => {
    html += `
      <tr>
        <td>${m.nome}</td>
        <td>${formatDate(m.nascimento)}</td>
        <td>${m.contato}</td>
        <td>${m.batizado}</td>
      </tr>
    `;
  });

  html += `
        </table>
      </body>
    </html>
  `;

  const win = window.open('', '', 'width=900,height=600');
  win.document.write(html);
  win.document.close();
  win.print();
}

// ===============================
// ===== EVENTOS =================
// ===============================
searchInput.addEventListener('input', () => renderTable(searchInput.value));
searchInfantil.addEventListener('input', () => renderInfantil(searchInfantil.value));
monthFilter.addEventListener('change', renderBirthdays);
orderFilter.addEventListener('change', renderBirthdays);

// ===============================
// ===== INICIALIZAR =============
// ===============================
renderMonthOptions();
renderTable();
renderInfantil();
renderBirthdays();
