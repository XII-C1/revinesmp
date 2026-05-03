document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. KONFIGURASI FIREBASE & TELEGRAM 
    // ==========================================
    const firebaseConfig = {
        apiKey: "AIzaSyAucrxSrstnKznV_dqBy8dPyBK2xd0ekdI",
        authDomain: "revinevault.firebaseapp.com",
        databaseURL: "https://revinevault-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "revinevault",
        storageBucket: "revinevault.firebasestorage.app",
        messagingSenderId: "57707912883",
        appId: "1:57707912883:web:43a210e7c791a2548d9ac6",
    };
    if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
    
    // PAKE REALTIME DATABASE AYEUNA MAH
    const db = firebase.database();

    const TELEGRAM_BOT_TOKEN = "8762627384:AAE1B8nEcTF2-k4VUKx6Rwm8XyOvfMW2E6k"; 
    const TELEGRAM_CHAT_ID = "5933988516";

    // ==========================================
    // 2. INISIALISASI BENDERA & POPUP
    // ==========================================
    const inputWA = document.querySelector("#wa-number");
    const iti = window.intlTelInput(inputWA, {
        initialCountry: "id", 
        separateDialCode: true,
        utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js",
    });

    window.showPopup = function(type, title, message) {
        const popup = document.getElementById('ultra-popup');
        const icon = document.getElementById('popup-icon');
        document.getElementById('popup-title').innerText = title;
        document.getElementById('popup-desc').innerText = message;

        if (type === 'error') {
            icon.innerHTML = '<i class="fas fa-times-circle" style="color: #ef4444; font-size: 4rem;"></i>';
        } else if (type === 'warning') {
            icon.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: #f59e0b; font-size: 4rem;"></i>';
        } else if (type === 'success') {
            icon.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981; font-size: 4rem;"></i>';
        }
        popup.classList.add('show');
    }
    window.closePopup = function() { document.getElementById('ultra-popup').classList.remove('show'); }

    // ==========================================
    // 3. LOGIKA FIREBASE REALTIME DATABASE (CEK DISKON)
    // ==========================================
    let discountApplied = 0; 

    document.getElementById('btn-apply-discount').addEventListener('click', async () => {
        const code = document.getElementById('discount-code').value.trim().toUpperCase();
        if (code === "") { showPopup('error', 'Gagal!', 'Masukkan kode voucher terlebih dahulu!'); return; }

        try {
            // Nembak langsung ka Realtime Database luyu jeung screenshot manéh
            const snapshot = await db.ref(code).once('value');

            if (snapshot.exists()) {
                const data = snapshot.val();
                if (data.status === "EXPIRED") {
                    showPopup('error', 'Kode Kadaluarsa', 'Kode diskon ini sudah melewati batas waktu.');
                } else if (data.sisa_kuota <= 0) {
                    showPopup('warning', 'Batas Tercapai', 'Kode diskon ini sudah habis digunakan.');
                } else {
                    discountApplied = data.potongan; 
                    updateTotal(); 
                    showPopup('success', 'Berhasil!', `Kode diskon diterapkan! Anda mendapat potongan Rp ${data.potongan.toLocaleString('id-ID')}`);
                }
            } else {
                showPopup('error', 'Tidak Ditemukan', 'Kode voucher tidak valid.');
            }
        } catch (error) {
            console.error("Error Firebase:", error);
            showPopup('error', 'Error Server', 'Gagal mengecek kode. Cek koneksi internet.');
        }
    });

    // ==========================================
    // 4. DATA HARGA & GENERATE KOTAK HARGA
    // ==========================================
    const ranksData = {
        warrior: { name: "WARRIOR", prices: [ { text: "3 Hari", price: 1500 }, { text: "1 Minggu", price: 2500 }, { text: "1 Bulan", price: 5000 }, { text: "Permanent", price: 8000 } ]},
        elite: { name: "ELITE", prices: [ { text: "3 Hari", price: 2000 }, { text: "1 Minggu", price: 4000 }, { text: "1 Bulan", price: 7500 }, { text: "Permanent", price: 15000 } ]},
        vip: { name: "VIP", prices: [ { text: "3 Hari", price: 2500 }, { text: "1 Minggu", price: 5000 }, { text: "1 Bulan", price: 10000 }, { text: "Permanent", price: 20000 } ]},
        vvip: { name: "VVIP", prices: [ { text: "3 Hari", price: 4000 }, { text: "1 Minggu", price: 7500 }, { text: "1 Bulan", price: 15000 }, { text: "Permanent", price: 30000 } ]},
        mvp: { name: "MVP", prices: [ { text: "3 Hari", price: 5000 }, { text: "1 Minggu", price: 10000 }, { text: "1 Bulan", price: 20000 }, { text: "Permanent", price: 40000 } ]},
        legend: { name: "LEGEND", prices: [ { text: "3 Hari", price: 6500 }, { text: "1 Minggu", price: 12500 }, { text: "1 Bulan", price: 25000 }, { text: "Permanent", price: 50000 } ]},
        cosmic: { name: "COSMIC", prices: [ { text: "3 Hari", price: 12500 }, { text: "1 Minggu", price: 25000 }, { text: "1 Bulan", price: 50000 }, { text: "Permanent", price: 80000, oldPrice: 100000 } ]},
        nether: { name: "NETHER", prices: [ { text: "3 Hari", price: 19000 }, { text: "1 Minggu", price: 37500 }, { text: "1 Bulan", price: 75000 }, { text: "Permanent", price: 100000, oldPrice: 150000 } ]}
    };

    const urlParams = new URLSearchParams(window.location.search);
    let selectedRankKey = urlParams.get('rank') || 'warrior'; 
    if (!ranksData[selectedRankKey]) selectedRankKey = 'warrior';

    const currentRank = ranksData[selectedRankKey];
    document.getElementById('display-rank-name').innerText = currentRank.name;

    const priceContainer = document.getElementById('price-options-container');
    const totalDisplay = document.getElementById('total-display');

    currentRank.prices.forEach((item, index) => {
        const isChecked = index === 0 ? 'checked' : '';
        let promoTag = item.oldPrice ? `<div class="pc-promo">Rp ${item.oldPrice.toLocaleString('id-ID')}</div>` : '';
        
        priceContainer.innerHTML += `
            <label class="price-card-label">
                <input type="radio" name="duration" value="${item.price}" data-text="${item.text}" ${isChecked}>
                <div class="price-card-custom">
                    <div class="pc-title">${item.text}</div>
                    <div class="price-group">
                        ${promoTag}
                        <div class="pc-price">Rp ${item.price.toLocaleString('id-ID')}</div>
                    </div>
                </div>
            </label>
        `;
    });

    const durationRadios = document.querySelectorAll('input[name="duration"]');
    const updateTotal = () => {
        let selectedRadio = document.querySelector('input[name="duration"]:checked');
        if(selectedRadio) {
            let finalPrice = parseInt(selectedRadio.value) - discountApplied;
            if (finalPrice < 0) finalPrice = 0; 
            totalDisplay.innerText = `Rp ${finalPrice.toLocaleString('id-ID')}`;
        }
    };
    durationRadios.forEach(radio => radio.addEventListener('change', updateTotal));
    updateTotal();

    const editionRadios = document.querySelectorAll('input[name="edition"]');
    const bedrockPrefix = document.getElementById('bedrock-prefix');
    const gamertagInput = document.getElementById('gamertag');
    
    editionRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'bedrock') {
                bedrockPrefix.style.display = 'flex';
                gamertagInput.style.paddingLeft = '10px';
            } else {
                bedrockPrefix.style.display = 'none';
                gamertagInput.style.paddingLeft = '20px';
            }
        });
    });

    // ==========================================
    // 5. MODAL KONFIRMASI & TNC
    // ==========================================
    const tncCheckbox = document.getElementById('tnc-checkbox');
    const btnFinalPesan = document.getElementById('btn-final-pesan');
    let linkWAPesanan = ""; 
    let pesanTelegram = ""; 

    tncCheckbox.addEventListener('change', function() {
        if (this.checked) {
            btnFinalPesan.style.display = 'block'; 
        } else {
            btnFinalPesan.style.display = 'none'; 
        }
    });

    document.getElementById('checkout-form').addEventListener('submit', (e) => {
        e.preventDefault(); 
        
        let edition = document.querySelector('input[name="edition"]:checked').value;
        let editionText = (edition === 'java') ? 'Java Edition' : 'Bedrock (MCPE)'; 
        let gt = document.getElementById('gamertag').value;
        let finalGamertag = (edition === 'bedrock') ? `.${gt}` : gt;
        let name = document.getElementById('real-name').value;
        let waLengkap = iti.getNumber(); 
        let paymentText = document.getElementById('payment-method').options[document.getElementById('payment-method').selectedIndex].text;
        let selectedDuration = document.querySelector('input[name="duration"]:checked').getAttribute('data-text');
        
        document.getElementById('modal-item').innerText = `${currentRank.name} [${selectedDuration}]`;
        document.getElementById('modal-platform').innerText = editionText; 
        document.getElementById('modal-gamertag').innerText = finalGamertag;
        document.getElementById('modal-payment').innerText = paymentText;
        document.getElementById('modal-total').innerText = totalDisplay.innerText;

        let textWA = `Halo Admin Revine SMP!%0ASaya ingin melakukan pembelian rank:%0A%0A` +
                     `*Rank:* ${currentRank.name}%0A` +
                     `*Durasi:* ${selectedDuration}%0A` +
                     `*Platform:* ${editionText}%0A` +
                     `*Gamertag:* ${finalGamertag}%0A` +
                     `*Nama:* ${name}%0A` +
                     `*No WA:* ${waLengkap}%0A` +
                     `*Payment:* ${paymentText}%0A%0A` +
                     `*Total:* ${totalDisplay.innerText}%0A%0A` +
                     `Tolong berikan instruksi pembayaran selanjutnya!`;
        linkWAPesanan = `https://wa.me/6287870963655?text=${textWA}`;

        pesanTelegram = `🔔 *PESANAN RANK BARU!* 🔔\n\n` +
                        `*Rank:* ${currentRank.name} [${selectedDuration}]\n` +
                        `*Platform:* ${editionText}\n` +
                        `*Gamertag:* \`${finalGamertag}\`\n` +
                        `*Nama:* ${name}\n` +
                        `*No WA:* ${waLengkap}\n` +
                        `*Metode:* ${paymentText}\n` +
                        `*Total:* ${totalDisplay.innerText}\n\n` +
                        `_Menunggu player konfirmasi via WA..._`;

        tncCheckbox.checked = false;
        btnFinalPesan.style.display = 'none';
        document.getElementById('confirm-modal').classList.add('show');
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, zIndex: 9999999 });
    });

    window.closeConfirmModal = function() {
        document.getElementById('confirm-modal').classList.remove('show');
    }

    // ==========================================
    // 6. TOMBOL "PESAN SEKARANG" 
    // ==========================================
    document.getElementById('btn-final-pesan').addEventListener('click', () => {
        const teleUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        fetch(teleUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                chat_id: TELEGRAM_CHAT_ID, 
                text: pesanTelegram, 
                parse_mode: 'Markdown' 
            })
        }).catch(err => console.error("Gagal ngirim ka Telegram:", err));

        window.open(linkWAPesanan, '_blank');
        closeConfirmModal();
    });
});