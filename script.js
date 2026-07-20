/* ==========================================================================
   0. CONSOLE AUDIO SYNTHESIZER ENGINE (WEB AUDIO API)
   ========================================================================== */
let audioCtx = null;
let isAudioMuted = true;

const audioToggleBtn = document.getElementById('audioToggleBtn');

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playSynthesizedSound(freq, duration, type = 'sine', gainVal = 0.1) {
    if (isAudioMuted) return;
    try {
        initAudio();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(gainVal, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
        console.error(e);
    }
}

window.playTickSound = () => {
    playSynthesizedSound(900, 0.05, 'sine', 0.02);
};

window.playClickSound = () => {
    playSynthesizedSound(650, 0.08, 'triangle', 0.05);
};

window.playSuccessSound = () => {
    if (isAudioMuted) return;
    initAudio();
    setTimeout(() => playSynthesizedSound(523.25, 0.12, 'sine', 0.08), 0);
    setTimeout(() => playSynthesizedSound(659.25, 0.12, 'sine', 0.08), 80);
    setTimeout(() => playSynthesizedSound(783.99, 0.25, 'sine', 0.08), 160);
};

if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isAudioMuted = !isAudioMuted;
        if (!isAudioMuted) {
            initAudio();
            audioToggleBtn.querySelector('i').className = 'fas fa-volume-up';
            audioToggleBtn.style.color = 'var(--primary-yellow)';
            audioToggleBtn.style.borderColor = 'var(--primary-yellow)';
            window.playClickSound();
        } else {
            audioToggleBtn.querySelector('i').className = 'fas fa-volume-mute';
            audioToggleBtn.style.color = 'var(--text-muted)';
            audioToggleBtn.style.borderColor = 'rgba(255, 255, 255, 0.05)';
        }
    });
}

// Global UI interaction sounds
document.addEventListener('click', (e) => {
    // Avoid playing double sounds on audioToggleBtn itself
    if (e.target.closest('#audioToggleBtn')) return;
    if (e.target.closest('button, a, .cyber-node, .price-box, .tech-box, .tech-filter-btn')) {
        window.playClickSound();
    }
});

/* ==========================================================================
   1. DYNAMIC CYBER PARTICLES BACKGROUND ENGINE
   ========================================================================== */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let particlesArray = [];
const numberOfParticles = 90;

const mouse = { x: null, y: null, radius: 180, isClicked: false };
window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });
window.addEventListener('click', (e) => {
    // Generate extra temporary burst particles
    const burstCount = 12;
    for (let i = 0; i < burstCount; i++) {
        particlesArray.push(new Particle(e.clientX, e.clientY, true));
    }
    // Limit array size to prevent performance lags
    if (particlesArray.length > 150) {
        particlesArray.splice(numberOfParticles, particlesArray.length - numberOfParticles);
    }
});

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor(x, y, isTemporary = false) {
        this.x = x !== undefined ? x : Math.random() * canvas.width;
        this.y = y !== undefined ? y : Math.random() * canvas.height;
        this.isTemporary = isTemporary;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 1.2 - 0.6;
        this.speedY = Math.random() * 1.2 - 0.6;
        if (isTemporary) {
            // Burst particles fly faster
            const angle = Math.random() * Math.PI * 2;
            const force = Math.random() * 3 + 1;
            this.speedX = Math.cos(angle) * force;
            this.speedY = Math.sin(angle) * force;
            this.life = 100; // opacity life
        }
        // Assign a color theme accent: gold or cyan
        this.color = Math.random() > 0.5 ? 'gold' : 'cyan';
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;

        // Interaction with mouse gravity/magnetic field
        if (mouse.x != null && mouse.y != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.hypot(dx, dy);
            if (distance < mouse.radius) {
                // Pull particles slightly in, but if too close, push away slightly
                let force = (mouse.radius - distance) / mouse.radius;
                if (distance > 60) {
                    this.x += (dx / distance) * force * 0.8;
                    this.y += (dy / distance) * force * 0.8;
                } else {
                    this.x -= (dx / distance) * force * 1.5;
                    this.y -= (dy / distance) * force * 1.5;
                }
            }
        }

        if (this.isTemporary) {
            this.life -= 1.5;
        }
    }
    draw() {
        let opacity = this.isTemporary ? this.life / 100 : 0.85;
        if (opacity < 0) opacity = 0;
        ctx.fillStyle = this.color === 'gold' ? `rgba(255, 215, 0, ${opacity})` : `rgba(0, 240, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particlesArray = [];
    for (let i = 0; i < numberOfParticles; i++) { particlesArray.push(new Particle()); }
}

function connectParticles() {
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let dx = particlesArray[a].x - particlesArray[b].x;
            let dy = particlesArray[a].y - particlesArray[b].y;
            let distance = Math.hypot(dx, dy);
            if (distance < 120) {
                let opacity = (1 - (distance / 120)) * 0.15;
                // If they are click-burst particles, make connections slightly brighter
                if (particlesArray[a].isTemporary || particlesArray[b].isTemporary) {
                    const avgLife = ((particlesArray[a].life || 100) + (particlesArray[b].life || 100)) / 200;
                    opacity *= avgLife;
                }
                
                // Color gradient lines (mix of gold and cyan)
                if (particlesArray[a].color === 'gold' && particlesArray[b].color === 'gold') {
                    ctx.strokeStyle = `rgba(255, 215, 0, ${opacity})`;
                } else if (particlesArray[a].color === 'cyan' && particlesArray[b].color === 'cyan') {
                    ctx.strokeStyle = `rgba(0, 240, 255, ${opacity})`;
                } else {
                    ctx.strokeStyle = `rgba(127, 227, 127, ${opacity})`; // neutral green/yellow
                }
                
                ctx.lineWidth = 0.5;
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
    
    // Filter out dead burst particles
    particlesArray = particlesArray.filter(p => !p.isTemporary || p.life > 0);
    
    particlesArray.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animateParticles);
}
initParticles();
animateParticles();


/* ==========================================================================
   2. ADVANCED INTERACTIVE SLIDER MECHANISM
   ========================================================================== */
let currentSlide = 0;
window.moveSlide = function(direction) {
    const slider = document.getElementById('portfolioSlider');
    const totalSlides = document.querySelectorAll('.slide').length;
    currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
    if(slider) {
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
}


/* ==========================================================================
   3. ADVANCED SCROLL REVEAL EFFECT
   ========================================================================== */
const revealElements = document.querySelectorAll('.reveal');
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        } else {
            entry.target.classList.remove('active'); 
        }
    });
}, {
    threshold: 0.15,
    rootMargin: "0px 0px -20px 0px"
});
revealElements.forEach(el => scrollObserver.observe(el));


/* ==========================================================================
   4. ENHANCED PRELOADER WITH SCROLL LOCK & DIAGNOSTICS LOG
   ========================================================================== */
document.body.classList.add('preloader-active');

function runPreloader() {
    const logBox = document.getElementById('preloaderLog');
    const bar = document.getElementById('preloaderBar');
    const percentEl = document.getElementById('preloaderPercentage');
    const preloader = document.getElementById('id_preloader');

    const bootSequence = [
        { progress: 15, text: "> NET: Connecting to Veloct Cloud Gateway..." },
        { progress: 35, text: "> SECURITY: Initializing WebRTC & TLS handshake..." },
        { progress: 55, text: "> HARDWARE: Allocating memory buffers for Veloct Engine..." },
        { progress: 75, text: "> DEV CORES: Mounting Imesha, Ashani, & Hirusha nodes..." },
        { progress: 90, text: "> GRAPHICS: Compiling custom Shaders & Particle fields..." },
        { progress: 100, text: "> SYS: Boot complete. Entering active interface." }
    ];

    let currentStepIndex = 0;
    let currentPercent = 0;

    const interval = setInterval(() => {
        if (currentPercent < 100) {
            currentPercent += 1;
            if (percentEl) percentEl.textContent = currentPercent;
            if (bar) bar.style.width = currentPercent + '%';

            // Check if we hit the next milestone in sequence
            if (currentStepIndex < bootSequence.length && currentPercent >= bootSequence[currentStepIndex].progress) {
                const newLog = document.createElement('div');
                newLog.className = 'log-line';
                newLog.textContent = bootSequence[currentStepIndex].text;
                if (logBox) {
                    logBox.appendChild(newLog);
                    logBox.scrollTop = logBox.scrollHeight;
                }
                
                // Add sound effects if sound is loaded/enabled (will implement in Audio engine task)
                if (window.playTickSound) window.playTickSound();
                
                currentStepIndex++;
            }
        } else {
            clearInterval(interval);
            setTimeout(() => {
                if (preloader) {
                    preloader.style.opacity = '0';
                    setTimeout(() => {
                        preloader.style.display = 'none';
                        document.body.classList.remove('preloader-active');
                        // Trigger page scroll-reveals
                        document.querySelectorAll('.reveal').forEach(el => {
                            if (el.getBoundingClientRect().top < window.innerHeight * 0.8) {
                                el.classList.add('active');
                            }
                        });
                    }, 800);
                }
            }, 500);
        }
    }, 25);
}

window.addEventListener('load', runPreloader);


/* ==========================================================================
   5. HERO SECTION PARALLAX EFFECT (FIXED)
   ========================================================================== */
document.addEventListener("mousemove", function(e) {
    // වැරදි Class එක නිවැරදි කරන ලදී (.hero-content-left)
    const heroContent = document.querySelector(".hero-content-left");
    if(heroContent) {
        let x = (window.innerWidth / 2 - e.pageX) / 45;
        let y = (window.innerHeight / 2 - e.pageY) / 45;
        heroContent.style.transform = `translateX(${x}px) translateY(${y}px)`;
    }
});


/* ==========================================================================
   6. AUTOMATIC NAVIGATION LINK HIGHLIGHT ON SCROLL
   ========================================================================== */
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('nav ul li a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= (sectionTop - 120)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});


/* ==========================================================================
   7. MOBILE HAMBURGER MENU MECHANISM (STABLE FULL-SCREEN)
   ========================================================================== */
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const menuIcon = menuToggle ? menuToggle.querySelector('i') : null;
const navLinksMobile = document.querySelectorAll('nav ul li a');

if (menuToggle && navMenu && menuIcon) {
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Menu එක open/close කිරීම
        navMenu.classList.toggle('active');
        
        if (navMenu.classList.contains('active')) {
            // Hamburger Icon එක X සලකුණක් බවට පත් කිරීම
            menuIcon.classList.remove('fa-bars');
            menuIcon.classList.add('fa-times');
            
            // මෙනු එක ඇතුළත ඇති විට මුළු පිටුවම scroll වීම වැළැක්වීම
            document.body.style.overflow = 'hidden'; 
            
            // ලින්ක් එකින් එක පාවී එන ඇනිමේෂන් එක (Staggered Delay)
            const listItems = navMenu.querySelectorAll('ul li');
            listItems.forEach((item, index) => {
                item.style.transitionDelay = `${(index * 0.05) + 0.1}s`;
            });
        } else {
            // නැවත Hamburger සලකුණ පෙන්වීම
            menuIcon.classList.remove('fa-times');
            menuIcon.classList.add('fa-bars');
            document.body.style.overflow = '';
        }
    });

    // මෙනු එකේ ලින්ක් එකක් ක්ලික් කළ සැනින් මෙනු එක වසා දැමීම
    navLinksMobile.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuIcon.classList.remove('fa-times');
            menuIcon.classList.add('fa-bars');
            document.body.style.overflow = '';
        });
    });
}


/* ==========================================================================
   8. HERO DAFBOARD TELEMETRY & FOUNDERS INTERACTIVE DRAWERS
   ========================================================================== */
// Telemetry updates
const pingVal = document.getElementById('pingVal');
const cpuVal = document.getElementById('cpuVal');

if (pingVal && cpuVal) {
    setInterval(() => {
        const randomPing = Math.floor(Math.random() * 15) + 10; // 10ms - 25ms
        const randomCpu = (Math.random() * 14 + 18).toFixed(1); // 18% - 32%
        pingVal.textContent = randomPing + 'ms';
        cpuVal.textContent = randomCpu + '%';
    }, 1500);
}

// Drawer members database
const memberData = {
    ashani: {
        name: "Ashani Upeksha",
        role: "Full-Stack Developer",
        img: "images/ashani_cyber.jpg",
        bio: "Specialized in building end-to-end web architectures, high-performance interactive interfaces, and robust system integration.",
        fe: "95%",
        be: "88%",
        db: "85%",
        socials: [
            { icon: "fab fa-github", url: "https://github.com/Ashiupekshi" },
            { icon: "fab fa-linkedin-in", url: "https://www.linkedin.com/in/ashani-upeksha-samarasinghe-3b5a91270" },
            { icon: "fab fa-facebook-f", url: "https://www.facebook.com/share/1BkeNRzDtG/" }
        ]
    },
    hirusha: {
        name: "Hirusha Arunoth",
        role: "Head of Marketing",
        img: "images/aiya_cyber.jpg",
        bio: "Drives business growth, strategic client operations, and digital campaign initiatives to scale the Veloct ecosystem locally and globally.",
        fe: "75%",
        be: "60%",
        db: "55%",
        socials: [
            { icon: "fab fa-github", url: "#" },
            { icon: "fab fa-linkedin-in", url: "#" },
            { icon: "fab fa-facebook-f", url: "https://www.facebook.com/share/1BkeNRzDtG/" }
        ]
    },
    imesha: {
        name: "Imesha Umayangani",
        role: "Full-Stack Developer",
        img: "images/imesha.png",
        bio: "Expertise in designing scalable server-side systems, optimized relational database configurations, and secure application pipelines.",
        fe: "85%",
        be: "92%",
        db: "90%",
        socials: [
            { icon: "fab fa-github", url: "#" },
            { icon: "fab fa-linkedin-in", url: "#" },
            { icon: "fab fa-facebook-f", url: "https://www.facebook.com/share/1BkeNRzDtG/" }
        ]
    }
};

const cyberNodes = document.querySelectorAll('.cyber-node');
const bioDrawer = document.getElementById('bioDrawer');
const closeDrawer = document.getElementById('closeDrawer');

const drawerImg = document.getElementById('drawerImg');
const drawerName = document.getElementById('drawerName');
const drawerRole = document.getElementById('drawerRole');
const drawerBio = document.getElementById('drawerBio');
const fillFE = document.getElementById('fillFE');
const fillBE = document.getElementById('fillBE');
const fillDB = document.getElementById('fillDB');
const valFE = document.getElementById('valFE');
const valBE = document.getElementById('valBE');
const valDB = document.getElementById('valDB');
const drawerSocials = document.getElementById('drawerSocials');

if (cyberNodes.length > 0 && bioDrawer && closeDrawer) {
    cyberNodes.forEach(node => {
        node.addEventListener('click', (e) => {
            e.stopPropagation();
            const memberKey = node.getAttribute('data-member');
            const data = memberData[memberKey];
            
            if (data) {
                // Populate drawer
                drawerImg.src = data.img;
                drawerImg.alt = data.name;
                drawerName.textContent = data.name;
                drawerRole.textContent = data.role;
                drawerBio.textContent = data.bio;
                
                // Set skill numbers
                valFE.textContent = data.fe;
                valBE.textContent = data.be;
                valDB.textContent = data.db;

                // Reset meters first for animation effect
                fillFE.style.width = '0%';
                fillBE.style.width = '0%';
                fillDB.style.width = '0%';

                // Populate socials
                drawerSocials.innerHTML = '';
                data.socials.forEach(soc => {
                    const a = document.createElement('a');
                    a.href = soc.url;
                    a.target = '_blank';
                    a.innerHTML = `<i class="${soc.icon}"></i>`;
                    drawerSocials.appendChild(a);
                });

                // Show Drawer
                bioDrawer.classList.add('active');

                // Animate meters in next tick
                setTimeout(() => {
                    fillFE.style.width = data.fe;
                    fillBE.style.width = data.be;
                    fillDB.style.width = data.db;
                }, 100);
            }
        });
    });

    closeDrawer.addEventListener('click', (e) => {
        e.stopPropagation();
        bioDrawer.classList.remove('active');
    });

    // Close when clicking outside of the drawer contents
    document.addEventListener('click', (e) => {
        if (bioDrawer.classList.contains('active') && !bioDrawer.contains(e.target)) {
            bioDrawer.classList.remove('active');
        }
    });
}

/* ==========================================================================
   9. BORDER SPOTLIGHT HOVER EFFECTS
   ========================================================================== */
const spotlightCards = document.querySelectorAll('.service-card, .process-card, .team-card, .price-box');
spotlightCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

/* ==========================================================================
   10. TECH STACK FILTER ENGINE
   ========================================================================== */
const techFilterBtns = document.querySelectorAll('.tech-filter-btn');
const techBoxes = document.querySelectorAll('.tech-box');

if (techFilterBtns.length > 0) {
    techFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            techFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            techBoxes.forEach(box => {
                const boxCat = box.getAttribute('data-tech-cat');
                if (filterValue === 'all' || boxCat === filterValue) {
                    box.classList.remove('hidden');
                    box.style.display = '';
                    setTimeout(() => {
                        box.style.opacity = '1';
                        box.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    box.style.opacity = '0';
                    box.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        box.classList.add('hidden');
                    }, 250);
                }
            });
        });
    });
}

/* ==========================================================================
   11. SCROLL PROGRESS BAR ENGINE
   ========================================================================== */
const scrollProgressBar = document.getElementById('scrollProgress');
if (scrollProgressBar) {
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        scrollProgressBar.style.width = progress + '%';
    }, { passive: true });
}

/* ==========================================================================
   12. LIVE STAT COUNTERS
   ========================================================================== */
function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 2000;
    const startTime = performance.now();

    function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = target;
        }
    }
    requestAnimationFrame(update);
}

// Observe stat numbers and trigger counter when visible
const statNumbers = document.querySelectorAll('.stat-number');
if (statNumbers.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target); // Only run once
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(num => counterObserver.observe(num));
}

/* ==========================================================================
   13. TERMINAL FORM SUBMISSION ENGINE
   ========================================================================== */
const agencyForm = document.getElementById('agencyForm');
const formTerminal = document.getElementById('formTerminal');
const ftBody = document.getElementById('ftBody');
const ftSuccess = document.getElementById('ftSuccess');
const ftCloseBtn = document.getElementById('ftCloseBtn');
const submitBtn = document.getElementById('submitBtn');

const transmissionSteps = [
    { text: '> AUTHENTICATING CLIENT REQUEST...', delay: 0 },
    { text: '> ENCRYPTING PAYLOAD WITH TLS 1.3...', delay: 600 },
    { text: '> ROUTING PACKET TO VELOCT SECURE RELAY...', delay: 1300 },
    { text: '> VERIFYING PROJECT SCHEMA SIGNATURE...', delay: 2100 },
    { text: '> COMPRESSING DATA BUNDLE...', delay: 2900 },
    { text: '> HANDSHAKE ESTABLISHED. TRANSMITTING...', delay: 3700 },
    { text: '> SYS: TRANSMISSION DELIVERED. STATUS: 200_OK', delay: 4500 }
];

if (agencyForm && formTerminal && ftBody && ftSuccess && submitBtn) {
    agencyForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Show terminal overlay
        ftBody.innerHTML = '';
        ftSuccess.classList.remove('show');
        formTerminal.classList.add('active');
        submitBtn.classList.add('loading');
        submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Transmitting...';

        // Typewriter terminal effect
        transmissionSteps.forEach(step => {
            setTimeout(() => {
                const line = document.createElement('div');
                line.className = 'log-line';
                line.textContent = step.text;
                ftBody.appendChild(line);
                ftBody.scrollTop = ftBody.scrollHeight;
                if (window.playTickSound) window.playTickSound();
            }, step.delay);
        });

        // Show success state
        setTimeout(() => {
            ftBody.style.display = 'none';
            ftSuccess.classList.add('show');
            if (window.playSuccessSound) window.playSuccessSound();
        }, 5400);
    });

    ftCloseBtn.addEventListener('click', () => {
        formTerminal.classList.remove('active');
        ftBody.style.display = '';
        ftSuccess.classList.remove('show');
        submitBtn.classList.remove('loading');
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Project Specification';
        agencyForm.reset();
    });
}