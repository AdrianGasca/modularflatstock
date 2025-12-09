// ===============================================
// CONSUMOS MENSUALES
// ===============================================

function changeConsumosMes(delta) {
  try {
    const [year, month] = currentConsumosMes.split('-').map(Number);
    const newDate = new Date(year, month - 1 + delta, 1);
    currentConsumosMes = newDate.toISOString().slice(0, 7);
    console.log('Cambiando a mes:', currentConsumosMes);
    renderConsumos();
  } catch (err) {
    console.error('Error en changeConsumosMes:', err);
  }
}

function renderConsumos() {
  try {
    const [year, month] = currentConsumosMes.split('-');
    const mesLabel = new Date(year, month - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    
    const labelEl = $('#consumos-mes-label');
    if (labelEl) labelEl.textContent = mesLabel.charAt(0).toUpperCase() + mesLabel.slice(1);
    
    const gastos = calcGastosMes(currentConsumosMes);
    
    const totalEl = $('#consumo-total');
    const reservasEl = $('#consumo-reservas');
    const gestorEl = $('#consumo-gestor');
    const propietarioEl = $('#consumo-propietario');
    
    if (totalEl) totalEl.textContent = formatMoney(gastos.total);
    if (reservasEl) reservasEl.textContent = gastos.numReservas;
    if (gestorEl) gestorEl.textContent = formatMoney(gastos.gestor);
    if (propietarioEl) propietarioEl.textContent = formatMoney(gastos.propietario);
    
    // Desglose
    const desglose = $('#consumos-desglose');
    if (desglose) {
      desglose.innerHTML = gastos.desglose.map(g => `
        <div class="consumo-item">
          <div>
            <span class="consumo-nombre">${g.nombre}</span>
            <span class="consumo-pagador ${g.pagador}">${g.pagador === 'gestor' ? '🏢' : '👤'}</span>
          </div>
          <div>
            <span style="color:var(--text-muted);">${g.unidades} uds × ${formatMoney(g.precioUnitario)}</span>
            <span class="consumo-valor">${formatMoney(g.total)}</span>
          </div>
        </div>
      `).join('') || '<p style="color:var(--text-muted);">Sin consumos este mes</p>';
    }
    
    // Proyección
    renderProyeccion();
    
    // Gráfico
    renderConsumosChart();
  } catch (err) {
    console.error('Error en renderConsumos:', err);
  }
}

function calcGastosMes(mes) {
  // Buscar reservas cuyo check_out esté en el mes seleccionado
  const [year, month] = mes.split('-').map(Number);
  const inicioMes = new Date(year, month - 1, 1);
  const finMes = new Date(year, month, 0, 23, 59, 59);
  
  // Filtrar reservas del mes (por check_out)
  let reservasMes = [];
  
  if (S.reservas && S.reservas.length > 0) {
    reservasMes = S.reservas.filter(r => {
      if (r.status === 'cancelled') return false;
      const checkoutDate = new Date(r.check_out);
      return checkoutDate >= inicioMes && checkoutDate <= finMes;
    });
  }
  
  console.log('Reservas en el mes:', mes, reservasMes.length, reservasMes);
  
  let total = 0, gestor = 0, propietario = 0;
  const desglose = [];
  
  const inventario = S.stock || S.inventario || [];
  
  for (const item of inventario) {
    let unidadesConsumidas = 0;
    
    for (const reserva of reservasMes) {
      unidadesConsumidas += calcConsumoReserva(item, reserva);
    }
    
    if (unidadesConsumidas > 0) {
      const precio = item.precio_unidad || 0;
      const subtotal = unidadesConsumidas * precio;
      const pagador = item.pagado_por || 'gestor';
      
      total += subtotal;
      if (pagador === 'gestor') gestor += subtotal;
      else propietario += subtotal;
      
      desglose.push({
        nombre: item.item,
        unidades: unidadesConsumidas,
        precioUnitario: precio,
        total: subtotal,
        pagador: pagador
      });
    }
  }
  
  return { total, gestor, propietario, numReservas: reservasMes.length, desglose };
}

function calcConsumoReserva(item, reserva) {
  // Verificar si el artículo aplica a la propiedad de la reserva
  const propIds = item.propiedades_ids || [];
  if (propIds.length > 0) {
    const reservaPropId = reserva.propiedad_id;
    const reservaPropNombre = reserva.propiedad_nombre || '';
    
    let propMatch = false;
    if (reservaPropId && propIds.includes(reservaPropId)) {
      propMatch = true;
    } else if (reservaPropNombre) {
      const propPorNombre = S.propiedades.find(p => 
        (p.nombre === reservaPropNombre || p.propiedad_nombre === reservaPropNombre)
      );
      if (propPorNombre && propIds.includes(propPorNombre.id)) {
        propMatch = true;
      }
    }
    
    if (!propMatch) return 0;
  }
  
  // Obtener datos de la propiedad
  let habitaciones = reserva.habitaciones || reserva.total_rooms || 1;
  let banos = reserva.banos || reserva.total_bathrooms || 1;
  let camasDobles = reserva.camas_dobles || reserva.total_camas_dobles || 0;
  let camasIndiv = reserva.camas_individuales || reserva.total_camas_individuales || 0;
  
  if (reserva.propiedad_nombre) {
    const prop = S.propiedades.find(p => p.propiedad_nombre === reserva.propiedad_nombre);
    if (prop) {
      habitaciones = habitaciones || prop.total_rooms || 1;
      banos = banos || prop.total_bathrooms || 1;
      camasDobles = camasDobles || prop.total_camas_dobles || 0;
      camasIndiv = camasIndiv || prop.total_camas_individuales || 0;
    }
  }
  
  const numHuespedes = reserva.num_huespedes || reserva.guests || 2;
  const numAdultos = reserva.num_adultos || reserva.adults || numHuespedes;
  const numNinos = reserva.num_ninos || reserva.children || 0;
  const numBebes = reserva.num_bebes || reserva.infants || 0;
  
  let consumo = 0;
  consumo += item.consumo_por_limpieza || 0;
  consumo += (item.consumo_habitacion || 0) * habitaciones;
  consumo += (item.consumo_bano || 0) * banos;
  consumo += (item.consumo_cama_doble || 0) * camasDobles;
  consumo += (item.consumo_cama_indiv || 0) * camasIndiv;
  consumo += (item.consumo_huesped || 0) * numHuespedes;
  consumo += (item.consumo_adulto || 0) * numAdultos;
  consumo += (item.consumo_nino || 0) * numNinos;
  consumo += (item.consumo_bebe || 0) * numBebes;
  
  return consumo;
}

function renderProyeccion() {
  const proyeccionEl = $('#consumos-proyeccion');
  if (!proyeccionEl) return;
  
  try {
    const today = new Date();
    const [year, month] = currentConsumosMes.split('-').map(Number);
    
    if (year !== today.getFullYear() || month !== today.getMonth() + 1) {
      proyeccionEl.innerHTML = '<p style="color:var(--text-muted);">Proyección solo disponible para el mes actual</p>';
      return;
    }
    
    const finMes = new Date(year, month, 0, 23, 59, 59);
    const reservasFuturas = (S.reservas || []).filter(r => {
      if (r.status === 'cancelled') return false;
      const checkoutDate = new Date(r.check_out);
      return checkoutDate > today && checkoutDate <= finMes;
    });
    
    const inventario = S.stock || S.inventario || [];
    let proyeccion = 0;
    const desgloseProyeccion = [];
    
    for (const item of inventario) {
      let unidadesProyectadas = 0;
      for (const reserva of reservasFuturas) {
        unidadesProyectadas += calcConsumoReserva(item, reserva);
      }
      if (unidadesProyectadas > 0) {
        const subtotal = unidadesProyectadas * (item.precio_unidad || 0);
        proyeccion += subtotal;
        desgloseProyeccion.push({ nombre: item.item, unidades: unidadesProyectadas, total: subtotal });
      }
    }
    
    proyeccionEl.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Reservas pendientes mes</div>
          <div class="stat-value">${reservasFuturas.length}</div>
        </div>
        <div class="stat-card accent">
          <div class="stat-label">Gasto proyectado restante</div>
          <div class="stat-value">${formatMoney(proyeccion)}</div>
        </div>
      </div>
      ${desgloseProyeccion.length > 0 ? `
        <div style="margin-top:12px;">
          <strong>Desglose proyectado:</strong>
          ${desgloseProyeccion.slice(0, 5).map(d => `<div style="display:flex; justify-content:space-between; padding:4px 0;"><span>${d.nombre} (${d.unidades} uds)</span><span>${formatMoney(d.total)}</span></div>`).join('')}
          ${desgloseProyeccion.length > 5 ? `<div style="color:var(--text-muted);">...y ${desgloseProyeccion.length - 5} más</div>` : ''}
        </div>
      ` : ''}
    `;
  } catch (err) {
    console.error('Error en renderProyeccion:', err);
  }
}

function renderConsumosChart() {
  try {
    const ctx = document.getElementById('consumos-chart');
    if (!ctx) return;
    
    const meses = [];
    const valores = [];
    const [year, month] = currentConsumosMes.split('-').map(Number);
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      const mesKey = d.toISOString().slice(0, 7);
      const mesLabel = d.toLocaleDateString('es-ES', { month: 'short' });
      meses.push(mesLabel);
      valores.push(calcGastosMes(mesKey).total);
    }
    
    const context = ctx.getContext('2d');
    if (!context) return;
    
    const width = ctx.width = (ctx.parentElement?.offsetWidth - 40) || 400;
    const height = ctx.height = 200;
    const padding = 40;
    const maxVal = Math.max(...valores, 1);
    
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#1c1c26';
    context.fillRect(0, 0, width, height);
    
    const barWidth = (width - padding * 2) / meses.length - 10;
    
    meses.forEach((mes, i) => {
      const x = padding + i * ((width - padding * 2) / meses.length) + 5;
      const barHeight = (valores[i] / maxVal) * (height - padding * 2);
      const y = height - padding - barHeight;
      
      context.fillStyle = '#6366f1';
      context.fillRect(x, y, barWidth, barHeight);
      
      context.fillStyle = '#a1a1aa';
      context.font = '11px DM Sans';
      context.textAlign = 'center';
      context.fillText(mes, x + barWidth / 2, height - 10);
      
      context.fillStyle = '#f4f4f5';
      context.fillText(valores[i].toFixed(0) + '€', x + barWidth / 2, y - 5);
    });
  } catch (err) {
    console.error('Error en renderConsumosChart:', err);
  }
}
