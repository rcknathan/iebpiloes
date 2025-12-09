// ==============================
// ======= FIREBASE =============
// ==============================
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

// ==============================
// ======= FIRESTORE CRUD =======
// ==============================
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

// ==============================
// ======= CONTROLE DE ABAS =====
// ==============================
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

// ==============================
// ======= ELEMENTOS DOM ========
// ==============================
const form = document.getElementById('memberForm');
const tableBody = document.querySelector('#membersTable tbody');
const birthdayList = document.getElementById('birthdayList');
const searchInput = document.getElementById('searchInput');
const monthFilter = document.getElementById('monthFilter');
const orderFilter = document.getElementById('orderFilter');

// ==============================
// ======= RENDER TABELA ========
// ==============================
async function renderTable(filter = '') {
  let members = await getMembers();
  members = sortMembersByName(members);

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

// ==============================
// ======= ANIVERSARIANTES ======
// ==============================
function renderMonthOptions() {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  monthFilter.innerHTML = '';
  months.forEach((m, i) => {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = m;
    monthFilter.appendChild(option);
  });
  monthFilter.value = new Date().getMonth();
}

async function renderBirthdays() {
  const members = await getMembers();
  const month = parseInt(monthFilter.value);
  const order = orderFilter.value;

  let monthMembers = members.filter(
    m => new Date(m.nascimento).getMonth() === month
  );

  if (order === 'nome') {
    monthMembers.sort((a, b) => a.nome.localeCompare(b.nome));
  } else {
    monthMembers.sort((a, b) => new Date(a.nascimento) - new Date(b.nascimento));
  }

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
    const dateObj = new Date(m.nascimento);
    const formattedDate = dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });

    const card = document.createElement('div');
    card.classList.add('birthday-card');

    const nameElem = document.createElement('span');
    nameElem.classList.add('birthday-name');
    nameElem.textContent = m.nome;

    const dateElem = document.createElement('span');
    dateElem.classList.add('birthday-date');
    dateElem.textContent = formattedDate;

    card.appendChild(nameElem);
    card.appendChild(dateElem);
    birthdayList.appendChild(card);
  });
}

// ==============================
// ======= FORM SUBMIT ==========
// ==============================
form.addEventListener('submit', async e => {
  e.preventDefault();
  const nome = document.getElementById('nome').value;
  const nascimento = document.getElementById('nascimento').value;
  const contato = document.getElementById('contato').value;
  const batizado = document.getElementById('batizado').value;
  const editIndex = document.getElementById('editIndex').value;

  const memberData = { nome, nascimento, contato, batizado };

  if (editIndex) {
    await updateMember(editIndex, memberData);
    document.getElementById('editIndex').value = '';
  } else {
    await saveMember(memberData);
  }

  form.reset();
  renderTable(searchInput.value);
  renderBirthdays();
});

// ==============================
// ======= EDITAR MEMBRO ========
// ==============================
window.editMember = async function(id) {
  const members = await getMembers();
  const m = members.find(x => x.id === id);

  document.getElementById('nome').value = m.nome;
  document.getElementById('nascimento').value = m.nascimento;
  document.getElementById('contato').value = m.contato;
  document.getElementById('batizado').value = m.batizado;
  document.getElementById('editIndex').value = id;

  tabButtons.forEach(b => b.classList.remove('active'));
  tabContents.forEach(content => content.style.display = 'none');
  document.querySelector('.tab-btn[data-tab="cadastro"]').classList.add('active');
  document.getElementById('cadastro').style.display = 'block';
};

// ==============================
// ======= EXCLUIR MEMBRO =======
// ==============================
window.deleteMember = async function(id) {
  if (!confirm('Deseja excluir este membro?')) return;
  await deleteMemberById(id);
  renderTable(searchInput.value);
  renderBirthdays();
};

// ==============================
// ======= FORMATAR DATA ========
// ==============================
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// ==============================
// ======= IMPRIMIR ==============
// ==============================
document.getElementById('printBtn').addEventListener('click', async () => {
  const members = await getMembers();
  if (members.length === 0) {
    alert('Nenhum membro cadastrado.');
    return;
  }

  let printContent = `
    <html>
      <head>
        <title>Lista de Membros - IEB</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2 { text-align: center; margin-bottom: 20px; color: #041e43; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
          th { background: #041e43; color: white; }
          tr:nth-child(even) { background: #f9f9f9; }
        </style>
      </head>
      <body>
        <h2>Lista de Membros - IEB Pilões</h2>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Data de Nascimento</th>
              <th>Contato</th>
              <th>Batizado</th>
            </tr>
          </thead>
          <tbody>
  `;

  members.forEach(m => {
    printContent += `
      <tr>
        <td>${m.nome}</td>
        <td>${formatDate(m.nascimento)}</td>
        <td>${m.contato}</td>
        <td>${m.batizado}</td>
      </tr>
    `;
  });

  printContent += `
          </tbody>
        </table>
      </body>
    </html>
  `;

  const printWindow = window.open('', '', 'width=900,height=600');
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.print();
});

// ==============================
// ======= EVENTOS ==============
// ==============================
searchInput.addEventListener('input', () => renderTable(searchInput.value));
monthFilter.addEventListener('change', renderBirthdays);
orderFilter.addEventListener('change', renderBirthdays);

// ==============================
// ======= INICIALIZAR ==========
// ==============================
renderMonthOptions();
renderTable();
renderBirthdays();
