document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

    // --- Existing Path Logic ---
    const svg = document.querySelector("#motionPath");
    const path = document.querySelector("#path");
    const container = document.querySelector(".content-container");

    function resizePath() {
        const width = window.innerWidth;
        const height = container.scrollHeight;

        svg.setAttribute("width", width);
        svg.setAttribute("height", height);
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

        const center = width / 2;

        // Calculate Main Logo Position for Start
        const mainLogo = document.querySelector('.intro .main-logo');
        let startX = center;
        let startY = 0;

        if (mainLogo) {
            const logoRect = mainLogo.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            // Assume the icon is a square on the left with height = logo height
            const size = logoRect.height;

            // Update Tracker Image to match this size
            const trackerImg = document.querySelector("#tracker image");
            const clipCircle = document.querySelector("#circle-clip circle");

            if (trackerImg) {
                trackerImg.setAttribute("width", size);
                trackerImg.setAttribute("height", size);
                trackerImg.setAttribute("x", -size / 2);
                trackerImg.setAttribute("y", -size / 2);

                // Update clip circle radius
                if (clipCircle) {
                    clipCircle.setAttribute("r", size / 2);
                }
            }

            // Update Tracker Text position (to the right of the icon)
            const trackerText = document.getElementById("tracker-text");
            if (trackerText) {
                // Position text nicely to the right of the icon
                trackerText.setAttribute("x", (size / 2) + 10);
                trackerText.setAttribute("y", size * 0.1); // Slight vertical adjustment
            }

            // Center of the squared icon
            const iconOffset = size / 2;

            // "slight up and right side" offset
            // "slight up and right side" offset
            let manualOffsetX = 7;
            let manualOffsetY = -45;

            // Adjust offsets for smaller screens to maintain visual alignment
            if (width < 768) {
                // Mobile
                manualOffsetX = 20;
                manualOffsetY = -20;
            } else if (width < 1200) {
                // Tablet / Small Laptop: Center alignment
                manualOffsetX = 0;
                manualOffsetY = 0;
            }

            startX = (logoRect.left - containerRect.left) + iconOffset + manualOffsetX;
            startY = (logoRect.top - containerRect.top) + iconOffset + manualOffsetY;
        }

        const sections = document.querySelectorAll("section.company, section.footer, section#intro");
        // Start Point matches Main Logo
        let points = [{ x: startX, y: startY }];

        sections.forEach((section) => {
            const centerY = section.offsetTop + (section.offsetHeight / 2);
            let targetX = center;

            if (section.classList.contains('intro')) {
                // Skip adding a point for intro so it flows from startX
                return;
            } else if (section.classList.contains('left')) {
                targetX = width * 0.8;
            } else if (section.classList.contains('right')) {
                targetX = width * 0.2;
            } else {
                targetX = center;
            }
            points.push({ x: targetX, y: centerY });
        });

        // End point: Stop at the footer top (minus buffer)
        const footer = document.querySelector(".footer");
        const stopY = footer ? footer.offsetTop - 150 : height - 250;
        points.push({ x: center, y: stopY });

        let d = `M ${points[0].x} ${points[0].y}`;

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = (i > 0) ? points[i - 1] : points[0];
            const p1 = points[i];
            const p2 = points[i + 1];

            const cp1x = p1.x;
            const cp1y = p1.y + (p2.y - p1.y) / 2;
            const cp2x = p2.x;
            const cp2y = p1.y + (p2.y - p1.y) / 2;

            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        }

        path.setAttribute("d", d);

        ScrollTrigger.refresh();
        setupAnimations();
    }

    // Force strict recalculation for tablet to fix layout shifts
    function forceResize() {
        resizePath();
        setTimeout(resizePath, 500);
    }

    function setupAnimations() {
        gsap.killTweensOf("#tracker");
        gsap.killTweensOf("#path");
        gsap.killTweensOf("#tracker-text");

        // Motion Path
        gsap.to("#tracker", {
            motionPath: {
                path: "#path",
                align: "#path",
                alignOrigin: [0.5, 0.5],
                autoRotate: false
            },
            ease: "none",
            scrollTrigger: {
                trigger: ".content-container",
                start: "top top",
                end: "bottom bottom",
                scrub: 1
            }
        });

        // Tracker Text & Appearance Logic
        const trackerText = document.getElementById('tracker-text');

        // Show Tracker Text when scrolling out of Intro
        // Removed Main Logo fade to keep it visible ("show two images")
        ScrollTrigger.create({
            trigger: ".intro",
            start: "top top",
            end: "bottom center",
            onLeave: () => {
                gsap.to('#tracker-text', { opacity: 1, duration: 0.5 });
            },
            onEnterBack: () => {
                gsap.to('#tracker-text', { opacity: 0, duration: 0.5 });
            }
        });

        // Update Text & Logo based on Section
        // --- Dynamic Text & Icon Change on Scroll ---
        const sectionData = {
            'intro': { logo: 'images/logo_icon.png' }, // Default/Top logo
            'pricol-limited': { title: 'Pricol Limited', logo: 'images/logos/limited-removebg-preview.png' },
            'pricol-precision': { title: 'Pricol Precision', logo: 'images/logos/Make_the_round_202602041755-removebg-preview.png' },
            'pricol-engineering': { title: 'Pricol Engineering', logo: 'images/logos/Engineering-removebg-preview.png' },
            'pricol-travel': { title: 'Pricol Travel', logo: 'images/logos/Travel-removebg-preview.png' },
            'bluorb': { title: 'Bluorb', logo: 'images/logos/Make_the_outer_202602041748-removebg-preview.png' },
            'pricol-gourmet': { title: 'Pricol Gourmet', logo: 'images/logos/Only_inside_the_202602041759-removebg-preview.png' },
            'pricol-retreats': { title: 'Pricol Retreats', logo: 'images/logos/The_last_blue_202602050935-removebg-preview.png' },
            'pricol-durapack': { title: 'Pricol Durapack', logo: 'images/logos/The_last_blue_202602050939-removebg-preview.png' },
            'pricol-logistics': { title: 'Pricol Logistics', logo: 'images/logos/The_last_blue_202602050946-removebg-preview.png' },
            'pricol-asia': { title: 'Pricol Asia', logo: 'images/logos/Asia-removebg-preview.png' },
            'pricol-surya': { title: 'Pricol Surya', logo: 'images/logos/Surya-removebg-preview.png' },
            'pricol-holdings-section': { title: 'Pricol Holdings', logo: 'images/logos/The_last_blue_202602050947-removebg-preview.png' },
            'footer': { title: 'Pricol', logo: 'images/logo.png' } // Specific footer logo
        };

        const trackerImage = document.querySelector("#tracker image");

        Object.keys(sectionData).forEach(id => {
            const section = document.getElementById(id);
            if (section) {
                ScrollTrigger.create({
                    trigger: section,
                    start: "top center",
                    end: "bottom center",
                    onEnter: () => {
                        trackerText.textContent = sectionData[id].title;
                        if (trackerImage) {
                            trackerImage.setAttribute("href", sectionData[id].logo);
                            // Optional: Add a clipPath circle to the SVG image if needed, 
                            // but simpler to just switch the image for now.
                        }
                    },
                    onEnterBack: () => {
                        trackerText.textContent = sectionData[id].title;
                        if (trackerImage) {
                            trackerImage.setAttribute("href", sectionData[id].logo);
                        }
                    }
                });
            }
        });

        const pathLength = path.getTotalLength();
        path.style.strokeDasharray = pathLength;
        path.style.strokeDashoffset = pathLength;

        gsap.to(path, {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
                trigger: ".content-container",
                start: "top top",
                end: "bottom bottom",
                scrub: 1
            }
        });
    }

    window.addEventListener("load", forceResize);
    window.addEventListener("resize", () => {
        clearTimeout(window.resizedFinished);
        window.resizedFinished = setTimeout(resizePath, 250);
    });



    // Enhanced Directional Card Animation
    const sections = document.querySelectorAll(".company");
    sections.forEach(section => {
        const card = section.querySelector(".card");
        if (card) {
            let xVal = 0;
            let yVal = 0;

            if (section.classList.contains('left')) {
                xVal = -100; // Slide in from left
            } else if (section.classList.contains('right')) {
                xVal = 100; // Slide in from right
            } else {
                yVal = 50; // Slide up (default/centered)
            }

            gsap.from(card, {
                x: xVal,
                y: yVal,
                opacity: 0,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 75%",
                    toggleActions: "play none none reverse"
                }
            });
        }
    });

    // Intro Card Animation
    gsap.to(".group-companies-card", {
        x: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.5
    });

    // --- NEW: Scroll Indicator Fade Out ---
    gsap.to(".scroll-indicator", {
        scrollTrigger: {
            trigger: ".intro",
            start: "top top",
            end: "15% top", // Fade out quickly
            scrub: true
        },
        opacity: 0
    });

    // --- NEW: Dynamic Canvas Background ---
    initBackgroundSystem();

});

function initBackgroundSystem() {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];

    // Background State - Tweens will modify these values
    const bgState = {
        r: 13, g: 17, b: 23, // Initial Dark Blue (#0d1117)
        connectDistance: 100,
        particleSpeed: 0.5,
        particleCount: 60
    };

    // Resize
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initParticles();
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * bgState.particleSpeed;
            this.vy = (Math.random() - 0.5) * bgState.particleSpeed;
            this.size = Math.random() * 2 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Simple bounce
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }

        draw() {
            ctx.fillStyle = `rgba(${bgState.r + 40}, ${bgState.g + 40}, ${bgState.b + 40}, 0.5)`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        // Adjust particle count based on screen size
        const count = window.innerWidth < 768 ? 30 : bgState.particleCount;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        // Clear with semi-transparent rect for trail effect? Or opaque for clean?
        // Using Semi-Transparent color from state to let BG images show through
        ctx.clearRect(0, 0, width, height); // Clear first

        // Removed background color fill to let images show clearly
        // ctx.fillStyle = `rgba(...)`; 
        // ctx.fillRect(0, 0, width, height);

        particles.forEach((p, index) => {
            p.update();
            p.draw();

            // Connections
            for (let j = index + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < bgState.connectDistance) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255,255,255, ${0.1 - dist / bgState.connectDistance * 0.1})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        });

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();

    // --- GSAP ScrollTriggers to chang Colors ---
    // Define Color palettes per section id
    // RGB values
    const themes = {
        'intro': { r: 13, g: 17, b: 23 }, // Default Dark
        'pricol-limited': { r: 0, g: 40, b: 80 }, // Deep Blue
        'pricol-precision': { r: 50, g: 50, b: 60 }, // Tech Grey
        'pricol-engineering': { r: 60, g: 30, b: 10 }, // Industrial Brown/Orange tint
        'pricol-logistics': { r: 0, g: 50, b: 60 }, // Ocean Cyan/Blue
        'pricol-travel': { r: 20, g: 60, b: 30 }, // Nature Greenish
        'bluorb': { r: 10, g: 30, b: 60 }, // Deep Blue
        'pricol-gourmet': { r: 60, g: 10, b: 10 }, // Rich Red
        'pricol-retreats': { r: 20, g: 40, b: 20 },  // Forest
        'pricol-durapack': { r: 40, g: 40, b: 50 }, // Industrial Blue-Grey
        'pricol-logistics': { r: 30, g: 30, b: 40 }, // Logistics Grey
        'pricol-asia': { r: 50, g: 40, b: 20 }, // Gold/Earth
        'pricol-surya': { r: 60, g: 50, b: 20 }, // Solar Yellow/Orange
        'pricol-holdings-section': { r: 10, g: 20, b: 30 }, // Corporate Blue
        'footer': { r: 5, g: 5, b: 5 } // Dark footer fade
    };

    Object.keys(themes).forEach(id => {
        // Check for ID first, then class
        const section = document.getElementById(id) || document.querySelector(`.${id}`);
        if (section) {
            ScrollTrigger.create({
                trigger: section,
                start: "top center",
                end: "bottom center",
                onEnter: () => {
                    gsap.to(bgState, { ...themes[id], duration: 1 });
                    updateImage(id);
                },
                onEnterBack: () => {
                    gsap.to(bgState, { ...themes[id], duration: 1 });
                    updateImage(id);
                }
            });
        }
    });

    // --- NEW: Fade Out Path & Tracker at Footer ---
    ScrollTrigger.create({
        trigger: "#footer",
        start: "top 85%", // Trigger slightly before full view
        end: "bottom bottom",
        onEnter: () => {
            gsap.to("#path", { opacity: 0, duration: 0.5 });
            gsap.to("#tracker", { opacity: 0, duration: 0.5 });
            gsap.to("#tracker-text", { opacity: 0, duration: 0.5 });
        },
        onLeaveBack: () => {
            gsap.to("#path", { opacity: 1, duration: 0.5 });
            gsap.to("#tracker", { opacity: 1, duration: 0.5 });
            // text opacity is handled by section triggers, but we ensure container is visible
            gsap.to("#tracker-text", { opacity: 1, duration: 0.5 });
        }
    });

    function updateImage(id) {
        // Hide all images
        document.querySelectorAll('.bg-img').forEach(el => el.classList.remove('active'));

        let targetId = `bg-${id}`;
        const targetEl = document.getElementById(targetId);

        if (targetEl) {
            targetEl.classList.add('active');
        } else {
            console.warn(`Background image not found for id: ${targetId}`);
        }
    }

}
