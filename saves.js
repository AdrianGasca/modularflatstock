// ===============================================
// SAVES - Funciones de guardado (excepto stock)
// ===============================================
async function saveServicio() {
  const editId = $('#serv-edit-id').value;
  const propSel = $('#serv-propiedad-sel');
  const empSel = $('#serv-empleado');
  const empOpt = empSel.options[empSel.selectedIndex];
  
  const data = {
    cliente_email: S.clienteEmail,
    propiedad_nombre: propSel.value,
    tipo_servicio: $('#serv-tipo').value,
    fecha_servicio: $('#serv-fecha-input').value,
    hora_inicio: $('#serv-hora').value || null,
    check_in: $('#serv-checkin').value || null,
    check_out: $('#serv-checkout').value || null,
    huesped_nombre: $('#serv-huesped').value.trim() || null,
    num_huespedes: parseInt($('#serv-num-huespedes').value) || 2,
    empleado_id: empSel.value || null,
    empleado_nombre: empOpt?.text !== 'Sin asignar' ? empOpt?.text : null,
    precio: parseFloat($('#serv-precio').value) || null,
    estado: $('#serv-estado-sel').value,
    prioridad: $('#serv-prioridad').value,
    notas: $('#serv-notas').value.trim() || null
  };
  
  if (!data.propiedad_nombre || !data.fecha_servicio) return toast('Propiedad y fecha son obligatorios', 'error');
  
  closeModal('modal-servicio');
  
  try {
    if (editId) {
      await fetch(`${API}/supa/patch/${TBL.servicios}?id=eq.${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      await fetch(`${API}/supa/create/${TBL.servicios}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    await loadAll();
    renderServicios();
    renderDashboard();
    toast(editId ? 'Servicio actualizado' : 'Servicio creado');
  } catch (e) { toast('Error', 'error'); }
}

async function savePropiedad() {
  const data = {
    cliente_email: S.clienteEmail,
    propiedad_nombre: $('#prop-nombre').value.trim(),
    precio_limpieza: parseFloat($('#prop-precio').value) || 0
  };
  if (!data.propiedad_nombre) return toast('Nombre obligatorio', 'error');
  
  closeModal('modal-propiedad');
  await create(TBL.propiedades, data);
  await loadAll();
  renderPropiedades();
  renderDashboard();
  initFilters();
  toast('Propiedad creada');
}

async function savePropietario() {
  const data = {
    cliente_email: S.clienteEmail,
    nombre: $('#propiet-nombre').value.trim(),
    email: $('#propiet-email').value.trim(),
    telefono: $('#propiet-telefono').value.trim()
  };
  if (!data.nombre) return toast('Nombre obligatorio', 'error');
  
  closeModal('modal-propietario');
  await create(TBL.propietarios, data);
  await loadAll();
  renderPropietarios();
  toast('Propietario creado');
}

async function saveEmpleado() {
  // Obtener días libres seleccionados
  const diasLibres = [];
  for (let i = 0; i <= 6; i++) {
    if ($(`#emp-dia-${i}`)?.checked) diasLibres.push(i.toString());
  }
  
  const data = {
    email_host: S.clienteEmail,
    nombre: $('#emp-nombre').value.trim(),
    email: $('#emp-email').value.trim() || null,
    telefono: $('#emp-telefono').value.trim() || null,
    rol: $('#emp-rol').value,
    tipo: $('#emp-tipo').value,
    rating: parseFloat($('#emp-rating').value) || 3,
    horas_maximas: parseInt($('#emp-horas').value) || 40,
    precio_hora: parseFloat($('#emp-precio').value) || 15,
    dias_libres: diasLibres.length > 0 ? diasLibres : null,
    activo: true
  };
  if (!data.nombre) return toast('Nombre obligatorio', 'error');
  
  const editId = $('#emp-edit-id')?.value;
  closeModal('modal-empleado');
  
  if (editId) {
    await update(TBL.empleados, editId, data);
    toast('Empleado actualizado');
  } else {
    await create(TBL.empleados, data);
    toast('Empleado creado');
  }
  
  await loadAll();
  renderEmpleados();
  initFilters();
}

async function saveKit() {
  const data = {
    cliente_email: S.clienteEmail,
    nombre: $('#kit-nombre').value.trim(),
    descripcion: $('#kit-desc').value.trim()
  };
  if (!data.nombre) return toast('Nombre obligatorio', 'error');
  
  closeModal('modal-kit');
  await create(TBL.kits, data);
  await loadAll();
  renderKits();
  toast('Kit creado');
}

async function saveExtra() {
  const data = {
    cliente_email: S.clienteEmail,
    fecha: $('#extra-fecha').value,
    propiedad_nombre: $('#extra-prop').value,
    concepto: $('#extra-concepto').value.trim(),
    importe: parseFloat($('#extra-importe').value) || 0
  };
  if (!data.fecha || !data.propiedad_nombre || !data.concepto) return toast('Campos obligatorios', 'error');
  
  closeModal('modal-extra');
  await create(TBL.extras, data);
  await loadAll();
  renderExtras();
  toast('Extra añadido');
}

async function saveMantenimiento() {
  const data = {
    cliente_email: S.clienteEmail,
    fecha: $('#mant-fecha').value || new Date().toISOString().split('T')[0],
    propiedad_nombre: $('#mant-prop').value,
    titulo: $('#mant-titulo').value.trim(),
    descripcion: $('#mant-desc').value.trim(),
    importe: parseFloat($('#mant-importe').value) || 0,
    estado: $('#mant-estado-sel').value
  };
  if (!data.titulo || !data.propiedad_nombre) return toast('Título y propiedad obligatorios', 'error');
  
  closeModal('modal-mantenimiento');
  await create(TBL.mantenimiento, data);
  await loadAll();
  renderMantenimiento();
  renderDashboard();
  toast('Incidencia creada');
}

async function saveGasto() {
  const data = {
    cliente_email: S.clienteEmail,
    fecha: $('#gasto-fecha').value,
    propiedad_nombre: $('#gasto-prop').value,
    tipo: $('#gasto-tipo').value,
    concepto: $('#gasto-concepto').value.trim(),
    importe: parseFloat($('#gasto-importe').value) || 0
  };
  if (!data.fecha || !data.propiedad_nombre) return toast('Campos obligatorios', 'error');
  
  closeModal('modal-gasto');
  await create(TBL.gastos, data);
  await loadAll();
  renderGastos();
  toast('Gasto añadido');
}

async function saveAlertConfig() {
  const data = {
    cliente_email: S.clienteEmail,
    whatsapp_notificaciones: $('#alert-whatsapp').value.trim(),
    email_notificaciones: $('#alert-email').value.trim(),
    alerta_stock_bajo: $('#alert-stock').checked,
    recordatorio_semanal: $('#alert-semanal').checked
  };
  
  try {
    if (S.alertas?.id) {
      await fetch(`${API}/supa/patch/${TBL.alertas}?id=eq.${S.alertas.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      await create(TBL.alertas, data);
    }
    await loadAll();
    toast('Configuración guardada');
  } catch (e) { toast('Error', 'error'); }
}

// ===== ACTIONS =====
async function adjStock(id, delta) {
  const item = S.inventario.find(i => i.id === id);
  if (!item) return;
  const newStock = Math.max(0, item.stock + delta);
  
  await fetch(`${API}/supa/patch/${TBL.inventario}?id=eq.${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stock: newStock })
  });
  
  item.stock = newStock;
  renderStock();
  renderDashboard();
}

function editServicio(id) {
  const s = S.servicios.find(x => x.id === id);
  if (!s) return;
  
  $('#serv-edit-id').value = id;
  $('#serv-propiedad-sel').value = s.propiedad_nombre;
  $('#serv-tipo').value = s.tipo_servicio || 'checkout';
  $('#serv-fecha-input').value = s.fecha_servicio;
  $('#serv-hora').value = s.hora_inicio || '';
  $('#serv-checkin').value = s.check_in || '';
  $('#serv-checkout').value = s.check_out || '';
  $('#serv-huesped').value = s.huesped_nombre || '';
  $('#serv-num-huespedes').value = s.num_huespedes || 2;
  $('#serv-empleado').value = s.empleado_id || '';
  $('#serv-precio').value = s.precio || '';
  $('#serv-estado-sel').value = s.estado || 'pendiente';
  $('#serv-prioridad').value = s.prioridad || 'normal';
  $('#serv-notas').value = s.notas || '';
  
  openModal('modal-servicio');
}

async function completarServicio(id) {
  if (!confirm('¿Marcar como completado?')) return;
  
  await fetch(`${API}/supa/patch/${TBL.servicios}?id=eq.${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado: 'completado', completado_at: new Date().toISOString() })
  });
  
  await loadAll();
  renderServicios();
  renderDashboard();
  toast('Servicio completado');
}

async function delExtra(id) {
  if (!confirm('¿Eliminar?')) return;
  await fetch(`${API}/supa/delete/${TBL.extras}?id=eq.${id}`, { method: 'DELETE' });
  await loadAll();
  renderExtras();
}

async function delGasto(id) {
  if (!confirm('¿Eliminar?')) return;
  await fetch(`${API}/supa/delete/${TBL.gastos}?id=eq.${id}`, { method: 'DELETE' });
  await loadAll();
  renderGastos();
}
