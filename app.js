let rawData = [];
let filteredData = [];
let displayCount = 15;
let cart = JSON.parse(localStorage.getItem('rama_cart')) || [];

const DOM = {
    grid: document.getElementById('catalogGrid'),
    loadBtn: document.getElementById('paginationContainer'),
    search: document.getElementById('mainSearch'),
    sortPrice: document.getElementById('priceSort'),
    catSel: document.getElementById('categoryFilter'),
    catMob: document.getElementById('categoryListMobile'),
    cartBadge: document.getElementById('cartBadge'),
    cartList: document.getElementById('cartItemsList'),
    cartTotal: document.getElementById('cartTotalText')
};

async function init() {
    try {
        const { data, error } = await window.supabaseClient.from('katalog_furnitur').select('*');
        if (error) throw error;
        rawData = data || [];
        filteredData = [...rawData];
        setupMenu();
        handleFilter();
        updateCartUI();
    } catch (e) {
        document.getElementById('loadingState').innerHTML = `<p class="text-red-400">Database Connection Failed.</p>`;
    }
}

// LOGIKA KERANJANG
window.addToCart = (upc) => {
    const product = rawData.find(p => p.upc === upc);
    if (!product) return;
    
    const existing = cart.find(item => item.upc === upc);
    // Pastikan harga diambil dari harga_coret_april dan dikonversi ke angka
    const hargaFix = parseInt(product.harga_coret_april) || 0;

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            upc: product.upc,
            nama: product.product_title,
            harga: hargaFix,
            qty: 1
        });
    }
    saveCart();
};

window.removeFromCart = (upc) => {
    cart = cart.filter(item => item.upc !== upc);
    saveCart();
};

window.updateQty = (upc, delta) => {
    const item = cart.find(i => i.upc === upc);
    if (item) {
        item.qty += delta;
        if (item.qty < 1) return window.removeFromCart(upc);
        saveCart();
    }
};

function saveCart() {
    localStorage.setItem('rama_cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    if (totalItems > 0) {
        DOM.cartBadge.textContent = totalItems;
        DOM.cartBadge.classList.remove('hidden');
    } else {
        DOM.cartBadge.classList.add('hidden');
    }

    if (cart.length === 0) {
        DOM.cartList.innerHTML = `<p class="text-slate-500 text-center py-10">Keranjang masih kosong...</p>`;
        DOM.cartTotal.textContent = "Rp 0";
        return;
    }

    let totalHarga = 0;
    DOM.cartList.innerHTML = cart.map(item => {
        totalHarga += (item.harga * item.qty);
        return `
            <div class="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <div class="flex-grow">
                    <h4 class="text-xs font-bold text-white line-clamp-1">${item.nama}</h4>
                    <p class="text-cyan-400 font-black text-xs mt-1">${window.UI.formatRupiah(item.harga)}</p>
                </div>
                <div class="flex items-center gap-3 ml-4">
                    <button onclick="updateQty('${item.upc}', -1)" class="w-6 h-6 flex items-center justify-center bg-slate-800 rounded-lg text-white">-</button>
                    <span class="text-xs font-bold text-white">${item.qty}</span>
                    <button onclick="updateQty('${item.upc}', 1)" class="w-6 h-6 flex items-center justify-center bg-slate-800 rounded-lg text-white">+</button>
                </div>
            </div>
        `;
    }).join('');
    DOM.cartTotal.textContent = window.UI.formatRupiah(totalHarga);
}

window.checkoutWA = () => {
    if (cart.length === 0) return alert("Keranjang masih kosong!");
    let totalHarga = 0;
    let listPesan = cart.map(item => {
        totalHarga += (item.harga * item.qty);
        return `- ${item.nama} (${item.qty}x)`;
    }).join('\n');
    
    const msg = `Halo Rama, saya ingin pesan produk berikut:\n\n${listPesan}\n\n*Total Estimasi: ${window.UI.formatRupiah(totalHarga)}*\n\nMohon dicek stoknya ya!`;
    window.open(`https://wa.me/6285393620791?text=${encodeURIComponent(msg)}`, '_blank');
};

function setupMenu() {
    let cats = [...new Set(rawData.map(p => {
        let c = p.category ? p.category.trim() : 'Lainnya';
        return c.split('&')[0].trim(); // Menyederhanakan kategori
    }))];
    cats.sort();
    const finalCats = ['Semua Kategori', ...cats];
    DOM.catSel.innerHTML = finalCats.map(c => `<option value="${c === 'Semua Kategori' ? 'ALL' : c}">${c}</option>`).join('');
    DOM.catMob.innerHTML = finalCats.map(c => `<button onclick="selectCat('${c === 'Semua Kategori' ? 'ALL' : c}')" class="text-left py-4 px-6 rounded-2xl bg-slate-900 border border-slate-800 text-sm font-semibold hover:border-cyan-400 transition-all">${c}</button>`).join('');
}

window.selectCat = (c) => { DOM.catSel.value = c; if(window.toggleMenu) toggleMenu(); handleFilter(); };

function handleFilter() {
    const keyword = DOM.search.value.toLowerCase().trim();
    const cat = DOM.catSel.value;
    const sortType = DOM.sortPrice.value;
    displayCount = 15;
    
    let results = rawData.filter(p => {
        const str = `${p.product_title} ${p.brand} ${p.category} ${p.upc}`.toLowerCase();
        const matchKeyword = str.includes(keyword);
        const matchCat = (cat === 'ALL' || (p.category && p.category.toLowerCase().includes(cat.toLowerCase())));
        return matchKeyword && matchCat;
    });

    results.sort((a, b) => {
        const sA = (a.status || '').toUpperCase() === 'ACTIVE' ? 1 : 0;
        const sB = (b.status || '').toUpperCase() === 'ACTIVE' ? 1 : 0;
        if (sA !== sB) return sB - sA;

        const hA = parseInt(a.harga_coret_april) || 0;
        const hB = parseInt(b.harga_coret_april) || 0;
        if (sortType === 'LOW') return hA - hB;
        if (sortType === 'HIGH') return hB - hA;
        return 0;
    });

    filteredData = results;
    render();
}

window.loadMore = () => { displayCount += 15; render(); };

function render() {
    document.getElementById('loadingState').classList.add('hidden');
    const toShow = filteredData.slice(0, displayCount);
    DOM.grid.innerHTML = toShow.map((p, i) => window.UI.createProductCard(p, i)).join('');
    
    if (toShow.length === 0) {
        DOM.grid.classList.add('hidden');
        document.getElementById('emptyState').classList.remove('hidden');
        DOM.loadBtn.classList.add('hidden');
    } else {
        DOM.grid.classList.remove('hidden');
        document.getElementById('emptyState').classList.add('hidden');
        filteredData.length > displayCount ? DOM.loadBtn.classList.remove('hidden') : DOM.loadBtn.classList.add('hidden');
    }
}

DOM.search.addEventListener('input', handleFilter);
DOM.sortPrice.addEventListener('change', handleFilter);
document.addEventListener('DOMContentLoaded', init);
