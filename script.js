// <!-- =========================================================
//      THREE.JS CDN
//      ========================================================= -->


(function() {
  'use strict';

  /* =======================================================
     HELPERS
     ======================================================= */
  const isMobile = window.innerWidth < 769;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  // Hex ↔ RGB helpers for color lerp
  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    return [parseInt(h.substring(0,2),16), parseInt(h.substring(2,4),16), parseInt(h.substring(4,6),16)];
  }
  function rgbToHex(r,g,b) {
    return '#' + [r,g,b].map(x => Math.round(clamp(x,0,255)).toString(16).padStart(2,'0')).join('');
  }
  function lerpColor(c1, c2, t) {
    const a = hexToRgb(c1), b = hexToRgb(c2);
    return rgbToHex(lerp(a[0],b[0],t), lerp(a[1],b[1],t), lerp(a[2],b[2],t));
  }

  // Multi-stop color lerp
  const accentStops = [
    { pos: 0,    color: '#C4788A' },
    { pos: 0.25, color: '#C9A84C' },
    { pos: 0.50, color: '#5B6B7C' },
    { pos: 0.75, color: '#C4788A' },
    { pos: 1.00, color: '#C9A84C' }
  ];
  function getAccentColor(pct) {
    const t = clamp(pct, 0, 1);
    for (let i = 0; i < accentStops.length - 1; i++) {
      if (t >= accentStops[i].pos && t <= accentStops[i+1].pos) {
        const local = (t - accentStops[i].pos) / (accentStops[i+1].pos - accentStops[i].pos);
        return lerpColor(accentStops[i].color, accentStops[i+1].color, local);
      }
    }
    return accentStops[accentStops.length - 1].color;
  }

  /* =======================================================
     CUSTOM CURSOR
     ======================================================= */
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let ringX = mouseX, ringY = mouseY;

  if (!isMobile) {
    document.addEventListener('mousemove', e => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    });
    // Hover enlarge
    document.querySelectorAll('a, button, .project-card, .hack-card, .skill-card').forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
    });
    // Ring follow with lag
    function animateCursor() {
      ringX = lerp(ringX, mouseX, 0.15);
      ringY = lerp(ringY, mouseY, 0.15);
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();
  }

  /* =======================================================
     SCROLL-DRIVEN ACCENT COLOR
     ======================================================= */
  function updateAccent() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? scrollTop / docHeight : 0;
    const accent = getAccentColor(pct);
    document.documentElement.style.setProperty('--accent', accent);
  }

  /* =======================================================
     HERO 3D PARALLAX TILT
     ======================================================= */
  const heroName = document.getElementById('heroName');
  const heroDivider = document.getElementById('heroDivider');
  const heroSubtitle = document.getElementById('heroSubtitle');

  function updateHeroParallax() {
    const sy = window.scrollY;
    if (!isMobile) {
      const rotateX = clamp(sy * 0.04, 0, 20);
      const translateY = sy * 0.5;
      const scale = clamp(1 - sy * 0.0008, 0.6, 1);
      const spacing = 0.05 + (sy * 0.0004);
      heroName.style.transform =
        `perspective(1200px) rotateX(${rotateX}deg) translateY(-${translateY}px) scale(${scale})`;
      heroName.style.letterSpacing = Math.min(spacing, 0.3) + 'em';
    }
    // Subtitle parallax at 30% speed
    const subY = sy * 0.3;
    heroSubtitle.style.transform = `translateY(-${subY}px)`;
    // Divider stretches from 60% → 100%
    const divW = clamp(60 + (sy * 0.08), 60, 100);
    heroDivider.style.width = divW + '%';
  }

  /* =======================================================
     ABOUT TIMELINE FILL
     ======================================================= */
  function updateTimeline() {
    const aboutEl = document.getElementById('about');
    if (!aboutEl) return;
    const rect = aboutEl.getBoundingClientRect();
    const sectionH = aboutEl.offsetHeight;
    const progress = clamp((-rect.top) / (sectionH - window.innerHeight), 0, 1);
    const fill = document.getElementById('timelineFill');
    if (fill) fill.style.height = (progress * 100) + '%';
  }

  /* =======================================================
     GLOBAL SCROLL HANDLER
     ======================================================= */
  function onScroll() {
    updateAccent();
    updateHeroParallax();
    updateTimeline();
    // Nav shadow
    document.getElementById('mainNav').classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* =======================================================
     INTERSECTION OBSERVER — ANIMATE ON ENTER & EXIT
     Animations replay every time you scroll up/down
     ======================================================= */
  // About paragraphs — line by line
  const aboutParagraphs = document.querySelectorAll('#aboutContent p');
  const aboutObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); }
      else { e.target.classList.remove('visible'); }
    });
  }, { threshold: 0.3 });
  aboutParagraphs.forEach((p, i) => {
    p.style.transitionDelay = (i * 0.15) + 's';
    aboutObs.observe(p);
  });

  // Skill card flip
  const skillCards = document.querySelectorAll('.skill-card');
  const skillObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('flipped'); }
      else { e.target.classList.remove('flipped'); }
    });
  }, { threshold: 0.2 });
  skillCards.forEach((c, i) => {
    c.querySelector('.skill-card-inner').style.transitionDelay = (i * 0.08) + 's';
    skillObs.observe(c);
  });

  // Project cards
  const projectCards = document.querySelectorAll('.project-card');
  const projObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); }
      else { e.target.classList.remove('visible'); }
    });
  }, { threshold: 0.15 });
  projectCards.forEach((c, i) => {
    c.style.transitionDelay = (i * 0.12) + 's';
    projObs.observe(c);
  });

  // Hackathon cards
  const hackCards = document.querySelectorAll('.hack-card');
  const hackObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); }
      else { e.target.classList.remove('visible'); }
    });
  }, { threshold: 0.2 });
  hackCards.forEach((c, i) => {
    c.style.transitionDelay = (i * 0.18) + 's';
    hackObs.observe(c);
  });

  // Hero name — letter-by-letter entrance animation (grouped by word)
  const heroNameEl = document.getElementById('heroName');
  const heroWords = ['ADITYA', 'DUGAR'];
  let letterIndex = 0;
  heroWords.forEach(word => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'hero-word';
    word.split('').forEach(char => {
      const span = document.createElement('span');
      span.className = 'hero-letter';
      span.textContent = char;
      span.style.transitionDelay = (letterIndex * 0.07) + 's';
      wordSpan.appendChild(span);
      letterIndex++;
    });
    heroNameEl.appendChild(wordSpan);
  });
  const heroObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('animated'); }
      else { e.target.classList.remove('animated'); }
    });
  }, { threshold: 0.3 });
  heroObs.observe(heroNameEl);

  // Contact section — all elements animate in/out
  const contactAnimEls = document.querySelectorAll('.contact-title, .contact-ornament, .contact-links a, .contact-cta');
  const contactObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); }
      else { e.target.classList.remove('visible'); }
    });
  }, { threshold: 0.15 });
  contactAnimEls.forEach((el, i) => {
    el.style.transitionDelay = (i * 0.1) + 's';
    contactObs.observe(el);
  });

  /* =======================================================
     MOBILE MENU TOGGLE
     ======================================================= */
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  /* =======================================================
     THREE.JS 3D BACKGROUND SCENE
     ======================================================= */
  const canvas = document.getElementById('three-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xFAF7F4, 0.4);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xC9A84C, 0.8, 200);
  pointLight.position.set(10, 10, 15);
  scene.add(pointLight);

  // Color palette for shapes
  const shapeColors = [
    0xC4788A, 0xC4788A, 0xC4788A,           // 30% rose
    0xC9A84C, 0xC9A84C, 0xC9A84C, 0xC9A84C, // 40% gold
    0x5B6B7C, 0x5B6B7C, 0x5B6B7C            // 30% slate
  ];

  const group = new THREE.Group();
  const meshes = [];
  const shapeCount = isMobile ? 20 : 60;

  for (let i = 0; i < shapeCount; i++) {
    let geometry;
    const geoType = i % 3;
    if (geoType === 0) geometry = new THREE.TorusGeometry(0.6 + Math.random()*0.8, 0.15 + Math.random()*0.1, 8, 16);
    else if (geoType === 1) geometry = new THREE.OctahedronGeometry(0.5 + Math.random()*0.7, 0);
    else geometry = new THREE.TetrahedronGeometry(0.5 + Math.random()*0.6, 0);

    const material = new THREE.MeshPhongMaterial({
      color: shapeColors[i % shapeColors.length],
      wireframe: true,
      transparent: true,
      opacity: 0.35 + Math.random() * 0.3
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      (Math.random() - 0.5) * 50,
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 30
    );
    mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
    mesh.userData = {
      speedX: (Math.random() - 0.5) * 0.008,
      speedY: (Math.random() - 0.5) * 0.008,
      speedZ: (Math.random() - 0.5) * 0.006,
      floatOffset: Math.random() * Math.PI * 2,
      floatSpeed: 0.3 + Math.random() * 0.5,
      floatAmp: 0.3 + Math.random() * 0.7,
      origY: mesh.position.y
    };
    meshes.push(mesh);
    group.add(mesh);
  }
  scene.add(group);

  // Mouse tracking for subtle rotation
  let sceneMX = 0, sceneMY = 0;
  if (!isMobile) {
    document.addEventListener('mousemove', e => {
      sceneMX = (e.clientX - window.innerWidth / 2);
      sceneMY = (e.clientY - window.innerHeight / 2);
    });
  }

  // Check if we're in a dark section for ambient boost
  const darkSections = document.querySelectorAll('.section-dark');
  function isInDarkSection() {
    const cy = window.innerHeight / 2;
    for (const sec of darkSections) {
      const r = sec.getBoundingClientRect();
      if (r.top < cy && r.bottom > cy) return true;
    }
    return false;
  }

  // Animation loop
  const baseCamZ = 30;
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    const sy = window.scrollY;

    // Idle floating
    meshes.forEach(m => {
      m.rotation.x += m.userData.speedX;
      m.rotation.y += m.userData.speedY;
      m.rotation.z += m.userData.speedZ;
      m.position.y = m.userData.origY +
        Math.sin(t * m.userData.floatSpeed + m.userData.floatOffset) * m.userData.floatAmp;
    });

    // Scroll-driven scene rotation and camera zoom
    group.rotation.y = sy * 0.001;
    group.rotation.x = sy * 0.0003;
    camera.position.z = baseCamZ - sy * 0.005;

    // Mouse-driven subtle rotation
    group.rotation.y += sceneMX * 0.0003 * 0.016;
    group.rotation.x += sceneMY * 0.0003 * 0.016;

    // Orbiting point light
    pointLight.position.x = Math.sin(t * 0.3) * 18;
    pointLight.position.y = Math.cos(t * 0.2) * 12;

    // Ambient light boost on dark sections
    ambientLight.intensity = isInDarkSection() ? 0.7 : 0.4;

    renderer.render(scene, camera);
  }
  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

})();
