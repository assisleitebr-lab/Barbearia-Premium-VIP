const ADMIN_PASSWORD_DEFAULT = "1234";

let currentClientName = "";
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('installBanner').classList.remove('hidden');
});

async function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        document.getElementById('installBanner').classList.add('hidden');
    }
}

function dismissInstallBanner() {
    document.getElementById('installBanner').classList.add('hidden');
}

const defaultBarbers = [
    { id: '1', name: 'Lucas "Tesoura de Ouro"', specialty: 'Degradê & Barba', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { id: '2', name: 'Gabriel Santos', specialty: 'Cortes Clássicos & Navalha', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' }
];

const defaultServices = [
    { id: 's1', name: 'Corte Tradicional / Fade', price: 45.00, time: '45 min' },
    { id: 's2', name: 'Barba Completa com Toalha Quente', price: 35.00, time: '30 min' },
    { id: 's3', name: 'Combo VIP (Corte + Barba + Sobrancelha)', price: 70.00, time: '1h 15m' }
];

let barbers = JSON.parse(localStorage.getItem('bv_barbers')) || defaultBarbers;
let services = defaultServices;
let bookings = JSON.parse(localStorage.getItem('bv_bookings')) || [];

let selectedBarberId = null;
let selectedServiceId = null;
let selectedDate = null;
let selectedTime = null;

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) dateInput.min = today;
    renderAllViews();
});

function saveData() {
    localStorage.setItem('bv_barbers', JSON.stringify(barbers));
    localStorage.setItem('bv_bookings', JSON.stringify(bookings));
    renderAllViews();
}

function renderAllViews() {
    renderClientBarbers();
    renderClientServices();
    renderMyBookings();
    renderAdminView();
}

function enterAsClient() {
    const nameInput = document.getElementById('clientLoginName').value.trim();
    if (!nameInput) {
        alert('Por favor, digite o seu nome para entrar como cliente!');
        document.getElementById('clientLoginName').focus();
        return;
    }

    currentClientName = nameInput;
    document.getElementById('displayClientName').innerText = currentClientName;

    document.getElementById('screenAuth').classList.add('hidden');
    document.getElementById('screenClient').classList.remove('hidden');
    
    const userHeader = document.getElementById('userHeaderArea');
    const badge = document.getElementById('roleBadge');
    userHeader.classList.remove('hidden');
    badge.innerText = `Cliente: ${currentClientName}`;
    badge.className = 'text-xs px-2.5 py-1 rounded-full font-semibold border bg-blue-500/10 text-blue-400 border-blue-500/30';

    renderClientView();
}

function openAdminModal() {
    document.getElementById('modalAdminAuth').classList.remove('hidden');
    document.getElementById('adminPasswordInput').focus();
}

function closeAdminModal() {
    document.getElementById('modalAdminAuth').classList.add('hidden');
    document.getElementById('adminAuthError').classList.add('hidden');
    document.getElementById('adminPasswordInput').value = '';
}

function handleAdminLogin(e) {
    e.preventDefault();
    const pass = document.getElementById('adminPasswordInput').value;
    
    if (pass === ADMIN_PASSWORD_DEFAULT) {
        closeAdminModal();
        document.getElementById('screenAuth').classList.add('hidden');
        document.getElementById('screenClient').classList.add('hidden');
        document.getElementById('screenAdmin').classList.remove('hidden');

        const userHeader = document.getElementById('userHeaderArea');
        const badge = document.getElementById('roleBadge');
        userHeader.classList.remove('hidden');
        badge.innerText = 'Painel Admin';
        badge.className = 'text-xs px-2.5 py-1 rounded-full font-semibold border bg-amber-500/10 text-amber-400 border-amber-500/30';

        renderAdminView();
    } else {
        document.getElementById('adminAuthError').classList.remove('hidden');
    }
}

function logout() {
    currentClientName = "";
    const loginInput = document.getElementById('clientLoginName');
    if (loginInput) loginInput.value = "";
    document.getElementById('screenAuth').classList.remove('hidden');
    document.getElementById('screenClient').classList.add('hidden');
    document.getElementById('screenAdmin').classList.add('hidden');
    document.getElementById('userHeaderArea').classList.add('hidden');
    closeAdminModal();
}

function renderClientView() {
    renderClientBarbers();
    renderClientServices();
}

function renderClientBarbers() {
    const container = document.getElementById('clientBarbersList');
    if(!container) return;
    container.innerHTML = barbers.map(b => `
        <div onclick="selectBarber('${b.id}')" id="barber-card-${b.id}"
            class="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-amber-500/50 cursor-pointer transition flex items-center gap-4">
            <img src="${b.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" class="w-14 h-14 rounded-full object-cover border border-slate-700">
            <div>
                <h4 class="font-bold text-white text-sm">${b.name}</h4>
                <p class="text-xs text-amber-400 mt-0.5">${b.specialty}</p>
            </div>
        </div>
    `).join('');
}

function renderClientServices() {
    const container = document.getElementById('clientServicesList');
    if(!container) return;
    container.innerHTML = services.map(s => `
        <div onclick="selectService('${s.id}')" id="service-card-${s.id}"
            class="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-amber-500/50 cursor-pointer transition flex justify-between items-center">
            <div>
                <h4 class="font-bold text-white text-sm">${s.name}</h4>
                <p class="text-xs text-slate-400 mt-1">Duração: ${s.time}</p>
            </div>
            <span class="text-amber-400 font-bold text-base">R$ ${s.price.toFixed(2)}</span>
        </div>
    `).join('');
}

function selectBarber(id) {
    selectedBarberId = id;
    barbers.forEach(b => {
        const el = document.getElementById(`barber-card-${b.id}`);
        if (el) {
            el.className = b.id === id 
                ? "p-4 rounded-xl border-2 border-amber-500 bg-amber-500/10 cursor-pointer transition flex items-center gap-4 shadow-lg shadow-amber-500/10"
                : "p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-amber-500/50 cursor-pointer transition flex items-center gap-4";
        }
    });
    checkSummaryVisibility();
}

function selectService(id) {
    selectedServiceId = id;
    services.forEach(s => {
        const el = document.getElementById(`service-card-${s.id}`);
        if (el) {
            el.className = s.id === id 
                ? "p-4 rounded-xl border-2 border-amber-500 bg-amber-500/10 cursor-pointer transition flex justify-between items-center shadow-lg shadow-amber-500/10"
                : "p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-amber-500/50 cursor-pointer transition flex justify-between items-center";
        }
    });
    checkSummaryVisibility();
}

function renderTimeSlots() {
    const dateInput = document.getElementById('bookingDate').value;
    selectedDate = dateInput;
    const container = document.getElementById('timeSlotsList');
    if (!dateInput || !container) return;

    const slots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    container.innerHTML = slots.map(slot => `
        <button onclick="selectTime('${slot}')" id="time-btn-${slot.replace(':', '')}"
            class="py-2 px-3 rounded-lg border border-slate-800 bg-slate-950 text-xs font-semibold text-slate-300 hover:border-amber-500 transition">
            ${slot}
        </button>
    `).join('');
    checkSummaryVisibility();
}

function selectTime(slot) {
    selectedTime = slot;
    const slots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    slots.forEach(s => {
        const btn = document.getElementById(`time-btn-${s.replace(':', '')}`);
        if (btn) {
            btn.className = s === slot 
                ? "py-2 px-3 rounded-lg border-2 border-amber-500 bg-amber-500 text-slate-950 font-bold text-xs transition"
                : "py-2 px-3 rounded-lg border border-slate-800 bg-slate-950 text-xs font-semibold text-slate-300 hover:border-amber-500 transition";
        }
    });
    checkSummaryVisibility();
}

function checkSummaryVisibility() {
    const summary = document.getElementById('bookingSummaryCard');
    if (!summary) return;
    if (selectedBarberId && selectedServiceId && selectedDate && selectedTime) {
        const barber = barbers.find(b => b.id === selectedBarberId);
        const service = services.find(s => s.id === selectedServiceId);

        document.getElementById('sumBarber').innerText = barber ? barber.name : '';
        document.getElementById('sumService').innerText = service ? service.name : '';
        document.getElementById('sumDateTime').innerText = `${selectedDate.split('-').reverse().join('/')} às ${selectedTime}`;
        document.getElementById('sumPrice').innerText = service ? `R$ ${service.price.toFixed(2)}` : '';

        summary.classList.remove('hidden');
        summary.scrollIntoView({ behavior: 'smooth' });
    }
}

function copyPixKey() {
    navigator.clipboard.writeText("00020126580014BR.GOV.BCB.PIX0136barbearia-vip-key-exemplo-pix");
    const btnText = document.getElementById('btnCopyText');
    if(btnText) {
        btnText.innerText = "Copiado!";
        setTimeout(() => { btnText.innerText = "Copiar"; }, 2000);
    }
}

function confirmBooking() {
    if (!currentClientName) {
        alert('Nome do cliente não identificado.');
        return;
    }

    const barber = barbers.find(b => b.id === selectedBarberId);
    const service = services.find(s => s.id === selectedServiceId);
    
    const newBooking = {
        id: Date.now().toString(),
        clientName: currentClientName,
        barberName: barber.name,
        serviceName: service.name,
        price: service.price,
        date: selectedDate,
        time: selectedTime,
        pixStatus: 'Pendente'
    };

    bookings.push(newBooking);
    saveData();

    alert('🎉 Agendamento realizado com sucesso!');
    selectedBarberId = null;
    selectedServiceId = null;
    selectedDate = null;
    selectedTime = null;
    const summary = document.getElementById('bookingSummaryCard');
    if(summary) summary.classList.add('hidden');
    renderClientView();
}

function switchClientTab(tab) {
    const modal = document.getElementById('modalMyBookings');
    if(!modal) return;
    if (tab === 'myBookings') {
        renderMyBookings();
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

function renderMyBookings() {
    const container = document.getElementById('myBookingsList');
    if (!container) return;

    const myBookings = bookings.filter(b => b.clientName.toLowerCase() === currentClientName.toLowerCase());

    if (myBookings.length === 0) {
        container.innerHTML = `<p class="text-slate-500 text-sm text-center py-6">Você não possui nenhum agendamento registrado.</p>`;
        return;
    }

    container.innerHTML = myBookings.slice().reverse().map(b => {
        const isPaid = b.pixStatus === 'Pago';
        const statusBadge = isPaid 
            ? `<span class="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">PIX: Pago ✅</span>`
            : `<span class="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold">PIX: Pendente ⏳</span>`;

        return `
            <div class="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1.5">
                <div class="flex justify-between items-center">
                    <span class="font-bold text-white text-sm">${b.serviceName}</span>
                    ${statusBadge}
                </div>
                <p class="text-xs text-slate-400">Barbeiro: <strong class="text-slate-200">${b.barberName}</strong></p>
                <p class="text-xs text-slate-400">Data: <strong class="text-slate-200">${b.date.split('-').reverse().join('/')} às ${b.time}</strong></p>
                <div class="text-right text-amber-400 font-bold text-sm">R$ ${b.price.toFixed(2)}</div>
            </div>
        `;
    }).join('');
}

function renderAdminView() {
    renderAdminBookings();
    renderAdminBarbers();
    calculateRevenue();
}

function switchAdminTab(tab) {
    const tabBookings = document.getElementById('adminTabBookings');
    const tabBarbers = document.getElementById('adminTabBarbers');
    const btnBookings = document.getElementById('tabBtnBookings');
    const btnBarbers = document.getElementById('tabBtnBarbers');

    if (!tabBookings || !tabBarbers) return;

    if (tab === 'bookings') {
        tabBookings.classList.remove('hidden');
        tabBarbers.classList.add('hidden');
        btnBookings.className = "pb-3 text-sm font-semibold border-b-2 border-amber-400 text-amber-400 flex items-center gap-2";
        btnBarbers.className = "pb-3 text-sm font-semibold text-slate-400 border-b-2 border-transparent hover:text-white flex items-center gap-2";
    } else {
        tabBookings.classList.add('hidden');
        tabBarbers.classList.remove('hidden');
        btnBarbers.className = "pb-3 text-sm font-semibold border-b-2 border-amber-400 text-amber-400 flex items-center gap-2";
        btnBookings.className = "pb-3 text-sm font-semibold text-slate-400 border-b-2 border-transparent hover:text-white flex items-center gap-2";
    }
}

function renderAdminBookings() {
    const table = document.getElementById('adminBookingsTable');
    const badge = document.getElementById('bookingCountBadge');
    if(!table || !badge) return;
    
    badge.innerText = `${bookings.length} agendamentos`;

    if (bookings.length === 0) {
        table.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-slate-500">Nenhum agendamento registrado.</td></tr>`;
        return;
    }

    table.innerHTML = bookings.slice().reverse().map(b => {
        const isPaid = b.pixStatus === 'Pago';
        return `
            <tr class="hover:bg-slate-800/40 transition">
                <td class="p-4 font-semibold text-white">${b.clientName}</td>
                <td class="p-4">${b.barberName}</td>
                <td class="p-4">${b.serviceName}</td>
                <td class="p-4">${b.date.split('-').reverse().join('/')} às ${b.time}</td>
                <td class="p-4 text-amber-400 font-bold">R$ ${b.price.toFixed(2)}</td>
                <td class="p-4">
                    <select onchange="updatePixStatus('${b.id}', this.value)" class="bg-slate-950 border ${isPaid ? 'border-emerald-500/50 text-emerald-400' : 'border-amber-500/50 text-amber-400'} text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none">
                        <option value="Pendente" ${!isPaid ? 'selected' : ''}>Pendente ⏳</option>
                        <option value="Pago" ${isPaid ? 'selected' : ''}>Pago ✅</option>
                    </select>
                </td>
                <td class="p-4 text-right">
                    <button onclick="deleteBooking('${b.id}')" class="text-red-400 hover:text-red-300 p-1 rounded transition">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    lucide.createIcons();
}

function updatePixStatus(id, newStatus) {
    const b = bookings.find(item => item.id === id);
    if (b) {
        b.pixStatus = newStatus;
        saveData();
    }
}

function calculateRevenue() {
    const total = bookings.filter(b => b.pixStatus === 'Pago').reduce((sum, b) => sum + b.price, 0);
    const revEl = document.getElementById('adminTotalRevenue');
    if(revEl) revEl.innerText = `R$ ${total.toFixed(2)}`;
}

function deleteBooking(id) {
    if (confirm('Deseja realmente remover este agendamento?')) {
        bookings = bookings.filter(b => b.id !== id);
        saveData();
    }
}

function handleAddBarber(e) {
    e.preventDefault();
    const name = document.getElementById('newBarberName').value.trim();
    const specialty = document.getElementById('newBarberSpec').value.trim();
    const photo = document.getElementById('newBarberPhoto').value.trim();

    const newBarber = {
        id: Date.now().toString(),
        name,
        specialty,
        photo: photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    };

    barbers.push(newBarber);
    saveData();

    document.getElementById('newBarberName').value = '';
    document.getElementById('newBarberSpec').value = '';
    document.getElementById('newBarberPhoto').value = '';
    alert('Barbeiro adicionado com sucesso!');
}

function renderAdminBarbers() {
    const container = document.getElementById('adminBarbersGrid');
    if(!container) return;
    container.innerHTML = barbers.map(b => `
        <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <div class="flex items-center gap-3">
                <img src="${b.photo}" class="w-12 h-12 rounded-full object-cover border border-slate-700">
                <div>
                    <h4 class="font-bold text-white text-sm">${b.name}</h4>
                    <p class="text-xs text-amber-400">${b.specialty}</p>
                </div>
            </div>
            <button onclick="deleteBarber('${b.id}')" class="text-slate-500 hover:text-red-400 transition p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        </div>
    `).join('');
    lucide.createIcons();
}

function deleteBarber(id) {
    if (barbers.length <= 1) {
        alert('A equipe deve ter pelo menos um barbeiro!');
        return;
    }
    if (confirm('Remover este barbeiro da equipe?')) {
        barbers = barbers.filter(b => b.id !== id);
        saveData();
    }
}
