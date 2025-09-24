// util: guarda y carga del storage (para que no se pierdan si se recarga la página)
const STORAGE_KEY = "decidi_opciones_v1";
//

const $form = document.getElementById("form");
const $input = document.getElementById("texto");
const $lista = document.getElementById("lista");
const $resultado = document.getElementById("resultado");
const $mezclar = document.getElementById("mezclarBtn");
const $decidir = document.getElementById("decidirBtn");
const $limpiar = document.getElementById("limpiarBtn");

let opciones = load() || [];

render();

// ---- eventos
$form.addEventListener("submit", (e) => {
  e.preventDefault();
  const val = $input.value.trim();
  if (!val) return;

  // se evita duplicados (insensible a mayúsculas)
  const exists = opciones.some(o => o.toLowerCase() === val.toLowerCase());
  if (!exists) {
    opciones.push(val);
    save(opciones);
    render();
  }
  $input.value = "";
  $input.focus();
});

$mezclar.addEventListener("click", () => {
  if (opciones.length < 2) return pulseResult("agregá al menos 2");
  shuffle(opciones);
  save(opciones);
  render(true);
});

$decidir.addEventListener("click", () => {
  if (opciones.length < 2) return pulseResult("agregá al menos 2");

  // pequeña "animación" de barajar antes de elegir "barajen bien"
  const clones = [...opciones];
  let ticks = 10;
  const ticker = setInterval(() => {
    shuffle(clones);
    showResult("… " + clones[0]);
    ticks--;
    if (ticks <= 0) {
      clearInterval(ticker);
      const elegido = randomOf(opciones);
      showResult("→ " + elegido);
    }
  }, 60);
});

$limpiar.addEventListener("click", () => {
  opciones = [];
  save(opciones);
  render();
  showResult(""); // ocultar
});

// ---- funciones UI
function render(reordered = false) {
  $lista.innerHTML = "";
  opciones.forEach((txt, i) => {
    const li = document.createElement("li");
    li.className = "chip";
    li.innerHTML = `
      <span>${escapeHTML(txt)}</span>
      <button type="button" aria-label="quitar ${escapeHTML(txt)}" title="quitar">✕</button>
    `;
    li.querySelector("button").addEventListener("click", () => {
      opciones.splice(i, 1);
      save(opciones);
      render();
    });
    $lista.appendChild(li);
  });

  if (reordered) {
    $lista.classList.add("reorder");
    setTimeout(() => $lista.classList.remove("reorder"), 180);
  }

  // mostrar/ocultar resultado si no hay nada
  if (opciones.length === 0) {
    $resultado.classList.remove("show");
    $resultado.textContent = "";
  }
}

function showResult(text) {
  $resultado.textContent = text;
  if (text) $resultado.classList.add("show");
}

function pulseResult(text) {
  showResult(text);
  $resultado.style.transform = "scale(1.03)";
  setTimeout(() => ($resultado.style.transform = ""), 120);
}

// ---- helpers
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randomOf(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function save(arr) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch {}
}

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function escapeHTML(str){
  return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
