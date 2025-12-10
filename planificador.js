// ===============================================
// PLANIFICADOR PRO
// ===============================================

// CSS del planificador (se inyecta dinámicamente)
const PLANNER_CSS = `
  #planner-app {
    --font-ui: system-ui, -apple-system, sans-serif;
    --bg: #ffffff;
    --text: #1f2937;
    --border: #e5e7eb;
    --c-assigned: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    --c-unassigned: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    --c-urgent: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
    --c-done: linear-gradient(135deg, #86efac 0%, #4ade80 100%);
    --pat-blocked: repeating-linear-gradient(45deg, #fee2e2, #fee2e2 10px, #fecaca 10px, #fecaca 20px);
    font-family: var(--font-ui);color: var(--text);background: #f9fafb;border-radius: 8px;padding: 20px;min-height: 700px;display: flex;flex-direction: column;gap: 15px;position: relative;
  }
  #planner-app * { box-sizing: border-box; }
  #planner-app.blocking-mode .pl-body { cursor: cell; }
  #planner-app.blocking-mode .drop-zone { background: rgba(254, 226, 226, 0.2); }
  #planner-app.blocking-mode .pl-card { pointer-events: none; opacity: 0.3; filter: grayscale(1); }
  .pl-block { position: absolute; top: 2px; bottom: 2px; background: var(--pat-blocked); border: 1px solid #ef4444; border-radius: 4px; z-index: 50; display: flex; align-items: center; justify-content: center; color: #b91c1c; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; pointer-events: none; opacity: 0.9; transition: all 0.2s; }
  .pl-block.recurring { background: repeating-linear-gradient(45deg, #fef3c7, #fef3c7 10px, #fde68a 10px, #fde68a 20px); border-color: #f59e0b; color: #b45309; }
  .pl-block.manual { background: repeating-linear-gradient(45deg, #fee2e2, #fee2e2 10px, #fecaca 10px, #fecaca 20px); border-color: #ef4444; color: #b91c1c; }
  #planner-app.blocking-mode .pl-block { pointer-events: auto; cursor: pointer; }
  #planner-app.blocking-mode .pl-block.manual:hover { background: #ef4444; color: white; }
  #planner-app.blocking-mode .pl-block.manual:hover::after { content: " ✕"; }
  #planner-app.blocking-mode .pl-block.recurring { pointer-events: none; cursor: not-allowed; }
  .pl-header { background: white; border: 1px solid var(--border); border-radius: 12px; padding: 15px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); gap: 15px; flex-wrap: wrap; }
  .pl-title h2 { margin: 0; font-size: 1.2rem; font-weight: 700; color: #111; }
  .pl-status { font-size: 0.85rem; color: #6b7280; margin-top: 4px; }
  .pl-controls { display: flex; gap: 10px; align-items: center; }
  .pl-btn { background: white; border: 1px solid var(--border); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: all 0.1s; color: #374151; display: flex; align-items: center; gap: 5px; }
  .pl-btn:hover { background: #f3f4f6; }
  .btn-ai { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; border: none; box-shadow: 0 2px 5px rgba(37, 99, 235, 0.3); }
  .btn-ai:hover { box-shadow: 0 4px 10px rgba(37, 99, 235, 0.4); transform: translateY(-1px); }
  .btn-block-mode { border: 2px dashed #ef4444; color: #ef4444; }
  .btn-block-mode.active { background: #ef4444; color: white; border-style: solid; animation: pulse 2s infinite; }
  @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
  .pl-views { background: #f3f4f6; padding: 4px; border-radius: 8px; display: flex; gap: 2px; }
  .pl-view-btn { border: none; background: transparent; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; color: #64748b; font-size: 0.85rem; }
  .pl-view-btn.active { background: white; color: #8b5cf6; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }
  .pl-body { flex: 1; background: white; border: 1px solid var(--border); border-radius: 12px; overflow: auto; display: flex; flex-direction: column; position: relative; min-height: 500px; }
  .pl-grid { display: grid; min-width: 100%; }
  .pl-head-cell { padding: 12px; text-align: center; font-weight: 600; font-size: 0.85rem; background: #f9fafb; border-bottom: 2px solid var(--border); border-right: 1px solid var(--border); position: sticky; top: 0; z-index: 20; color: #4b5563; }
  .pl-head-cell.first { left: 0; z-index: 30; background: #fafbfc; width: 240px; text-align: left; padding-left: 20px; box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05); }
  .pl-today { color: #8b5cf6; }
  .pl-row-head { padding: 10px 20px; background: #fafbfc; border-right: 2px solid var(--border); border-bottom: 1px solid var(--border); position: sticky; left: 0; z-index: 10; width: 240px; display: flex; flex-direction: column; justify-content: center; box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05); }
  .pl-name { font-weight: 700; font-size: 0.9rem; color: #111; display: flex; justify-content: space-between; align-items: center; }
  .pl-meta { font-size: 0.7rem; color: #6b7280; margin-top: 2px; font-weight: 500; display: flex; gap: 8px; }
  .pl-tag { padding: 1px 5px; border-radius: 4px; font-size: 0.65rem; background: #e5e7eb; color: #4b5563; }
  .pl-tag.fijo { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
  .pl-tag.star { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
  .over-limit { color: #dc2626 !important; font-weight: 700; }
  .pl-cell { border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); background: white; position: relative; }
  .pl-cell:nth-child(odd) { background: #fafafa; }
  .day-total-badge { position: absolute; bottom: 2px; right: 4px; font-size: 0.65rem; color: #9ca3af; font-weight: 700; background: rgba(255, 255, 255, 0.8); padding: 1px 4px; border-radius: 4px; pointer-events: none; z-index: 4; }
  .pl-overlay { position: absolute; inset: 0; z-index: 5; }
  .pl-overlay.drag-over { background: rgba(139, 92, 246, 0.1); }
  .pl-card { position: absolute; height: 54px; border-radius: 6px; padding: 4px 4px 4px 26px; cursor: grab; display: flex; flex-direction: column; justify-content: center; color: white; font-size: 0.75rem; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15); z-index: 10; overflow: hidden; transition: box-shadow 0.2s; }
  .guest-icon { position: absolute; top: 2px; right: 4px; font-size: 0.7rem; background: rgba(16, 185, 129, 0.9); border-radius: 3px; padding: 0 2px; }
  .pl-card:hover { z-index: 50; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); }
  .pl-card.assigned { background: var(--c-assigned); }
  .pl-card.unassigned { background: var(--c-unassigned); border: 2px dashed rgba(255, 255, 255, 0.6); }
  .pl-card.urgent { background: var(--c-urgent) !important; border: 1px solid #991b1b; }
  .pl-card.done { background: var(--c-done) !important; border: 2px solid #16a34a !important; color: #166534 !important; }
  .pl-card.done .pl-txt, .pl-card.done .pl-info { color: #166534 !important; }
  .pl-info { display: flex; align-items: center; gap: 3px; margin-bottom: 2px; flex-wrap: wrap; }
  .dist-tag { font-size: 0.65rem; font-weight: 700; padding: 1px 4px; border-radius: 3px; background: rgba(255, 255, 255, 0.4); }
  .pl-card.guest-checkout { border: 2px solid #10b981 !important; box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }
  .pl-time { font-weight: 800; font-size: 0.7rem; opacity: 0.95; margin-bottom: 2px; display: flex; align-items: center; flex-wrap: wrap; gap: 2px; }
  .pl-txt { font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.8rem; }
  .travel-tag { font-size: 0.6rem; background: rgba(255, 255, 255, 0.3); padding: 1px 4px; border-radius: 3px; display: inline-flex; align-items: center; gap: 2px; margin-left: 5px; color: #fff; font-weight: bold; }
  .dur-tag { font-size: 0.6rem; background: rgba(0, 0, 0, 0.2); padding: 1px 4px; border-radius: 3px; margin-left: 6px; color: #fff; font-weight: bold; }
  .workers-tag { font-size: 0.6rem; background: rgba(255, 255, 255, 0.35); padding: 1px 4px; border-radius: 3px; margin-left: 4px; color: #fff; font-weight: bold; }
  .guest-checkout-tag { font-size: 0.6rem; background: rgba(16, 185, 129, 0.9); padding: 1px 4px; border-radius: 3px; margin-left: 4px; color: #fff; font-weight: bold; animation: guestPulse 2s infinite; }
  @keyframes guestPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
  .pl-add-btn { position: absolute; top: 0; bottom: 0; left: 0; width: 22px; background: rgba(0, 0, 0, 0.1); border: none; color: white; font-size: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 100; transition: background 0.2s; }
  .pl-add-btn:hover { background: rgba(255, 255, 255, 0.4); }
  .pl-resize { position: absolute; right: 0; top: 0; bottom: 0; width: 10px; cursor: e-resize; z-index: 90; }
  .pl-ghost { position: absolute; background: rgba(139, 92, 246, 0.2); border: 2px dashed #8b5cf6; border-radius: 6px; pointer-events: none; z-index: 8; transition: all 0.05s linear; }
  .pl-ghost.error { background: rgba(239, 68, 68, 0.2); border-color: #ef4444; }
  .pl-loader { position: absolute; inset: 0; background: rgba(255, 255, 255, 0.9); z-index: 100; display: flex; align-items: center; justify-content: center; flex-direction: column; color: #6b7280; font-size: 0.9rem; }
  .pl-spinner { width: 30px; height: 30px; border: 3px solid #e5e7eb; border-top-color: #8b5cf6; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 10px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .pl-modal-bg { display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); z-index: 2000; align-items: center; justify-content: center; backdrop-filter: blur(2px); }
  .pl-modal-bg.open { display: flex; }
  .pl-modal { background: white; padding: 20px; border-radius: 12px; width: 380px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
  .pl-list { max-height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; margin: 15px 0; }
  .pl-opt { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 6px; cursor: pointer; border: 1px solid var(--border); transition: all 0.15s; }
  .pl-opt:hover { background: #f3f4f6; border-color: #8b5cf6; }
  .pl-opt input[type="checkbox"] { width: 18px; height: 18px; accent-color: #8b5cf6; }
  .ai-row { margin-bottom: 15px; }
  .ai-head { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 5px; }
  .ai-range { width: 100%; accent-color: #2563eb; }
  .ai-toggle-row { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; background: #eff6ff; padding: 10px; border-radius: 6px; border: 1px solid #bfdbfe; }
  .ai-toggle { width: 20px; height: 20px; accent-color: #2563eb; }
  .pl-toast { position: fixed; bottom: 20px; right: 20px; background: #1f2937; color: white; padding: 12px 24px; border-radius: 8px; z-index: 10000; transform: translateY(100px); transition: transform 0.3s; font-size: 0.9rem; }
  .pl-toast.show { transform: translateY(0); }
  .p-tooltip { position: fixed; background: white; border: 1px solid var(--border); padding: 12px 14px; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15); z-index: 9999; pointer-events: none; opacity: 0; transition: opacity 0.15s; font-size: 0.85rem; min-width: 260px; max-width: 320px; }
  .p-tooltip.visible { opacity: 1; }
  .p-tooltip .tt-head { font-weight: 700; font-size: 0.95rem; margin-bottom: 8px; color: #111; border-bottom: 1px solid var(--border); padding-bottom: 6px; }
  .p-tooltip .tt-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.85rem; gap: 10px; }
  .p-tooltip .tt-row span:first-child { color: #6b7280; white-space: nowrap; }
  .p-tooltip .tt-row b { text-align: right; }
  .max-emp-btn { min-width: 50px; justify-content: center; }
  .max-emp-btn.active { background: #8b5cf6; color: white; border-color: #8b5cf6; }
`;

// HTML del planificador
const PLANNER_HTML = `
<div id="planner-app">
  <div class="pl-header">
    <div class="pl-title"><h2>📅 Planificador Pro</h2><div id="pl-user-status" class="pl-status">Conectando...</div></div>
    <div style="display:flex; gap:15px; align-items:center; flex-wrap:wrap;">
      <button id="btn-block-mode" class="pl-btn btn-block-mode" onclick="plannerToggleBlockMode()"><span>🚫 Bloqueos</span></button>
      <button class="pl-btn btn-ai" onclick="plannerOpenAIModal()"><span>✨ Auto-Asignar</span></button>
      <button class="pl-btn" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border: none;" onclick="plannerRunFastOptimize()"><span>⚡ Rápido</span></button>
      <button class="pl-btn" onclick="plannerUnassignAll()"><span>🗑️ Reset</span></button>
      <div class="pl-views">
        <button class="pl-view-btn" data-view="month">Mes</button>
        <button class="pl-view-btn" data-view="week">Semana</button>
        <button class="pl-view-btn active" data-view="day">Día</button>
      </div>
    </div>
    <div class="pl-controls">
      <button id="pl-btn-prev" class="pl-btn">‹</button>
      <span id="pl-label-date" style="font-weight:700; min-width:140px; text-align:center;">...</span>
      <button id="pl-btn-next" class="pl-btn">›</button>
    </div>
  </div>
  <div class="pl-body">
    <div id="pl-loader" class="pl-loader"><div class="pl-spinner"></div><span>Cargando datos...</span></div>
    <div id="pl-content"></div>
  </div>
</div>

<div id="pl-modal" class="pl-modal-bg">
  <div class="pl-modal">
    <h3 style="margin:0">👥 Asignar Equipo</h3>
    <p style="margin:5px 0 0 0; font-size:0.85rem; color:#6b7280;">Selecciona uno o varios limpiadores</p>
    <div id="pl-cleaner-list" class="pl-list"></div>
    <div style="display:flex; justify-content:flex-end; gap:10px">
      <button class="pl-btn" onclick="plannerCloseModal()">Cancelar</button>
      <button class="pl-btn" style="background:#8b5cf6; color:white; border:none;" onclick="plannerSaveAssignments()">💾 Guardar</button>
    </div>
  </div>
</div>

<div id="pl-ai-modal" class="pl-modal-bg">
  <div class="pl-modal">
    <h3 style="margin:0 0 10px 0;">🤖 Auto-Asignación & Rutas</h3>
    <div class="ai-toggle-row">
      <input type="checkbox" id="ai-finish-15" class="ai-toggle">
      <label for="ai-finish-15" style="font-weight:600; font-size:0.9rem; cursor:pointer;">Límite 15:00</label>
    </div>
    <div class="ai-row">
      <div class="ai-head"><span>👥 Máx empleados/piso</span></div>
      <div style="display:flex; gap:10px; margin-top:5px;">
        <button type="button" class="pl-btn max-emp-btn active" data-val="1" onclick="plannerSetMaxEmp(1)">1</button>
        <button type="button" class="pl-btn max-emp-btn" data-val="2" onclick="plannerSetMaxEmp(2)">2</button>
      </div>
    </div>
    <div id="same-contract-row" class="ai-row" style="display:none;">
      <div class="ai-head"><span>🤝 Priorizar mismo contrato</span> <span id="v-contract">80%</span></div>
      <input type="range" class="ai-range" id="r-contract" min="0" max="100" value="80" oninput="document.getElementById('v-contract').innerText=this.value+'%'">
    </div>
    <div class="ai-row">
      <div class="ai-head"><span>🔥 Prioridad (urgentes)</span> <span id="v-priority">100%</span></div>
      <input type="range" class="ai-range" id="r-priority" min="0" max="100" value="100" oninput="document.getElementById('v-priority').innerText=this.value+'%'">
    </div>
    <div class="ai-row">
      <div class="ai-head"><span>📍 Cercanía</span> <span id="v-dist">70%</span></div>
      <input type="range" class="ai-range" id="r-dist" min="0" max="100" value="70" oninput="document.getElementById('v-dist').innerText=this.value+'%'">
    </div>
    <div class="ai-row">
      <div class="ai-head"><span>Contrato Fijo</span> <span id="v-fixed">50%</span></div>
      <input type="range" class="ai-range" id="r-fixed" min="0" max="100" value="50" oninput="document.getElementById('v-fixed').innerText=this.value+'%'">
    </div>
    <div class="ai-row">
      <div class="ai-head"><span>Rating (★)</span> <span id="v-rating">40%</span></div>
      <input type="range" class="ai-range" id="r-rating" min="0" max="100" value="40" oninput="document.getElementById('v-rating').innerText=this.value+'%'">
    </div>
    <div class="ai-row">
      <div class="ai-head"><span>Balance Carga</span> <span id="v-load">60%</span></div>
      <input type="range" class="ai-range" id="r-load" min="0" max="100" value="60" oninput="document.getElementById('v-load').innerText=this.value+'%'">
    </div>
    <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
      <button class="pl-btn" onclick="plannerCloseAIModal()">Cancelar</button>
      <button class="pl-btn btn-ai" onclick="plannerRunAutoAssign()">🚀 Ejecutar</button>
    </div>
  </div>
</div>

<div id="pl-toast" class="pl-toast">Guardado</div>
<div id="pl-tooltip" class="p-tooltip"></div>
`;

// Variables globales del planificador
let plannerApp = null;
let plannerEditingId = null;
let plannerMaxEmployees = 1;

// Funciones globales para los onclick
function plannerCloseModal() { 
  document.getElementById('pl-modal').classList.remove('open'); 
}
function plannerCloseAIModal() { 
  document.getElementById('pl-ai-modal').classList.remove('open'); 
}
function plannerOpenAIModal() { 
  document.getElementById('pl-ai-modal').classList.add('open'); 
}
function plannerSetMaxEmp(val) {
  plannerMaxEmployees = val;
  document.querySelectorAll('.max-emp-btn').forEach(b => b.classList.toggle('active', parseInt(b.dataset.val) === val));
  document.getElementById('same-contract-row').style.display = val > 1 ? 'block' : 'none';
}
function plannerToggleBlockMode() { 
  if(!plannerApp) return; 
  plannerApp.toggleBlockMode(); 
  document.getElementById('btn-block-mode').classList.toggle('active', plannerApp.blockMode); 
}
function plannerSaveAssignments() { 
  if(!plannerApp) return; 
  const ids = Array.from(document.querySelectorAll('#pl-cleaner-list input:checked')).map(c=>c.value); 
  plannerCloseModal(); 
  plannerApp.updateLocalTask(plannerEditingId, { [plannerApp.cfg.fieldCleanerId]: ids }); 
  plannerApp.refreshUI(); 
  plannerApp.apiUpdate(plannerEditingId, { [plannerApp.cfg.fieldCleanerId]: ids })
    .then(() => plannerApp.toast('✓ Guardado'))
    .catch(() => plannerApp.toast('Error al guardar', true)); 
}
function plannerRunAutoAssign() { 
  plannerCloseAIModal(); 
  if(!plannerApp) return; 
  const w = { 
    dist: parseInt(document.getElementById('v-dist').innerText)/100, 
    fixed: parseInt(document.getElementById('v-fixed').innerText)/100, 
    rating: parseInt(document.getElementById('v-rating').innerText)/100, 
    price: 0.3, 
    load: parseInt(document.getElementById('v-load').innerText)/100, 
    limit15: document.getElementById('ai-finish-15').checked, 
    maxEmp: plannerMaxEmployees, 
    sameContract: parseInt(document.getElementById('v-contract').innerText)/100, 
    priority: parseInt(document.getElementById('v-priority').innerText)/100 
  }; 
  plannerApp.runAutoAllocation(w); 
}
function plannerUnassignAll() { 
  if(!plannerApp || !confirm("⚠️ ¿Resetear todo?")) return; 
  plannerApp.unassignVisible(); 
}
function plannerRunFastOptimize() { 
  if (!plannerApp) return; 
  plannerApp.runFastOptimize(); 
}

// Función principal para renderizar el planificador
function renderPlanificador() {
  const container = document.getElementById('planner-container');
  if (!container) return;
  
  // Inyectar CSS si no existe
  if (!document.getElementById('planner-styles')) {
    const style = document.createElement('style');
    style.id = 'planner-styles';
    style.textContent = PLANNER_CSS;
    document.head.appendChild(style);
  }
  
  // Inyectar HTML
  container.innerHTML = PLANNER_HTML;
  
  // Inicializar la app
  setTimeout(() => {
    if (!plannerApp) {
      plannerApp = new PlannerApp();
      plannerApp.init();
    } else {
      plannerApp.renderStructure();
    }
  }, 100);
}

// Clase principal del planificador
class PlannerApp {
  constructor() {
    this.cfg = {
      workerUrl: API, // Usa la variable API de core.js
      reservationsTable: 'tblD39cLQS9QtXYn4',
      reservationsView: 'Master',
      cleanersTable: 'tbl0YX0aruvn8FhSw',
      blocksTable: 'Bloqueos',
      fieldCleanerId: 'limpiadores vinculados',
      fieldCleanerName: 'cleaner name',
      fieldServiceDate: 'Servicio de limpieza asignado en base a la reserva',
      fieldDuration: 'Duration',
      fieldLimpiezaTiempo: 'Limpieza-tiempo',
      fieldDaysUntilNext: 'Días hasta la próxima reserva',
      fieldProperty: 'Property',
      fieldGuest: 'Viajero',
      fieldClientEmail: 'Cliente email',
      fieldCleaningStatus: 'Cleaning Status',
      fieldCheckoutTime: 'Check out time',
      fieldCheckoutTimeGuest: 'check-out-time-guest',
      fieldLat: 'latitude',
      fieldLon: 'longitude',
      fieldTimezone: 'time zone',
      fieldCleanerTableEmail: 'Email propietario',
      fieldCleanerType: 'Tipo-Icono',
      cleanerTableNameField: 'Name',
      fieldWeeklyOff: 'Dias Libres Recurrentes',
      fieldCleanerContract: 'Tipo-Contrato',
      fieldCleanerRating: 'Rating-employee',
      fieldCleanerMaxHours: 'Horas Maximas',
      fieldCleanerPrice: 'Precio Hora',
      fieldBlockCleaner: 'Empleado',
      fieldBlockStart: 'Fecha Inicio',
      fieldBlockEnd: 'Fecha Fin',
      fieldBlockReason: 'Motivo'
    };
    
    this.date = new Date();
    this.view = 'day';
    this.tasks = [];
    this.cleaners = [];
    this.blocks = [];
    this.startH = 0;
    this.endH = 23;
    this.blockMode = false;
    this.userEmail = S.clienteEmail || null;
    this.config = null;
    
    this.els = {
      status: document.getElementById('pl-user-status'),
      loader: document.getElementById('pl-loader'),
      content: document.getElementById('pl-content'),
      dateLabel: document.getElementById('pl-label-date')
    };
  }

  async init() {
    if (this.userEmail) {
      this.els.status.innerHTML = `Usuario: <b>${this.userEmail}</b>`;
    } else {
      this.els.status.innerHTML = `⚠️ Modo Admin`;
    }
    
    await this.loadCleaners();
    
    // Event listeners
    document.querySelectorAll('.pl-view-btn').forEach(b => 
      b.addEventListener('click', e => this.setView(e.target.dataset.view))
    );
    document.getElementById('pl-btn-prev').addEventListener('click', () => this.move(-1));
    document.getElementById('pl-btn-next').addEventListener('click', () => this.move(1));
    
    this.renderStructure();
  }

  async loadCleaners() {
    try {
      // Usar empleados de S si están disponibles
      if (S.empleados && S.empleados.length > 0) {
        this.cleaners = S.empleados.filter(e => e.activo).map(e => ({
          id: e.id,
          name: e.nombre || 'Sin Nombre',
          offs: (e.dias_libres || []).map(d => parseInt(d)),
          type: e.tipo || 'Externo',
          rating: e.rating || 3,
          maxHours: e.horas_maximas || 40,
          price: e.precio_hora || 15
        })).sort((a,b) => a.name.localeCompare(b.name));
      } else {
        this.cleaners = [];
      }
      this.cleaners.unshift({ id: '', name: 'Sin Asignar', offs: [] });
    } catch(e) {
      console.error('Error cargando limpiadores:', e);
      this.cleaners = [{ id: '', name: 'Sin Asignar', offs: [] }];
    }
  }

  openModal(currentIds) {
    const list = document.getElementById('pl-cleaner-list');
    const selected = Array.isArray(currentIds) ? currentIds : [];
    const available = this.cleaners.filter(c => c.id);
    
    if (available.length === 0) {
      list.innerHTML = '<p style="text-align:center; color:#6b7280; padding:20px;">No hay limpiadores disponibles</p>';
    } else {
      list.innerHTML = available.map(c => `
        <label class="pl-opt">
          <input type="checkbox" value="${c.id}" ${selected.includes(c.id) ? 'checked' : ''}>
          <span style="flex:1; font-weight:600;">${c.name}</span>
          ${c.type === 'Fijo' ? '<span class="pl-tag fijo">Fijo</span>' : '<span class="pl-tag">Externo</span>'}
          ${c.rating ? `<span class="pl-tag star">★${c.rating}</span>` : ''}
        </label>
      `).join('');
    }
    document.getElementById('pl-modal').classList.add('open');
  }

  toggleBlockMode() {
    this.blockMode = !this.blockMode;
    document.getElementById('planner-app').classList.toggle('blocking-mode', this.blockMode);
    if (this.blockMode) {
      this.toast('🛑 Haz click en un día para bloquear/desbloquear');
    } else {
      this.toast('Modo Normal');
    }
  }

  async unassignVisible() {
    this.toast('🧹 Limpiando...');
    let count = 0;
    for (const t of this.tasks) {
      const names = t.fields[this.cfg.fieldCleanerName];
      if (names && names !== 'Sin Asignar') {
        const update = { [this.cfg.fieldCleanerId]: [] };
        this.updateLocalTask(t.id, update);
        count++;
      }
    }
    this.refreshUI();
    this.toast(`🗑️ ${count} tareas desasignadas`);
  }

  async runAutoAllocation(w) {
    this.toast('🤖 Optimizando...');
    // Implementación simplificada - asignar al primer limpiador disponible
    const unassigned = this.tasks.filter(t => {
      const name = t.fields[this.cfg.fieldCleanerName];
      return !name || name === 'Sin Asignar';
    });
    
    if (unassigned.length === 0) {
      this.toast('No hay tareas sin asignar');
      return;
    }
    
    let assigned = 0;
    const available = this.cleaners.filter(c => c.id);
    
    for (const t of unassigned) {
      if (available.length > 0) {
        const cleaner = available[assigned % available.length];
        this.updateLocalTask(t.id, { [this.cfg.fieldCleanerId]: [cleaner.id] });
        assigned++;
      }
    }
    
    this.refreshUI();
    this.toast(`✅ ${assigned} tareas asignadas`);
  }

  async runFastOptimize() {
    this.toast('⚡ Optimizando cuadrante...');
    await this.runAutoAllocation({ maxEmp: 1 });
  }

  setView(v) {
    this.view = v;
    document.querySelectorAll('.pl-view-btn').forEach(b => 
      b.classList.toggle('active', b.dataset.view === v)
    );
    this.renderStructure();
  }

  move(d) {
    if (this.view === 'month') this.date.setMonth(this.date.getMonth() + d);
    else if (this.view === 'week') this.date.setDate(this.date.getDate() + (d * 7));
    else this.date.setDate(this.date.getDate() + d);
    this.renderStructure();
  }

  updateLocalTask(id, f) {
    const t = this.tasks.find(x => x.id === id);
    if (t) {
      t.fields = { ...t.fields, ...f };
      if (f[this.cfg.fieldCleanerId]) {
        const names = [];
        f[this.cfg.fieldCleanerId].forEach(nid => {
          const c = this.cleaners.find(cl => cl.id === nid);
          if (c) names.push(c.name);
        });
        t.fields[this.cfg.fieldCleanerName] = names.length ? names : null;
      }
    }
  }

  async apiUpdate(id, fields) {
    // Placeholder - implementar según tu API
    console.log('API Update:', id, fields);
  }

  getConfig() {
    const y = this.date.getFullYear(), m = this.date.getMonth();
    let s, e, cols = [], title = '';
    const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    
    if (this.view === 'month') {
      s = new Date(y, m, 1);
      e = new Date(y, m + 1, 0);
      title = s.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      for (let i = 1; i <= e.getDate(); i++) {
        const d = new Date(y, m, i);
        cols.push({ 
          label: i, 
          sub: d.toLocaleDateString('es-ES', {weekday:'narrow'}), 
          date: iso(d), 
          d: d.getDay(), 
          today: d.toDateString() === new Date().toDateString() 
        });
      }
    } else if (this.view === 'week') {
      const d = new Date(this.date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      s = new Date(d.setDate(diff));
      e = new Date(s);
      e.setDate(e.getDate() + 6);
      title = `${s.getDate()} - ${e.toLocaleDateString('es-ES', {day:'numeric', month:'short'})}`;
      for (let i = 0; i < 7; i++) {
        const d = new Date(s);
        d.setDate(d.getDate() + i);
        cols.push({ 
          label: d.getDate(), 
          sub: d.toLocaleDateString('es-ES', {weekday:'short'}), 
          date: iso(d), 
          d: d.getDay(), 
          today: d.toDateString() === new Date().toDateString() 
        });
      }
    } else {
      s = new Date(this.date);
      e = new Date(this.date);
      title = s.toLocaleDateString('es-ES', {weekday:'long', day:'numeric', month:'long'});
      for (let h = this.startH; h <= this.endH; h++) {
        cols.push({ label: `${h}:00`, sub: '', hour: h, date: iso(s), d: s.getDay() });
      }
    }
    return { s, e, cols, title };
  }

  async renderStructure() {
    this.els.loader.style.display = 'flex';
    this.config = this.getConfig();
    this.els.dateLabel.textContent = this.config.title;
    await this.loadData(this.config.s, this.config.e);
    this.refreshUI();
    this.els.loader.style.display = 'none';
  }

  async loadData(s, e) {
    // Usar datos de S (servicios y reservas)
    const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const start = iso(s);
    const endD = new Date(e);
    endD.setDate(endD.getDate() + 1);
    const end = iso(endD);
    
    // Convertir servicios a formato de tareas del planificador
    this.tasks = (S.servicios || []).filter(srv => {
      const fecha = srv.fecha_servicio;
      return fecha >= start && fecha < end;
    }).map(srv => ({
      id: srv.id,
      fields: {
        [this.cfg.fieldProperty]: srv.propiedad_nombre,
        [this.cfg.fieldServiceDate]: srv.fecha_servicio + 'T' + (srv.hora_inicio || '10:00'),
        [this.cfg.fieldCleanerName]: srv.empleado_nombre || 'Sin Asignar',
        [this.cfg.fieldCleanerId]: srv.empleado_id ? [srv.empleado_id] : [],
        [this.cfg.fieldDuration]: 3600,
        [this.cfg.fieldGuest]: srv.huesped_nombre || '',
        [this.cfg.fieldCleaningStatus]: srv.estado
      }
    }));
    
    this.blocks = [];
  }

  refreshUI() {
    if (!this.config) return;
    const cfg = this.config;
    
    // Mapear tareas por limpiador
    const map = new Map();
    this.cleaners.forEach(c => map.set(c.name, { 
      id: c.id, tasks: [], offs: c.offs, totalSec: 0, 
      type: c.type, rating: c.rating, maxHours: c.maxHours || 40 
    }));
    
    this.tasks.forEach(r => {
      let names = r.fields[this.cfg.fieldCleanerName];
      if (!names) names = ['Sin Asignar'];
      else if (!Array.isArray(names)) names = [names];
      
      names.forEach(n => {
        if (!map.has(n)) map.set(n, { id: '', tasks: [], offs: [], totalSec: 0 });
        const entry = map.get(n);
        entry.tasks.push(r);
        entry.totalSec += (r.fields[this.cfg.fieldDuration] || 3600) / names.length;
      });
    });
    
    // Ordenar limpiadores
    const sorted = [];
    this.cleaners.forEach(c => {
      if (map.has(c.name)) {
        sorted.push({ name: c.name, ...map.get(c.name) });
        map.delete(c.name);
      }
    });
    map.forEach((v, k) => sorted.push({ name: k, ...v }));
    
    // Construir grid
    const colWidth = this.view === 'day' ? '80px' : 'minmax(100px, 1fr)';
    const gridWidth = this.view === 'day' ? `${240 + (cfg.cols.length * 80)}px` : '100%';
    
    let h = `<div class="pl-grid" style="grid-template-columns: 240px repeat(${cfg.cols.length}, ${colWidth}); min-width: ${gridWidth};">`;
    h += '<div class="pl-head-cell first">Limpiador</div>';
    cfg.cols.forEach(c => h += `<div class="pl-head-cell ${c.today?'pl-today':''}">${c.sub} <span style="font-size:1.1em">${c.label}</span></div>`);
    
    sorted.forEach(c => {
      const minH = this.view === 'month' ? 60 : 80;
      const weeklyH = (c.totalSec / 3600).toFixed(1);
      let tags = '';
      if (c.type === 'Fijo') tags += `<span class="pl-tag fijo">Fijo</span>`;
      if (c.rating) tags += `<span class="pl-tag star">★${c.rating}</span>`;
      const isOver = parseFloat(weeklyH) > c.maxHours;
      
      h += `<div class="pl-row-head" style="min-height:${minH}px">
        <div class="pl-name"><span>${c.name}</span> ${tags}</div>
        <div class="pl-meta">
          <span>📋 ${c.tasks.length}</span>
          <span class="${isOver?'over-limit':''}">⏱ ${weeklyH}h / ${c.maxHours}h</span>
        </div>
      </div>`;
      
      h += `<div style="grid-column:2/-1; position:relative; min-height:${minH}px; display:grid; grid-template-columns:repeat(${cfg.cols.length}, 1fr)">`;
      for (let i = 0; i < cfg.cols.length; i++) {
        h += `<div class="pl-cell"></div>`;
      }
      h += `<div class="pl-overlay drop-zone" data-name="${c.name}" data-id="${c.id||''}"></div></div>`;
    });
    
    h += '</div>';
    this.els.content.innerHTML = h;
    
    // Dibujar tarjetas
    this.drawBars(sorted, cfg);
  }

  drawBars(list, cfg) {
    list.forEach(c => {
      const el = document.querySelector(`.drop-zone[data-name="${c.name}"]`);
      if (!el) return;
      
      const map = {};
      
      c.tasks.forEach(r => {
        const f = r.fields;
        const raw = f[this.cfg.fieldServiceDate];
        if (!raw) return;
        
        const d = new Date(raw);
        const dStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        const h = d.getHours();
        const m = d.getMinutes();
        
        let idx = -1, left = 0, width = 0;
        const wCol = 100 / cfg.cols.length;
        const durTotal = (f[this.cfg.fieldDuration] || 3600) / 3600;
        
        if (this.view === 'day') {
          if (d.toDateString() !== this.date.toDateString()) return;
          idx = cfg.cols.findIndex(col => col.hour === h);
          if (idx !== -1) {
            left = (idx * wCol) + ((m / 60) * wCol);
            width = durTotal * wCol;
          } else return;
        } else {
          idx = cfg.cols.findIndex(col => col.date === dStr);
          if (idx !== -1) {
            left = idx * wCol;
            width = wCol;
          }
        }
        
        if (idx === -1) return;
        
        if (!map[idx]) map[idx] = 0;
        const stack = map[idx]++;
        
        const bar = document.createElement('div');
        let cls = `pl-card ${c.name === 'Sin Asignar' ? 'unassigned' : 'assigned'}`;
        const st = f[this.cfg.fieldCleaningStatus] || '';
        if (st === 'completado') cls += ' done';
        else if (st === 'urgente') cls += ' urgent';
        bar.className = cls;
        bar.style.left = left + '%';
        bar.style.width = `calc(${width}% - 4px)`;
        bar.style.top = (6 + stack * (this.view === 'month' ? 38 : 58)) + 'px';
        if (this.view === 'month') bar.style.height = '34px';
        
        bar.innerHTML = `
          <button class="pl-add-btn" onmousedown="event.stopPropagation()">+</button>
          <div class="pl-txt">${f[this.cfg.fieldProperty] || 'Sin Prop'}</div>
        `;
        bar.dataset.id = r.id;
        
        bar.querySelector('.pl-add-btn').onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          plannerEditingId = r.id;
          this.openModal(f[this.cfg.fieldCleanerId]);
        };
        
        el.appendChild(bar);
      });
    });
  }

  toast(m, err) {
    const t = document.getElementById('pl-toast');
    t.innerText = m;
    t.style.background = err ? '#ef4444' : '#1f2937';
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }
}
