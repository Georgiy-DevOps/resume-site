/* Логика страницы. Вынесена из index.html, чтобы CSP разрешал только script-src 'self'. */
(function(){
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Scroll reveal */
  if (!reducedMotion) {
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function(el) { obs.observe(el); });

    /* Typewriter effect on hero subtitle */
    var heroSub = document.querySelector('.hero-sub');
    if (heroSub) {
      var fullText = heroSub.textContent;
      heroSub.textContent = '';
      var cursor = document.createElement('span');
      cursor.className = 'typewriter-cursor';
      heroSub.appendChild(cursor);
      var twObs = new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting) {
          twObs.unobserve(heroSub);
          var i = 0;
          function typeNext() {
            if (i < fullText.length) {
              heroSub.insertBefore(document.createTextNode(fullText[i]), cursor);
              i++;
              setTimeout(typeNext, 40 + Math.random() * 30);
            } else {
              setTimeout(function() { cursor.style.display = 'none'; }, 2000);
            }
          }
          typeNext();
        }
      }, { threshold: 0.5 });
      twObs.observe(heroSub);
    }

    /* Timeline dot pulse */
    var dotObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          var dot = e.target.querySelector('.timeline-dot');
          if (dot) dot.classList.add('pulse');
          dotObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('.timeline-item').forEach(function(el) { dotObs.observe(el); });
  }

  /* Animated number counters */
  var counterObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      var raw = el.getAttribute('data-target');
      var prefix = raw.match(/^[^0-9]*/)[0] || '';
      var suffix = raw.match(/[^0-9]*$/)[0] || '';
      var num = parseFloat(raw.replace(/[^0-9.]/g, ''));
      if (isNaN(num)) { el.textContent = raw; counterObs.unobserve(el); return; }
      var isFloat = raw.indexOf('.') !== -1;
      var duration = 1200;
      var start = performance.now();
      function tick(now) {
        var progress = Math.min((now - start) / duration, 1);
        var ease = 1 - Math.pow(1 - progress, 3);
        var current = ease * num;
        el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.round(current)) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.achievement-num[data-target]').forEach(function(el) {
    el.textContent = '0';
    counterObs.observe(el);
  });

  /* Clickable skill tags → highlight matching experience & projects */
  var hint = document.getElementById('stackHint');
  var hintText = { ru: 'Нажми на навык — покажу где он используется ↓', en: 'Click a skill to see where it’s used ↓' };
  var hintFound = { ru: 'Найдено: ', en: 'Found: ' };
  var hintReset = { ru: ' — кликни ещё раз чтобы сбросить', en: ' — click again to reset' };
  var hintNone = { ru: 'Не найдено совпадений', en: 'No matches found' };
  function getL() { return currentLang || 'ru'; }
  if (hint) hint.textContent = hintText[getL()];
  var activeTag = null;
  var targets = document.querySelectorAll('.timeline-item[data-tags], .project-showcase[data-tags], .project-card[data-tags]');
  document.querySelectorAll('.skill-tag').forEach(function(tag) {
    tag.addEventListener('click', function() {
      var name = tag.textContent.trim().toLowerCase();
      if (activeTag === tag) {
        tag.classList.remove('active-tag');
        activeTag = null;
        targets.forEach(function(t) { t.classList.remove('highlight', 'dimmed-item'); });
        if (hint) hint.textContent = hintText[getL()];
        return;
      }
      if (activeTag) activeTag.classList.remove('active-tag');
      tag.classList.add('active-tag');
      activeTag = tag;
      var found = 0;
      targets.forEach(function(t) {
        var tags = (t.getAttribute('data-tags') || '').split(',');
        var match = tags.some(function(x) { return x.trim() === name; });
        t.classList.toggle('highlight', match);
        t.classList.toggle('dimmed-item', !match);
        if (match) found++;
      });
      if (hint) hint.textContent = found ? hintFound[getL()] + found + hintReset[getL()] : hintNone[getL()];
      var first = document.querySelector('.timeline-item.highlight, .project-showcase.highlight, .project-card.highlight');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  /* Scroll progress bar */
  var prog = document.getElementById('scrollProgress');
  window.addEventListener('scroll', function() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (h > 0) prog.style.width = (window.scrollY / h * 100) + '%';
  }, { passive: true });

  /* Anchor nav: show after hero, highlight active section */
  var anchorNav = document.getElementById('anchorNav');
  var sections = document.querySelectorAll('.section[id]');
  var anchorLinks = document.querySelectorAll('.anchor-link');
  var heroEl = document.querySelector('.hero');

  function updateNav() {
    var scrollY = window.scrollY;
    var heroBottom = heroEl ? heroEl.offsetTop + heroEl.offsetHeight : 400;
    if (scrollY > heroBottom - 200) {
      anchorNav.classList.add('visible');
    } else {
      anchorNav.classList.remove('visible');
    }
    var current = '';
    sections.forEach(function(s) {
      if (scrollY >= s.offsetTop - 200) current = s.id;
    });
    anchorLinks.forEach(function(a) {
      if (a.getAttribute('href') === '#' + current) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* Theme toggle */
  var btn = document.getElementById('themeToggle');
  var icon = document.getElementById('themeIcon');
  function getEffective() {
    var dt = document.documentElement.getAttribute('data-theme');
    if (dt) return dt;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  function updateIcon() {
    icon.innerHTML = getEffective() === 'dark' ? '&#9788;' : '&#9790;';
  }
  updateIcon();
  btn.addEventListener('click', function() {
    var next = getEffective() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch(e) {}
    updateIcon();
  });
  try {
    var saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      document.documentElement.setAttribute('data-theme', saved);
      updateIcon();
    }
  } catch(e) {}

  /* Print / PDF button */
  document.getElementById('printBtn').addEventListener('click', function() {
    window.print();
  });

  /* Language toggle RU/EN */
  var i18n = {
    en: {
      'hero-eyebrow': 'DevOps → DevSecOps / Moscow',
      'hero-name': 'Georgiy',
      'pillar-1': 'Infrastructure',
      'pillar-2': 'Security',
      'pillar-3': 'Automation',
      'hero-sub': 'Security built into the pipeline, not bolted on at the end.',
      'c-phone': 'Phone',
      'copied': 'Copied',
      's-about': 'About',
      's-stack': 'Stack',
      's-exp': 'Experience',
      's-ach': 'Achievements',
      's-proj': 'Projects',
      's-edu': 'Education',
      's-lang': 'Languages',
      's-cta': 'How I can help',
      'a1': 'Production servers managed',
      'a2': 'Monitoring services in the stack',
      'a3': 'Security tools in the Aegis Arena CI pipeline',
      'a4': 'Vulnerabilities found and fixed in my own backend',
      't1-date': 'September 2026 — present',
      't2-date': 'October 2026 — present',
      'ss-client': 'Customer Portal',
      'ss-admin': 'Admin Dashboard',
      'ss-beszel': 'Beszel — server 130-ByteDepp monitoring',
      't2-role': 'Systems Engineer',
      'p1-desc': 'ByteDepp vehicle management panel: VIN-to-device binding, customer portal with service booking, admin dashboard with logs, CSRF protection, SQLite, Docker, CI/CD.',
      'p1-private': 'private repo, demo on request',
      'p2-desc': 'Full observability stack for 3 production servers: metrics, logs, Telegram alerts. Beszel as lightweight monitoring hub, Grafana + Prometheus for deep analytics, Loki + Alloy for centralized logs, Alertmanager for notifications.',
      'p3-desc': 'Multiplayer game backend with a DevSecOps pipeline: Gitleaks, Semgrep, CodeQL, pip-audit, Trivy and OWASP ZAP on every PR, the build fails on HIGH/CRITICAL. Server-side score validation (anti-cheat), JWT, abuse-case regression tests, threat model.',
      'p4-type': 'Thesis Project / Unity HDRP',
      'p4-desc': '3D first-person survival game. Quest system, object interaction, day/night cycle, FPS controller on Input System, lightmapping, procedural forest.',
      'p5-desc': 'SIM configuration patching for Zeekr 9X and Lynk&Co 900 telematics modules for Russian carriers. RIL patching, APN, backup/restore.',
      'p6-desc': 'Telegram bot for daily planning with web interface. Schedule, tasks, reminders.',
      'p7-desc': 'Deployed Frappe CRM on a dedicated server: installed and configured MariaDB, Redis, Nginx, bench CLI. Full cycle from environment setup to production launch.',
      'edu-name': 'Moscow Polytechnic University',
      'edu-fac': 'Software Engineering for Game Industry',
      'lang-ru': 'Native',
      'cta-1': 'Embed security checks into CI/CD: SAST, SCA, image scanning and DAST with a clear quality gate',
      'cta-2': 'Harden Linux servers and containers: SSH, systemd service sandboxing, firewall, auditing',
      'cta-3': 'Set up monitoring and alerting so you hear about problems before your users do',
      'cta-4': 'Build backups that actually restore, with regular automated verification',
      'cta-5': 'Investigate an incident from logs and write the postmortem and runbook',
      'cta-6': 'Automate routine work with Python, Bash and Go',
      'cta-7': 'Set up secure remote access to embedded devices via SSH tunnels',
      'footer-loc': 'Moscow, 2026',
      'footer-status': 'Open to opportunities',
      'stack-hint': 'Click a skill to see where it’s used ↓'
    },
    ru: {
      'hero-eyebrow': 'DevOps → DevSecOps / Москва',
      'hero-name': 'Георгий',
      'pillar-1': 'Инфраструктура',
      'pillar-2': 'Безопасность',
      'pillar-3': 'Автоматизация',
      'hero-sub': 'Безопасность встроена в пайплайн, а не прикручена в конце.',
      'c-phone': 'Телефон',
      'copied': 'Скопировано',
      's-about': 'О себе',
      's-stack': 'Стек',
      's-exp': 'Опыт',
      's-ach': 'Достижения',
      's-proj': 'Проекты',
      's-edu': 'Образование',
      's-lang': 'Языки',
      's-cta': 'Чем могу быть полезен',
      'stack-hint': 'Нажми на навык — покажу где он используется ↓'
    }
  };
  var i18nHtml = {
    en: {
      'about-text': 'DevOps engineer focused on <strong>infrastructure and CI/CD security</strong>. Since September 2026 I run production servers: SSH and systemd service hardening, auditd, fail2ban, encrypted restic backups with automated restore checks, monitoring with Grafana, Prometheus and Loki. In my Aegis Arena project I built a <strong>DevSecOps pipeline</strong> (SAST, SCA, container scanning, DAST) and fixed the vulnerabilities it surfaced. I also work with <strong>automotive embedded systems</strong>: Qualcomm head units, telematics, ADB diagnostics. 4th-year student at Moscow Polytechnic University (software engineering for the game industry). Aiming for a DevSecOps / Security Engineer role.',
      't1-desc': '<ul><li>Running 3 production Ubuntu/Debian servers: kernel updates, log-based incident analysis (RCA of a server hang during reboot)</li><li>Monitoring stack of 6 services (Grafana, Prometheus, Loki, Alloy, Alertmanager, Beszel) with Telegram alerts</li><li>Hardening: key-only SSH, fail2ban with escalating bans via nftables, systemd service sandboxing, auditd on SSH/sudo/firewall changes, unattended-upgrades</li><li>Telegram alerts on every successful root SSH login: source IP, auth method, key fingerprint</li><li>Encrypted daily restic backups to an offsite server with automated restore verification of SQLite databases (integrity_check, SHA-256 match)</li><li>Fixed OOM on a 4 GB monitoring server: container limits and swap, memory usage down 40%</li><li>TCAM SIM Patch Tool: Zeekr 9X / Lynk&amp;Co telematics patching, operation time cut from 2 h to 15 min</li></ul>',
      't2-desc': '<ul><li>Zeekr diagnostic equipment — ZDS, VBF, security certificate configuration for 10+ vehicles</li><li>ADB access to SA8295 head units (Android 12) — localization and configuration, 20+ devices serviced</li><li>Deployed Frappe CRM on a dedicated server — configured MariaDB, Redis, Nginx, full cycle from installation to production</li><li>Developed SSH tunnels for remote diagnostics of vehicle systems without on-site visits</li></ul>'
    },
    ru: {
      'about-text': 'DevOps-инженер с фокусом на <strong>безопасность инфраструктуры и CI/CD</strong>. С сентября 2026 сопровождаю продакшн-серверы: hardening SSH и systemd-сервисов, auditd, fail2ban, зашифрованные бэкапы restic с автоматической проверкой восстановления, мониторинг на Grafana, Prometheus и Loki. В своём проекте Aegis Arena построил <strong>DevSecOps-пайплайн</strong> (SAST, SCA, сканирование контейнеров, DAST) и закрыл найденные им уязвимости. Работаю с <strong>автомобильными embedded-системами</strong>: головные устройства Qualcomm, телематика, диагностика через ADB. Студент 4-го курса Московского Политеха (программное обеспечение игровой индустрии). Цель — роль DevSecOps / Security Engineer.',
      't1-desc': '<ul><li>Сопровождение 3 продакшн-серверов Ubuntu/Debian: обновления ядра, разбор инцидентов по журналам (RCA зависания сервера при перезагрузке)</li><li>Стек мониторинга из 6 сервисов (Grafana, Prometheus, Loki, Alloy, Alertmanager, Beszel) с алертами в Telegram</li><li>Hardening: SSH только по ключам, fail2ban с эскалацией банов через nftables, изоляция systemd-сервисов, auditd на изменения SSH/sudo/фаервола, unattended-upgrades</li><li>Telegram-алерты на каждый успешный root-вход по SSH: IP источника, метод аутентификации, отпечаток ключа</li><li>Зашифрованные ежедневные бэкапы restic на офсайт-сервер с автоматической проверкой восстановления SQLite-баз (integrity_check, сверка SHA-256)</li><li>Устранение OOM на сервере мониторинга (4 ГБ RAM): лимиты контейнеров и swap, потребление памяти снижено на 40%</li><li>TCAM SIM Patch Tool: патчинг телематики Zeekr 9X / Lynk&amp;Co, операция сократилась с 2 ч до 15 мин</li></ul>',
      't2-desc': '<ul><li>Диагностическое оборудование Zeekr — настройка ЗДС, VBF, сертификатов безопасности для 10+ автомобилей</li><li>ADB-доступ к головным устройствам SA8295 (Android 12) — русификация и конфигурация, обслужено 20+ устройств</li><li>Развёртывание Frappe CRM на выделенном сервере — настройка MariaDB, Redis, Nginx, полный цикл от установки до продакшна</li><li>SSH-туннели для удалённой диагностики автомобильных систем без выезда к машине</li></ul>'
    }
  };
  var currentLang = 'ru';
  var langLabel = document.getElementById('langLabel');
  var langBtn = document.getElementById('langToggle');

  function applyLang(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      if (i18n[lang] && i18n[lang][key]) el.textContent = i18n[lang][key];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-html');
      if (i18nHtml[lang] && i18nHtml[lang][key]) el.innerHTML = i18nHtml[lang][key];
    });
    langLabel.textContent = lang === 'ru' ? 'EN' : 'RU';
    document.documentElement.setAttribute('lang', lang);
    try { localStorage.setItem('lang', lang); } catch(e) {}
  }

  langBtn.addEventListener('click', function() {
    applyLang(currentLang === 'ru' ? 'en' : 'ru');
  });

  try {
    var savedLang = localStorage.getItem('lang');
    if (savedLang === 'en') applyLang('en');
  } catch(e) {}

  /* Click-to-copy contacts */
  document.querySelectorAll('[data-copy]').forEach(function(el) {
    el.addEventListener('click', function() {
      var val = el.getAttribute('data-copy');
      var toast = el.querySelector('.copy-toast');
      try {
        navigator.clipboard.writeText(val).then(function() {
          if (toast) { toast.classList.add('show'); setTimeout(function(){ toast.classList.remove('show'); }, 1500); }
        }).catch(function() {
          fallbackSelect(el);
        });
      } catch(e) {
        fallbackSelect(el);
      }
    });
    el.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
    });
  });
  function fallbackSelect(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
})();
