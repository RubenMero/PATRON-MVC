// LOGIN VALIDADO EN TIEMPO REAL
const credentials = {
  'admin@uleam.edu.ec': 'admin12345',
  'guardia@uleam.edu.ec': 'guardia12345',
  'supervisor@uleam.edu.ec': 'supervisor12345'
};

const form = document.getElementById('loginForm');
const usuarioInput = document.getElementById('usuario');
const passwordInput = document.getElementById('password');
const usuarioError = document.getElementById('usuarioError');
const passwordError = document.getElementById('passwordError');
const rememberMe = document.getElementById('rememberMe');
const btnLogin = document.getElementById('btnLogin');

// Validación de correo institucional ULEAM
function validarEmailUleam(email) {
  const regex = /^[a-zA-Z0-9._-]+@uleam\.edu\.ec$/;
  return regex.test(email);
}

// === Validación en tiempo real ===
usuarioInput.addEventListener('input', () => {
  const value = usuarioInput.value.trim();
  if (value.includes('@')) {
    if (!validarEmailUleam(value)) {
      usuarioInput.classList.add('is-invalid');
      usuarioInput.classList.remove('is-valid');
      usuarioError.textContent = 'Debe usar un correo institucional @uleam.edu.ec';
    } else {
      usuarioInput.classList.add('is-valid');
      usuarioInput.classList.remove('is-invalid');
      usuarioError.textContent = '';
    }
  } else if (value.length < 3) {
    usuarioInput.classList.add('is-invalid');
    usuarioError.textContent = 'El usuario debe tener al menos 3 caracteres';
  } else if (value === '') {
    usuarioInput.classList.remove('is-invalid', 'is-valid');
    usuarioError.textContent = '';
  } else {
    usuarioInput.classList.add('is-valid');
    usuarioInput.classList.remove('is-invalid');
    usuarioError.textContent = '';
  }
});

passwordInput.addEventListener('input', () => {
  const value = passwordInput.value.trim();
  if (value.length < 8) {
    passwordInput.classList.add('is-invalid');
    passwordError.textContent = 'La contraseña debe tener al menos 8 caracteres';
  } else {
    passwordInput.classList.add('is-valid');
    passwordInput.classList.remove('is-invalid');
    passwordError.textContent = '';
  }
});

// === Procesar el login ===
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const user = usuarioInput.value.trim();
  const pass = passwordInput.value.trim();

  if (!user) {
    usuarioError.textContent = 'Ingrese su usuario o correo';
    usuarioInput.classList.add('is-invalid');
    return;
  }
  if (!pass) {
    passwordError.textContent = 'Ingrese su contraseña';
    passwordInput.classList.add('is-invalid');
    return;
  }

  if (credentials[user] && credentials[user] === pass) {
    localStorage.setItem('usuarioActivo', user);
    localStorage.setItem('horaLogin', new Date().toLocaleString('es-EC'));
    if (rememberMe.checked) localStorage.setItem('recordarSesion', 'true');

    btnLogin.disabled = true;
    btnLogin.textContent = '✓ Acceso concedido';
    btnLogin.classList.add('success');

    setTimeout(() => window.location.href = 'dashboard.html', 1200);
  } else {
    passwordError.textContent = 'Usuario o contraseña incorrectos';
    passwordInput.classList.add('is-invalid');
    btnLogin.classList.add('error');
    btnLogin.textContent = '✗ Credenciales incorrectas';
    setTimeout(() => {
      btnLogin.classList.remove('error');
      btnLogin.textContent = 'Iniciar Sesión';
    }, 2000);
  }
});

// Auto-login si está activado “Recordar sesión”
if (localStorage.getItem('recordarSesion') === 'true' && localStorage.getItem('usuarioActivo')) {
  window.location.href = 'dashboard.html';
}