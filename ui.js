window.UI = {
    formatRupiah: (n) => !n || isNaN(n) ? "Rp 0" : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n),

    getCDN: (url) => {
        if (!url) return 'https://via.placeholder.com/400';
        let clean = url.replace(/['"]/g, '').trim();
        if (clean.includes('amazonaws.com')) {
            clean = clean.replace('f1-static.s3-ap-southeast-1.amazonaws.com', 'media.dekoruma.com') + "?auto=webp&width=800";
        }
        return clean;
    },

    openGallery: (imageString) => {
        const modal = document.getElementById('galleryModal');
        const container = document.getElementById('swipeContainer');
        const images = imageString.split('|').filter(img => img.trim() !== '');
        container.innerHTML = images.map(img => `<div class="swipe-item"><img src="${window.UI.getCDN(img)}" class="shadow-2xl"></div>`).join('');
        modal.classList.remove('hidden'); modal.classList.add('flex'); document.body.style.overflow = 'hidden';
    },

    createProductCard: (p, i) => {
        if (!p) return '';
        const upc = p.upc || 'N/A';
        const rawImgs = p.image_url || '';
        const cleanImgs = rawImgs.split('|').filter(img => img.trim() !== '');
        const cover = window.UI.getCDN(cleanImgs[0]);
        
        const hNormal = parseFloat(p.harga_normal) || 0;
        const hJual = parseFloat(p.harga_coret_april) || 0;

        // Logika Badge Diskon
        let diskonBadge = '';
        if (hNormal > hJual) {
            const persen = Math.round(((hNormal - hJual) / hNormal) * 100);
            diskonBadge = `<div class="absolute top-4 right-4 z-20 bg-cyan-500 text-slate-950 font-black px-2.5 py-1 rounded-lg text-[11px] shadow-lg">-${persen}%</div>`;
        }

        const isDiscontinued = (p.status || '').toUpperCase() !== 'ACTIVE';
        const cardClass = isDiscontinued ? 'opacity-40 grayscale pointer-events-none' : 'card-animate';
        const statusBadge = isDiscontinued ? `<div class="absolute top-4 left-4 z-20 bg-black/80 text-white border border-red-500/50 px-3 py-1 rounded-lg text-[9px] font-black uppercase">Produk ini discontinue</div>` : '';

        const dim = (p.panjang_cm || p.lebar_cm || p.tinggi_cm) 
            ? `<div class="flex gap-3 text-[10px] text-slate-500 font-bold border-t border-white/5 pt-3 mb-4">
                <span>P: ${p.panjang_cm || 0}</span> <span>L: ${p.lebar_cm || 0}</span> <span>T: ${p.tinggi_cm || 0}</span>
               </div>` : '';

        return `
            <div class="glass-card rounded-[2.5rem] p-5 relative flex flex-col h-full ${cardClass}" style="animation-delay: ${(i % 8) * 0.1}s">
                ${statusBadge}
                ${diskonBadge}
                
                <div onclick="window.UI.openGallery('${rawImgs}')" class="aspect-square w-full rounded-[2rem] overflow-hidden bg-slate-800/50 relative cursor-zoom-in group">
                    <img src="${cover}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                </div>

                <div class="mt-6 flex-grow">
                    <div class="flex justify-between items-start mb-2">
                        <p class="text-[9px] text-cyan-400 font-bold uppercase tracking-widest">${p.brand || '-'}</p>
                        <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest">${p.category || '-'}</p>
                    </div>
                    <h3 class="text-md font-bold text-white leading-tight mb-4 line-clamp-2">${p.product_title || 'Furniture Unit'}</h3>
                    ${dim}
                    <div class="flex flex-col mb-6">
                        ${hNormal > hJual ? `<span class="text-[10px] text-slate-600 line-through mb-1">${window.UI.formatRupiah(hNormal)}</span>` : ''}
                        <span class="text-2xl font-black text-white tracking-tighter">${window.UI.formatRupiah(hJual)}</span>
                    </div>
                    
                    <div class="flex gap-2">
                        <button onclick="window.addToCart('${upc}')" class="p-4 bg-slate-800 text-white rounded-[1.5rem] hover:bg-slate-700 active:scale-90 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </button>
                        <a href="https://wa.me/6285393620791?text=${encodeURIComponent(`Halo Rama, saya tertarik:\nNama: ${p.product_title}\nUPC: ${upc}`)}" target="_blank" class="flex-grow flex items-center justify-center bg-white text-slate-950 font-extrabold py-4 rounded-[1.5rem] hover:bg-cyan-400 transition-all active:scale-95 text-xs">PESAN SEKARANG</a>
                    </div>
                </div>
            </div>
        `;
    }
};

window.closeGallery = () => { document.getElementById('galleryModal').classList.add('hidden'); document.body.style.overflow = 'auto'; };
