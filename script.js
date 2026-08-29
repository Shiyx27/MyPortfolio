document.addEventListener("DOMContentLoaded", () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setupNav();
    setupReveal(prefersReducedMotion);
    setupFlipCards();
    setupLightbox();
    setupSmithChartBackdrop(prefersReducedMotion); 
    setupArchiveTelemetry(prefersReducedMotion);   
    setupCursorOrb(prefersReducedMotion);
});

/* --- CORE UI FUNCTIONS --- */

function setupNav() {
    const navToggle = document.getElementById("navToggle");
    const navLinks = document.getElementById("navLinks");
    if (!navToggle || !navLinks) return;

    navToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("open");
            navToggle.setAttribute("aria-expanded", "false");
        });
    });
}

function setupReveal(prefersReducedMotion) {
    const revealNodes = document.querySelectorAll(".reveal-fade-up");
    if (prefersReducedMotion) {
        revealNodes.forEach((node) => node.classList.add("active"));
        return;
    }
    const observer = new IntersectionObserver((entries, io) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.16, rootMargin: "0px 0px -40px 0px" });
    revealNodes.forEach((node) => observer.observe(node));
}

function setupFlipCards() {
    if (!window.matchMedia("(hover: none)").matches) return;
    const cards = document.querySelectorAll(".flip-card");
    cards.forEach((card) => {
        card.addEventListener("click", (event) => {
            if (event.target instanceof HTMLAnchorElement || event.target instanceof HTMLImageElement) return;
            card.classList.toggle("is-flipped");
        });
    });
}

function setupLightbox() {
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const lightboxClose = document.getElementById("lightboxClose");
    const triggers = document.querySelectorAll("[data-lightbox]");

    if (!lightbox || !lightboxImage || !lightboxClose) return;

    const close = () => {
        lightbox.classList.remove("show");
        lightbox.setAttribute("aria-hidden", "true");
        lightboxImage.setAttribute("src", "");
    };

    triggers.forEach((img) => {
        img.addEventListener("click", () => {
            const source = img.getAttribute("src");
            const alt = img.getAttribute("alt") || "Portfolio image";
            if (!source) return;
            lightboxImage.setAttribute("src", source);
            lightboxImage.setAttribute("alt", alt);
            lightbox.classList.add("show");
            lightbox.setAttribute("aria-hidden", "false");
        });
    });

    lightboxClose.addEventListener("click", close);
    lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) close();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && lightbox.classList.contains("show")) close();
    });
}

function setupCursorOrb(prefersReducedMotion) {
    if (prefersReducedMotion || window.matchMedia("(hover: none)").matches) return;
    const orb = document.getElementById("cursorOrb");
    if (!orb) return;

    let hasEntered = false;
    document.addEventListener("mousemove", (event) => {
        orb.style.left = `${event.clientX}px`;
        orb.style.top = `${event.clientY}px`;
        if (!hasEntered) {
            hasEntered = true;
            orb.style.opacity = "1";
            orb.style.transform = "translate(-50%, -50%) scale(1)";
        }
    });

    document.querySelectorAll("a, button, .flip-card, .archive-media-node").forEach((node) => {
        node.addEventListener("mouseenter", () => {
            orb.style.transform = "translate(-50%, -50%) scale(1.35)";
        });
        node.addEventListener("mouseleave", () => {
            orb.style.transform = "translate(-50%, -50%) scale(1)";
        });
    });
}

/* --- ARCHITECTURAL IMPLEMENTATIONS --- */

/**
 * setupArchiveTelemetry
 * Replaces legacy static elements with a high-performance vector line connecting 
 * the user's cursor to the hovered media node in the digital archive.
 */
function setupArchiveTelemetry(prefersReducedMotion) {
    if (prefersReducedMotion || window.matchMedia("(hover: none)").matches) return;

    const stage = document.getElementById("archiveStage");
    const nodes = document.querySelectorAll(".archive-media-node");
    const sparkLink = document.getElementById("dynamicSparkLink");
    const sparkNode = document.getElementById("cursorSparkNode");

    if (!stage || !sparkLink || !sparkNode || nodes.length === 0) return;

    let targetNode = null;
    let mouseX = 0;
    let mouseY = 0;
    let isHovering = false;
    let animationFrameId = null;

    // Decouple event listening from rendering pipeline
    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    nodes.forEach(node => {
        node.addEventListener("mouseenter", () => {
            targetNode = node;
            isHovering = true;
            sparkLink.style.opacity = "0.7";
            sparkNode.style.opacity = "1";
            
            if (!animationFrameId) {
                renderTelemetry();
            }
        });

        node.addEventListener("mouseleave", () => {
            isHovering = false;
            targetNode = null;
            sparkLink.style.opacity = "0";
            sparkNode.style.opacity = "0";
            
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        });
    });

    function renderTelemetry() {
        if (isHovering && targetNode) {
            const rect = targetNode.getBoundingClientRect();
            
            // Derive geometric center of the targeted node
            const nodeCenterX = rect.left + rect.width / 2;
            const nodeCenterY = rect.top + rect.height / 2;

            // Compute distance vector and rotation angle
            const dx = nodeCenterX - mouseX;
            const dy = nodeCenterY - mouseY;
            const width = Math.hypot(dx, dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);

            // Delegate positional updates to the GPU via transform property
            sparkLink.style.left = `${mouseX}px`;
            sparkLink.style.top = `${mouseY}px`;
            sparkLink.style.width = `${width}px`;
            sparkLink.style.transform = `rotate(${angle}deg)`;

            sparkNode.style.left = `${nodeCenterX}px`;
            sparkNode.style.top = `${nodeCenterY}px`;

            animationFrameId = requestAnimationFrame(renderTelemetry);
        }
    }
}

/**
 * setupSmithChartBackdrop
 * A mathematically rigorous implementation of the Smith Chart.
 * Maps impedance grids via conformal Möbius transformations directly to the HTML5 Canvas.
 */
function setupSmithChartBackdrop(prefersReducedMotion) {
    const canvas = document.getElementById("smithChartCanvas");
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let originX = 0;
    let originY = 0;
    let chartRadius = 0;

    const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        
        // Establish Canvas origin and bounds
        originX = width * 0.77;
        originY = height * 0.28;
        chartRadius = Math.min(width, height) * 0.35;
        
        if (prefersReducedMotion) draw(0);
    };

    const draw = (time) => {
        context.clearRect(0, 0, width, height);
        // Modulate line opacity rhythmically based on elapsed time
        const pulse = prefersReducedMotion ? 0 : (0.15 + 0.1 * Math.sin(time * 0.0005));

        context.save();
        
        // Establish primary unit circle clipping path for Reactance arcs
        context.beginPath();
        context.arc(originX, originY, chartRadius, 0, Math.PI * 2);
        context.clip();

        context.strokeStyle = `rgba(102, 222, 255, ${0.15 + pulse})`;
        context.lineWidth = 1;

        // Draw Constant Resistance (r) Circles
        // Mapped Coordinates: Center = (r/(r+1), 0), Radius = 1/(r+1)
        const resistanceVals = [0, 0.2, 0.5, 1, 2, 5, 10];
        resistanceVals.forEach(r => {
            const rRadius = chartRadius / (r + 1);
            const rCenterX = originX + (r / (r + 1)) * chartRadius;
            
            context.beginPath();
            context.arc(rCenterX, originY, rRadius, 0, Math.PI * 2);
            context.stroke();
        });

        // Draw Constant Reactance (x) Arcs
        // Mapped Coordinates: Center = (1, 1/x), Radius = 1/|x|
        const reactanceVals = [0.2, 0.5, 1, 2, 5, 10];
        reactanceVals.forEach(x => {
            const xRadius = chartRadius / x;
            
            // Inductive Reactance (Upper half, subtracting Y in canvas-space)
            context.beginPath();
            context.arc(originX + chartRadius, originY - xRadius, xRadius, 0, Math.PI * 2);
            context.stroke();
            
            // Capacitive Reactance (Lower half, adding Y in canvas-space)
            context.beginPath();
            context.arc(originX + chartRadius, originY + xRadius, xRadius, 0, Math.PI * 2);
            context.stroke();
        });

        context.restore();

        // Draw Outer Boundary and Real Resistance Axis
        context.strokeStyle = `rgba(102, 222, 255, ${0.4 + pulse})`;
        context.lineWidth = 1.2;
        context.beginPath();
        context.arc(originX, originY, chartRadius, 0, Math.PI * 2);
        context.stroke();

        context.strokeStyle = `rgba(212, 170, 88, ${0.3 + pulse * 0.5})`;
        context.beginPath();
        context.moveTo(originX - chartRadius, originY);
        context.lineTo(originX + chartRadius, originY);
        context.stroke();

        if (!prefersReducedMotion) {
            requestAnimationFrame(draw);
        }
    };

    window.addEventListener("resize", resize);
    resize();
    if (!prefersReducedMotion) {
        requestAnimationFrame(draw);
    }
}

// ==========================================
// CERTIFICATE TABS LOGIC
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.cert-tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 1. Remove 'active' class from all buttons and panels
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // 2. Add 'active' class to the clicked button
            btn.classList.add('active');

            // 3. Find the target panel via data-target and activate it
            const targetId = btn.getAttribute('data-target');
            const targetPanel = document.getElementById(targetId);
            
            if(targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
});