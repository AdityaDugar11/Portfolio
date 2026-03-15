// <!-- ════════════════════════════════════════════════════
//        JAVASCRIPT
//   ════════════════════════════════════════════════════ -->
  
    // ─── Hero Letter Stagger ───
    (function () {
      const name = 'ADITYA DUGAR';
      const el = document.getElementById('heroName');
      name.split('').forEach(function (char, i) {
        const span = document.createElement('span');
        span.className = 'letter';
        if (char === ' ') {
          span.innerHTML = '&nbsp;';
          span.style.width = '0.3em';
        } else {
          span.textContent = char;
        }
        span.style.animationDelay = (0.15 + i * 0.1) + 's';
        el.appendChild(span);
      });
    })();

    // ─── Custom Cursor ───
    (function () {
      if (window.innerWidth <= 768) return;

      const dot = document.getElementById('cursorDot');
      const ring = document.getElementById('cursorRing');
      let mouseX = 0, mouseY = 0;
      let ringX = 0, ringY = 0;

      document.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
      });

      function animateRing() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
        requestAnimationFrame(animateRing);
      }
      animateRing();

      // Hover effect on interactive elements
      var interactives = document.querySelectorAll('a, button, .project-card, .hackathon-card, .skill-pill, .cta-button');
      interactives.forEach(function (el) {
        el.addEventListener('mouseenter', function () {
          dot.classList.add('hovering');
          ring.classList.add('hovering');
        });
        el.addEventListener('mouseleave', function () {
          dot.classList.remove('hovering');
          ring.classList.remove('hovering');
        });
      });
    })();

    // ─── Scroll Animations via IntersectionObserver ───
    (function () {
      var revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .about-para');

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, {
        threshold: 0.15,
        rootMargin: '0px 0px -60px 0px'
      });

      revealElements.forEach(function (el) {
        observer.observe(el);
      });

      // Stagger groups
      var staggerGroups = document.querySelectorAll('.stagger');
      var staggerObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, {
        threshold: 0.2,
        rootMargin: '0px 0px -40px 0px'
      });

      staggerGroups.forEach(function (el) {
        staggerObserver.observe(el);
      });
    })();

    // ─── Navbar Scroll Effect ───
    (function () {
      var nav = document.getElementById('navBar');
      var scrollThreshold = 100;

      window.addEventListener('scroll', function () {
        if (window.scrollY > scrollThreshold) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
      }, { passive: true });
    })();