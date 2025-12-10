// ===============================================
// RENDERS - Todas las funciones de renderizado
// ===============================================
// ===== RENDERS =====
function renderDashboard() {
  const hoy = new Date().toISOString().split('T')[0];
  const servHoy = S.servicios.filter(s => s.fecha_servicio === hoy);
  const pendientes = S.servicios.filter(s => s.estado === 'pendiente' || s.estado === 'confirmado');
  const stockBajo = S.inventario.filter(i => i.stock < i.stock_minimo);
  
  $('#stat-hoy').textContent = servHoy.length;
  $('#stat-pendientes').textContent = pendientes.length;
  $('#stat-props').textContent = S.propiedades.length;
  $('#stat-stock-bajo').textContent = stockBajo.length;
  
  // Badge
  if (pendientes.length) {
    $('#servicios-badge').style.display = 'inline';
    $('#servicios-badge').textContent = pendientes.length;
  } else {
    $('#servicios-badge').style.display = 'none';
  }
  
  if (stockBajo.length) {
    $('#stock-alert-badge').style.display = 'inline';
    $('#stock-alert-badge').textContent = stockBajo.length;
  } else {
    $('#stock-alert-badge').style.display = 'none';
  }
  
  // Próximos servicios
  const proximos = S.servicios.filter(s => s.fecha_servicio >= hoy && s.estado !== 'completado' && s.estado !== 'cancelado').sort((a,b) => a.fecha_servicio.localeCompare(b.fecha_servicio)).slice(0, 5);
  
  $('#dash-servicios').innerHTML = proximos.length ? proximos.map(s => `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border);">
      <div>
        <div style="font-weight:600;">${s.propiedad_nombre}</div>
        <div style="font-size:0.8rem; color:var(--text-muted);">${formatDate(s.fecha_servicio)} ${s.hora_inicio || ''}</div>
      </div>
      <span class="badge ${estadoBadge(s.estado)}">${s.estado}</span>
    </div>
  `).join('') : '<p style="color:var(--text-muted); text-align:center; padding:20px;">Sin servicios próximos</p>';
  
  // Alertas
  let alertas = [];
  if (stockBajo.length) alertas.push(`⚠️ ${stockBajo.length} artículos con stock bajo`);
  const mantPend = S.mantenimiento.filter(m => m.estado === 'pendiente');
  if (mantPend.length) alertas.push(`🔧 ${mantPend.length} incidencias pendientes`);
  
  $('#dash-alertas').innerHTML = alertas.length ? alertas.map(a => `<div style="padding:10px 0; border-bottom:1px solid var(--border);">${a}</div>`).join('') : '<p style="color:var(--text-muted); text-align:center; padding:20px;">✓ Todo en orden</p>';
}

function renderServicios() {
  const fecha = $('#serv-fecha').value;
  const estado = $('#serv-estado').value;
  const prop = $('#serv-propiedad').value;
  
  let list = S.servicios;
  if (fecha) list = list.filter(s => s.fecha_servicio === fecha);
  if (estado) list = list.filter(s => s.estado === estado);
  if (prop) list = list.filter(s => s.propiedad_nombre === prop);
  
  list.sort((a, b) => b.fecha_servicio.localeCompare(a.fecha_servicio));
  
  $('#servicios-tbody').innerHTML = list.length ? list.map(s => `
    <tr>
      <td>${formatDate(s.fecha_servicio)}</td>
      <td>${s.hora_inicio || '-'}</td>
      <td><strong>${s.propiedad_nombre}</strong></td>
      <td><span class="badge badge-neutral">${s.tipo_servicio || 'checkout'}</span></td>
      <td>${s.huesped_nombre || '-'}</td>
      <td>${s.empleado_nombre || '<span style="color:var(--text-muted)">Sin asignar</span>'}</td>
      <td><span class="badge ${estadoBadge(s.estado)}">${s.estado}</span></td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="editServicio(${s.id})">✏️</button>
        ${s.estado !== 'completado' ? `<button class="btn btn-sm btn-success" onclick="completarServicio(${s.id})">✓</button>` : ''}
      </td>
    </tr>
  `).join('') : '<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--text-muted);">Sin servicios</td></tr>';
}

function renderReservas() {
  const tbody = $('#reservas-tbody');
  const emptyEl = $('#reservas-empty');
  
  // Filtros
  const desde = $('#res-desde').value;
  const hasta = $('#res-hasta').value;
  const origen = $('#res-origen').value;
  const status = $('#res-status').value;
  
  let filtered = [...S.reservas];
  
  if (desde) filtered = filtered.filter(r => r.check_in >= desde);
  if (hasta) filtered = filtered.filter(r => r.check_in <= hasta);
  if (origen) filtered = filtered.filter(r => r.origen === origen);
  if (status) filtered = filtered.filter(r => r.status === status);
  
  // Ordenar por check_in
  filtered.sort((a, b) => new Date(a.check_in) - new Date(b.check_in));
  
  if (!filtered.length) {
    tbody.innerHTML = '';
    emptyEl.style.display = 'block';
    return;
  }
  
  emptyEl.style.display = 'none';
  
  const statusBadge = (s) => {
    if (s === 'confirmed') return 'badge-success';
    if (s === 'cancelled') return 'badge-danger';
    return 'badge-warning';
  };
  
  const statusText = (s) => {
    if (s === 'confirmed') return '✅ Confirmada';
    if (s === 'cancelled') return '❌ Cancelada';
    return '⏳ Pendiente';
  };
  
  const canalIcon = (origen, partner) => {
    if (partner?.toLowerCase().includes('airbnb')) return '🏠 Airbnb';
    if (partner?.toLowerCase().includes('booking')) return '🅱️ Booking';
    if (origen === 'avaibook') return '📗 Avaibook';
    if (origen === 'icnea') return '📘 Icnea';
    return partner || origen || 'Directo';
  };
  
  tbody.innerHTML = filtered.map(r => `
    <tr>
      <td><strong>${formatDate(r.check_in)}</strong></td>
      <td>${formatDate(r.check_out)}</td>
      <td>${r.propiedad_nombre || '<span style="color:var(--text-muted)">Sin asignar</span>'}</td>
      <td>
        <div>${r.huesped_nombre || 'Huésped'}</div>
        <small style="color:var(--text-muted)">${r.huesped_email || ''}</small>
      </td>
      <td>${r.num_huespedes || '-'} (${r.num_adultos || 0}A/${r.num_ninos || 0}N)</td>
      <td>${canalIcon(r.origen, r.partner_name)}</td>
      <td><span class="badge ${statusBadge(r.status)}">${statusText(r.status)}</span></td>
      <td><strong>${r.precio ? r.precio.toFixed(2) + '€' : '-'}</strong></td>
    </tr>
  `).join('');
}

async function syncAllReservas() {
  toast('Sincronizando reservas de todos los PMS...');
  
  const plataformas = [...new Set(S.credenciales.filter(c => c.activo).map(c => c.plataforma))];
  
  for (const plataforma of plataformas) {
    await syncReservas(plataforma);
  }
  
  await loadAll();
  renderReservas();
  toast('✅ Sincronización completada');
}
function renderKits() {
  $('#kits-grid').innerHTML = S.kits.length ? S.kits.map(k => `
    <div class="item-card">
      <div class="item-card-title">${k.nombre}</div>
      <div class="item-card-meta">${k.descripcion || ''}</div>
    </div>
  `).join('') : empty('🎁', 'Sin kits');
}

function renderPropiedades() {
  $('#propiedades-grid').innerHTML = S.propiedades.length ? S.propiedades.map(p => `
    <div class="item-card">
      <div class="item-card-header">
        <div class="item-card-title">${p.propiedad_nombre}</div>
        <span class="badge badge-neutral">${p.precio_limpieza || 0}€</span>
      </div>
    </div>
  `).join('') : empty('🏠', 'Sin propiedades');
}

function renderPropietarios() {
  $('#propietarios-grid').innerHTML = S.propietarios.length ? S.propietarios.map(p => `
    <div class="item-card">
      <div class="item-card-title">${p.nombre}</div>
      <div class="item-card-meta">${p.email || ''}<br>${p.telefono || ''}</div>
    </div>
  `).join('') : empty('👤', 'Sin propietarios');
}

function renderEmpleados() {
  $('#empleados-grid').innerHTML = S.empleados.length ? S.empleados.map(e => {
    const diasLibresStr = (e.dias_libres || []).map(d => ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][parseInt(d)]).join(', ');
    return `
    <div class="item-card" style="cursor:pointer;" onclick="editEmpleado('${e.id}')">
      <div class="item-card-header">
        <div class="item-card-title">${e.nombre}</div>
        <div style="display:flex; gap:6px; align-items:center;">
          ${e.tipo === 'Fijo' ? '<span class="badge" style="background:#dbeafe;color:#1e40af;">Fijo</span>' : '<span class="badge badge-neutral">Externo</span>'}
          <span class="badge ${e.activo ? 'badge-success' : 'badge-neutral'}">${e.activo ? 'Activo' : 'Inactivo'}</span>
        </div>
      </div>
      <div class="item-card-meta" style="display:flex; flex-direction:column; gap:4px;">
        ${e.email ? `<span>📧 ${e.email}</span>` : ''}
        ${e.telefono ? `<span>📱 ${e.telefono}</span>` : ''}
        <span>⭐ ${e.rating || 3} · ⏱ ${e.horas_maximas || 40}h/sem · 💶 ${e.precio_hora || 15}€/h</span>
        ${diasLibresStr ? `<span style="color:var(--text-muted);">🗓️ Libres: ${diasLibresStr}</span>` : ''}
      </div>
      <div style="display:flex; gap:8px; margin-top:10px;">
        <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); editEmpleado('${e.id}')">✏️ Editar</button>
        <button class="btn btn-sm" style="background:#fee2e2; color:#b91c1c;" onclick="event.stopPropagation(); deleteEmpleado('${e.id}')">🗑️</button>
        <button class="btn btn-sm" onclick="event.stopPropagation(); toggleEmpleadoActivo('${e.id}', ${!e.activo})">${e.activo ? '⏸️ Desactivar' : '▶️ Activar'}</button>
      </div>
    </div>
  `}).join('') : empty('👥', 'Sin empleados');
}

function newEmpleado() {
  $('#emp-edit-id').value = '';
  $('#emp-nombre').value = '';
  $('#emp-email').value = '';
  $('#emp-telefono').value = '';
  $('#emp-rol').value = 'limpiador';
  $('#emp-tipo').value = 'Externo';
  $('#emp-rating').value = '3';
  $('#emp-horas').value = '40';
  $('#emp-precio').value = '15';
  for (let i = 0; i <= 6; i++) {
    const cb = $(`#emp-dia-${i}`);
    if (cb) cb.checked = false;
  }
  openModal('modal-empleado');
}

function editEmpleado(id) {
  const e = S.empleados.find(x => x.id === id);
  if (!e) return;
  
  $('#emp-edit-id').value = id;
  $('#emp-nombre').value = e.nombre || '';
  $('#emp-email').value = e.email || '';
  $('#emp-telefono').value = e.telefono || '';
  $('#emp-rol').value = e.rol || 'limpiador';
  $('#emp-tipo').value = e.tipo || 'Externo';
  $('#emp-rating').value = e.rating || 3;
  $('#emp-horas').value = e.horas_maximas || 40;
  $('#emp-precio').value = e.precio_hora || 15;
  
  // Limpiar checkboxes
  for (let i = 0; i <= 6; i++) {
    const cb = $(`#emp-dia-${i}`);
    if (cb) cb.checked = false;
  }
  // Marcar días libres
  (e.dias_libres || []).forEach(d => {
    const cb = $(`#emp-dia-${d}`);
    if (cb) cb.checked = true;
  });
  
  openModal('modal-empleado');
}

async function deleteEmpleado(id) {
  if (!confirm('¿Eliminar este empleado?')) return;
  await remove(TBL.empleados, id);
  await loadAll();
  renderEmpleados();
  initFilters();
  toast('Empleado eliminado');
}

async function toggleEmpleadoActivo(id, activo) {
  await update(TBL.empleados, id, { activo });
  await loadAll();
  renderEmpleados();
  initFilters();
  toast(activo ? 'Empleado activado' : 'Empleado desactivado');
}

function renderExtras() {
  const mes = $('#extras-mes').value;
  let list = S.extras;
  if (mes) list = list.filter(e => e.fecha?.startsWith(mes));
  
  $('#extras-tbody').innerHTML = list.length ? list.map(e => `
    <tr>
      <td>${formatDate(e.fecha)}</td>
      <td>${e.propiedad_nombre || ''}</td>
      <td>${e.concepto || ''}</td>
      <td><strong>${(e.importe || 0).toFixed(2)}€</strong></td>
      <td><button class="btn btn-sm btn-danger" onclick="delExtra(${e.id})">🗑</button></td>
    </tr>
  `).join('') : '<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--text-muted);">Sin extras</td></tr>';
}

function renderMantenimiento() {
  const estado = $('#mant-estado').value;
  let list = S.mantenimiento;
  if (estado) list = list.filter(m => m.estado === estado);
  
  $('#mantenimiento-grid').innerHTML = list.length ? list.map(m => `
    <div class="item-card">
      <div class="item-card-header">
        <div class="item-card-title">${m.titulo}</div>
        <span class="badge ${m.estado === 'resuelto' ? 'badge-success' : 'badge-warning'}">${m.estado}</span>
      </div>
      <div class="item-card-meta">${m.propiedad_nombre || ''} · ${formatDate(m.fecha)}</div>
      ${m.importe ? `<div style="margin-top:8px; font-weight:700;">${m.importe.toFixed(2)}€</div>` : ''}
    </div>
  `).join('') : empty('🔧', 'Sin incidencias');
}

function renderGastos() {
  const mes = $('#gastos-mes').value;
  const tipo = $('#gastos-tipo').value;
  let list = S.gastos;
  if (mes) list = list.filter(g => g.fecha?.startsWith(mes));
  if (tipo) list = list.filter(g => g.tipo === tipo);
  
  const icons = { luz:'💡', agua:'💧', gas:'🔥', comunidad:'🏢', internet:'📶', otro:'📎' };
  
  $('#gastos-tbody').innerHTML = list.length ? list.map(g => `
    <tr>
      <td>${formatDate(g.fecha)}</td>
      <td>${g.propiedad_nombre || ''}</td>
      <td>${icons[g.tipo] || ''} ${g.tipo || ''}</td>
      <td>${g.concepto || ''}</td>
      <td><strong>${(g.importe || 0).toFixed(2)}€</strong></td>
      <td>${g.pagado_por || 'gestor'}</td>
      <td><button class="btn btn-sm btn-danger" onclick="delGasto(${g.id})">🗑</button></td>
    </tr>
  `).join('') : '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">Sin gastos</td></tr>';
}

function renderAlertas() {
  const a = S.alertas || {};
  $('#alert-whatsapp').value = a.whatsapp_notificaciones || '';
  $('#alert-email').value = a.email_notificaciones || '';
  $('#alert-stock').checked = a.alerta_stock_bajo || false;
  $('#alert-semanal').checked = a.recordatorio_semanal || false;
  
  // Cargar config de localStorage
  loadAlertConfig();
  
  // Calcular forecasts y actualizar alertas
  calculateForecasts();
  updateAlertPreview();
  renderAlertasEstado();
}
