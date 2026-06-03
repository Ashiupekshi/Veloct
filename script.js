/* 1. DYNAMIC CYBER PARTICLES BACKGROUND ENGINE */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let particlesArray = [];
const numberOfParticles = 85;

const mouse = { x: null, y: null, radius: 160 };
window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 1.5 - 0.75;
        this.speedY = Math.random() * 1.5 - 0.75;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;

        if (mouse.x != null && mouse.y != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.hypot(dx, dy);
            if (distance < mouse.radius) {
                let force = (mouse.radius - distance) / mouse.radius;
                this.x -= (dx / distance) * force * 3;
                this.y -= (dy / distance) * force * 3;
            }
        }
    }
    draw() {
        ctx.fillStyle = '#FFD700';
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
            if (distance < 115) {
                ctx.strokeStyle = `rgba(255, 215, 0, ${1 - (distance / 115) * 0.85})`;
                ctx.lineWidth = 0.4;
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
    particlesArray.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animateParticles);
}
initParticles();
animateParticles();


/* 2. ADVANCED INTERACTIVE SLIDER MECHANISM */
let currentSlide = 0;
function moveSlide(direction) {
    const slider = document.getElementById('portfolioSlider');
    const totalSlides = document.querySelectorAll('.slide').length;
    currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
}


/* 3. ADVANCED SCROLL REVEAL EFFECT */
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


/* 4. ENHANCED PRELOADER WITH AUTOMATIC SCROLL TO TOP */
window.addEventListener('load', () => {
    const preloader = document.getElementById('id_preloader');
    
    window.scrollTo(0, 0);

    setTimeout(() => {
        if (preloader) {
            preloader.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            preloader.style.opacity = '0';
            
            setTimeout(() => {
                preloader.style.display = 'none';
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }, 800);
        }
    }, 2500); 
});


/* 5. HERO SECTION PARALLAX EFFECT */
document.addEventListener("mousemove", function(e) {
    const heroContent = document.querySelector(".hero-content");
    if(heroContent) {
        let x = (window.innerWidth / 2 - e.pageX) / 30;
        let y = (window.innerHeight / 2 - e.pageY) / 30;
        heroContent.style.transform = `translateX(${x}px) translateY(${y}px)`;
    }
});

/* 6. AUTOMATIC NAVIGATION LINK HIGHLIGHT ON SCROLL */
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('nav ul li a');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        // Navigation බාර් එකේ උසට ගැලපෙන සේ (Offset 100px) සකසා ඇත
        if (pageYOffset >= (sectionTop - 100)) {
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