// Arquivo plain JS (sem module) — garante que login() exista globalmente
(function(){
  const VALID_USER = "iebpiloes";
  const VALID_PASS = "602398";

  const userInput = document.getElementById("loginUser");
  const passInput = document.getElementById("loginPass");
  const btn = document.getElementById("loginBtn");
  const errorEl = document.getElementById("errorMsg");

  function showError(msg) {
    errorEl.style.display = "block";
    errorEl.textContent = msg;
  }

  function clearError() {
    errorEl.style.display = "none";
    errorEl.textContent = "";
  }

  function login() {
    const user = (userInput && userInput.value || "").trim();
    const pass = (passInput && passInput.value || "").trim();

    if (!user || !pass) {
      showError("Preencha usuário e senha.");
      return;
    }

    if (user === VALID_USER && pass === VALID_PASS) {
      // Redireciona para a página principal
      // no seu caso, você disse que a página principal se chama page.html
      window.location.href = "page.html";
    } else {
      showError("Usuário ou senha incorretos!");
    }
  }

  // Ligar evento no botão
  if (btn) {
    btn.addEventListener("click", login);
  } else {
    // fallback: tentar deixar função global (raramente necessário)
    window.login = login;
  }

  // Enter no campo senha também faz login
  if (passInput) {
    passInput.addEventListener("keydown", function(e){
      if (e.key === "Enter") login();
    });
  }
})();
