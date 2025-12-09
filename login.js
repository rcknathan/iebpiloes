document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value.trim();

  const validUser = "iebpiloes";
  const validPass = "602398";

  if (user === validUser && pass === validPass) {
    window.location.href = "index.html";
  } else {
    const errorMsg = document.getElementById("errorMsg");
    errorMsg.style.display = "block";
    errorMsg.textContent = "Usuário ou senha incorretos!";
  }
});