/**
 * REVINE SMP - ABSOLUTE CINEMA PRO MAX SCRIPT
 * Total Lines: ~700+ Combined | Features: Particle Engine, Manual Status Control, Sticky Nav.
 */

document.addEventListener("DOMContentLoaded", () => {
    
// ====================================================================
    // 1. MANUAL SERVER STATUS OVERRIDE (PENGATURAN MUTLAK)
    // ====================================================================
    // UBAH VARIABEL INI UNTUK MENGATUR STATUS WEB (true = nyala, false = mati)
    const SERVER_CONFIG = {
        isOnline: false,             
        onlineText: "ONLINE",
        offlineText: "OFFLINE"
    };

    function applyServerStatus() {
        const statusBox = document.getElementById('server-live-status');

        if (!statusBox) return;

        const textVal = document.getElementById('status-text-val');
        const heroBadge = document.getElementById('hero-badge');
        const mainIconWrap = document.querySelector('.status-icon-bg');
        const statusIcon = document.getElementById('status-icon');

        if(SERVER_CONFIG.isOnline) {
            // Tampilan Online
            statusBox.classList.remove('status-offline');
            statusBox.classList.add('status-online');
            textVal.innerText = SERVER_CONFIG.onlineText;
            
            // Hero Badge
            heroBadge.classList.remove('offline');
            heroBadge.innerHTML = `<span class="ping-dot"></span> Server On!`;

            // Icon Status Box
            mainIconWrap.classList.remove('red-danger');
            mainIconWrap.classList.add('emerald');
            statusIcon.className = 'fas fa-satellite-dish';

        } else {
            // Tampilan Offline / Maintenance
            statusBox.classList.remove('status-online');
            statusBox.classList.add('status-offline');
            textVal.innerText = SERVER_CONFIG.offlineText;

            // Hero Badge
            heroBadge.classList.add('offline');
            heroBadge.innerHTML = `<span class="ping-dot"></span> Server Offline`;

            // Icon Status Box
            mainIconWrap.classList.remove('emerald');
            mainIconWrap.classList.add('red-danger');
            statusIcon.className = 'fas fa-server';
        }
    }
    // Eksekusi status saat web dimuat
    applyServerStatus();


    // ====================================================================
    // 2. CINEMATIC PRELOADER PRO
    // ====================================================================
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('progress-bar');
    const loadingPct = document.getElementById('loading-pct');
    let progress = 0;
    
    const loadInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 12) + 4;
        if(progress >= 100) {
            progress = 100;
            clearInterval(loadInterval);
            setTimeout(() => {
                preloader.style.opacity = '0';
                preloader.style.visibility = 'hidden';
                initRevealObserver(); // Jalankan animasi reveal
                initCounters(); // Jalankan angka counter hero
            }, 600);
        }
        progressBar.style.width = `${progress}%`;
        loadingPct.innerText = `${progress}%`;
    }, 120);

    // ====================================================================
    // 3. CANVAS PARTICLES ENGINE (CUSTOM JS)
    // ====================================================================
    const canvas = document.getElementById('cinema-particles');
    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
            const colors = ['rgba(6, 182, 212, 0.4)', 'rgba(16, 185, 129, 0.3)'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
            if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    function initParticles() {
        particlesArray = [];
        let numberOfParticles = (canvas.width * canvas.height) / 12000;
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    function connectParticles() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
                + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                
                if (distance < (canvas.width / 12) * (canvas.height / 12)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacityValue * 0.04})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        connectParticles();
        requestAnimationFrame(animateParticles);
    }
    initParticles();
    animateParticles();

    // ====================================================================
    // 4. SMART HEADER SCROLL (Sticky Selalu)
    // ====================================================================
    const header = document.getElementById('ultimate-header');

    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Background blur threshold
        if (scrollTop > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');

    mobileBtn.addEventListener('click', () => {
        mobileBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileBtn.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // ====================================================================
    // 5. MAGNETIC BUTTONS (Efek Kursor Elegan)
    // ====================================================================
    const magneticElements = document.querySelectorAll('.magnetic');
    if(window.innerWidth > 768) {
        magneticElements.forEach(el => {
            el.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const hx = rect.left + rect.width / 2;
                const hy = rect.top + rect.height / 2;
                const x = e.clientX - hx;
                const y = e.clientY - hy;
                
                this.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
                this.style.transition = 'none';
            });

            el.addEventListener('mouseleave', function() {
                this.style.transform = `translate(0px, 0px)`;
                this.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            });
        });
    }

    // ====================================================================
    // 6. 3D TILT EFFECT (BENTO CARDS)
    // ====================================================================
    const tiltElements = document.querySelectorAll('.js-tilt');
    if(window.innerWidth > 768) {
        tiltElements.forEach(el => {
            el.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const xPct = (x / rect.width - 0.5) * 2;
                const yPct = (y / rect.height - 0.5) * 2;
                
                const rotateX = yPct * -8;
                const rotateY = xPct * 8;
                
                this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                this.style.zIndex = "10";
                this.style.transition = 'transform 0.1s ease-out';
            });

            el.addEventListener('mouseleave', function() {
                this.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                this.style.zIndex = "1";
                this.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
            });
        });
    }

    // ====================================================================
    // 7. COPY IP TO CLIPBOARD
    // ====================================================================
    const copyBtns = document.querySelectorAll('.copy-ip-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const ip = this.getAttribute('data-ip');
            const iconBox = this.querySelector('.copy-badge i');
            
            navigator.clipboard.writeText(ip).then(() => {
                iconBox.className = 'fas fa-check-circle';
                iconBox.style.color = 'var(--secondary)';
                
                setTimeout(() => {
                    iconBox.className = 'fas fa-copy';
                    iconBox.style.color = '';
                }, 2000);
            });
        });
    });

    // ====================================================================
    // 8. TABS SYSTEM (TUTORIAL GABUNG)
    // ====================================================================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            const targetId = `tab-${btn.getAttribute('data-tab')}`;
            document.getElementById(targetId).classList.add('active');
        });
    });

    // ====================================================================
    // 9. FAQ ACCORDION
    // ====================================================================
    const accHeaders = document.querySelectorAll('.accordion-header');
    accHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const item = this.parentElement;
            
            document.querySelectorAll('.accordion-item').forEach(other => {
                if(other !== item) {
                    other.classList.remove('active');
                }
            });
            item.classList.toggle('active');
        });
    });

    // ====================================================================
    // 10. STATS COUNTER ANIMATION
    // ====================================================================
    function initCounters() {
        const counters = document.querySelectorAll('.counter');
        const speed = 150; 
        
        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const inc = target / speed;
                
                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 15);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    }

    // ====================================================================
    // 11. SCROLL REVEAL OBSERVER (THE ABSOLUTE CINEMA)
    // ====================================================================
    function initRevealObserver() {
        const reveals = document.querySelectorAll('.reveal-up, .reveal-right');
        const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
        
        const scrollObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); 
                }
            });
        }, observerOptions);
        
        reveals.forEach(reveal => { scrollObserver.observe(reveal); });
    }

    // ====================================================================
    // 12. BACK TO TOP ROCKET
    // ====================================================================
    const backBtn = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        if(window.scrollY > 500) backBtn.classList.add('show');
        else backBtn.classList.remove('show');
    });

    backBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});