/* Imersão Balance Pro — LP Tráfego Pago | Sano Lab */

(function () {
  'use strict';

  /* ── FAQ accordion ── */
  document.querySelectorAll('.im-faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.im-faq-item');
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.im-faq-item.open').forEach(function (el) {
        el.classList.remove('open');
        el.querySelector('.im-faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ── Máscara de telefone (com correção do código de país 55) ── */
  function soDigitos(s) { return (s || '').replace(/\D/g, ''); }

  // Normaliza número BR removendo lixo de prefixo:
  //  - 0 de operadora / 00 internacional na frente (ex.: 011, 0021)
  //  - código do país 55 quando veio junto (12+ dígitos começando em 55)
  // Mantém DDD 55 real (11 díg. começando em 55, ex.: Santa Maria/RS).
  function normalizarTelBR(digits) {
    digits = digits.replace(/^0+/, '');                       // 0 (operadora) / 00 (intl)
    if (digits.length >= 12 && digits.slice(0, 2) === '55') { // código do país 55
      digits = digits.slice(2);
    }
    digits = digits.replace(/^0+/, '');                       // 0 do DDD, se ainda restou
    return digits.slice(0, 11);
  }

  function formatarTelBR(digits) {
    if (digits.length <= 10) {
      return digits.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    }
    return digits.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
  }

  function maskPhone(input) {
    input.addEventListener('input', function () {
      input.value = formatarTelBR(normalizarTelBR(soDigitos(input.value)));
    });
  }
  document.querySelectorAll('input[name="whatsapp"]').forEach(maskPhone);

  /* ── Validação inline (blur) ── */
  var messages = {
    nome:      'Informe seu nome completo.',
    whatsapp:  'Informe um WhatsApp válido com DDD.',
    email:     'Informe um e-mail válido.',
    profissao: 'Selecione sua área de atuação.'
  };

  function validateField(field) {
    var name    = field.name;
    var value   = field.value.trim();
    var errorEl = field.closest('.im-field').querySelector('.im-field-error');
    var msg     = '';

    if (!value) {
      msg = messages[name] || 'Campo obrigatório.';
    } else if (name === 'whatsapp') {
      var digits = value.replace(/\D/g, '');
      if (digits.length < 10) msg = 'WhatsApp inválido. Inclua DDD.';
    } else if (name === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) msg = 'E-mail inválido.';
    }

    if (msg) {
      field.classList.add('is-invalid');
      field.classList.remove('is-valid');
      if (errorEl) errorEl.textContent = msg;
      return false;
    } else {
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
      if (errorEl) errorEl.textContent = '';
      return true;
    }
  }

  document.querySelectorAll('.im-form [required]').forEach(function (field) {
    field.addEventListener('blur', function () { validateField(field); });
    field.addEventListener('input', function () {
      if (field.classList.contains('is-invalid')) validateField(field);
    });
  });

  /* ── Submissão dos formulários ── */
  var SHEETS_URL = 'https://script.google.com/macros/s/AKfycbx56vtWNFeiEx_BEMj_7QOK2k-NKDo27RVwR_n9Uc-oH3AYXn4VSRkMgt1yMRP4FCpL/exec';

  function handleSubmit(form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var fields = Array.from(form.querySelectorAll('[required]'));
      var allOk  = fields.map(validateField).every(Boolean);
      if (!allOk) {
        var first = form.querySelector('.is-invalid');
        if (first) first.focus();
        return;
      }

      var btn = form.querySelector('[type="submit"]');
      if (btn) btn.disabled = true;

      var data = {
        nome:      (form.querySelector('[name="nome"]')      || {}).value || '',
        whatsapp:  formatarTelBR(normalizarTelBR(soDigitos((form.querySelector('[name="whatsapp"]') || {}).value))),
        email:     (form.querySelector('[name="email"]')     || {}).value || '',
        profissao: (form.querySelector('[name="profissao"]') || {}).value || ''
      };

      // ── Lead (Meta) com eventID — pronto pra deduplicar com a CAPI no futuro ──
      var eventId = 'lead-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
      if (typeof fbq === 'function') {
        fbq('track', 'Lead', {}, { eventID: eventId });
      }

      // ── Registro na planilha BLINDADO: só redireciona quando o envio terminar ──
      // (antes, o redirect em 400ms podia CANCELAR o envio e perder o lead)
      var redirected = false;
      function irParaObrigado() {
        if (redirected) return;
        redirected = true;
        window.location.href = 'obrigado.html';
      }
      var pixel = new Image();
      pixel.onload = irParaObrigado;
      pixel.onerror = irParaObrigado;
      pixel.src = SHEETS_URL + '?' + new URLSearchParams(data).toString();
      // rede de segurança: redireciona mesmo se a planilha demorar
      setTimeout(irParaObrigado, 2500);
    });
  }

  var form1 = document.getElementById('imersao-form');
  var form2 = document.getElementById('imersao-form-2');

  if (form1) handleSubmit(form1);
  if (form2) handleSubmit(form2);

  /* ── Cronômetro regressivo — 16 de junho de 2026 ── */
  (function () {
    var target = new Date('2026-06-16T00:00:00');
    var days  = document.getElementById('cd-days');
    var hours = document.getElementById('cd-hours');
    var mins  = document.getElementById('cd-mins');
    var secs  = document.getElementById('cd-secs');
    if (!days) return;

    function pad(n) { return String(n).padStart(2, '0'); }

    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        days.textContent = hours.textContent = mins.textContent = secs.textContent = '00';
        return;
      }
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000)  / 60000);
      var s = Math.floor((diff % 60000)    / 1000);
      days.textContent  = pad(d);
      hours.textContent = pad(h);
      mins.textContent  = pad(m);
      secs.textContent  = pad(s);
    }

    tick();
    setInterval(tick, 1000);
  }());

  /* ── Carrossel infinito de depoimentos (mobile only) ── */
  (function () {
    if (!window.matchMedia('(max-width: 768px)').matches) return;
    var grid = document.querySelector('.im-depos-grid');
    if (!grid) return;

    var originals = Array.from(grid.querySelectorAll('img'));
    var n = originals.length;
    if (n < 2) return;

    /* Wrapper para as setinhas */
    var wrap = document.createElement('div');
    wrap.className = 'im-depos-wrap';
    grid.parentNode.insertBefore(wrap, grid);
    wrap.appendChild(grid);

    for (var i = n - 1; i >= 0; i--) {
      grid.insertBefore(originals[i].cloneNode(true), grid.firstChild);
    }
    for (var j = 0; j < n; j++) {
      grid.appendChild(originals[j].cloneNode(true));
    }

    function itemWidth() {
      var img = grid.querySelector('img');
      return img ? img.offsetWidth + 10 : 0;
    }

    grid.scrollLeft = n * itemWidth();

    function reposition() {
      var iw   = itemWidth();
      var setW = n * iw;
      var sl   = grid.scrollLeft;
      if (sl < setW)           grid.scrollLeft = sl + setW;
      else if (sl >= 2 * setW) grid.scrollLeft = sl - setW;
    }

    if ('onscrollend' in window) {
      grid.addEventListener('scrollend', reposition);
    } else {
      var t;
      grid.addEventListener('scroll', function () {
        clearTimeout(t);
        t = setTimeout(reposition, 150);
      });
    }
  }());

  /* ── Smooth scroll para âncoras internas ── */
  document.querySelectorAll('a[href="#form-topo"], a[href="#inscricao"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var href   = link.getAttribute('href').replace('#', '');
      var target = document.getElementById(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(function () {
          var firstInput = target.querySelector('input, select');
          if (firstInput) firstInput.focus();
        }, 600);
      }
    });
  });

})();

/* ══════════════════════════════════════════════════════════
   RASTREAMENTO DE ENGAJAMENTO — eventos personalizados (Meta)
   Tudo por CÓDIGO. NÃO ligar a detecção automática de eventos
   (foi ela que causou a duplicação de Lead/CompleteRegistration).
   ══════════════════════════════════════════════════════════ */

/* ── 1) Play no vídeo + marcos de 25/50/75% assistido ── */
(function () {
  var video = document.querySelector('.im-video');
  if (!video) return;

  var played = false;
  video.addEventListener('play', function () {
    if (played) return;              // dispara só no 1º play
    played = true;
    if (typeof fbq === 'function') {
      var id = 'vid-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
      fbq('trackCustom', 'VideoPlay', { video: '202605120735.mp4' }, { eventID: id });
    }
  });

  var marcosVid = { 25: false, 50: false, 75: false };
  video.addEventListener('timeupdate', function () {
    if (!video.duration) return;
    var pct = (video.currentTime / video.duration) * 100;
    [25, 50, 75].forEach(function (m) {
      if (!marcosVid[m] && pct >= m) {
        marcosVid[m] = true;
        if (typeof fbq === 'function') {
          fbq('trackCustom', 'VideoProgress', { percent: m });
        }
      }
    });
  });
}());

/* ── 2) Profundidade de rolagem (leitura da copy): 25/50/75/90% ── */
(function () {
  var marcosScroll = { 25: false, 50: false, 75: false, 90: false };
  function checarScroll() {
    var h = document.documentElement;
    var rolavel = h.scrollHeight - h.clientHeight;
    if (rolavel <= 0) return;
    var pct = (h.scrollTop / rolavel) * 100;
    [25, 50, 75, 90].forEach(function (m) {
      if (!marcosScroll[m] && pct >= m) {
        marcosScroll[m] = true;
        if (typeof fbq === 'function') {
          fbq('trackCustom', 'ScrollDepth', { percent: m });
        }
      }
    });
  }
  window.addEventListener('scroll', checarScroll, { passive: true });
}());

/* ── 3) Chegou na seção de inscrição (#inscricao) ── */
(function () {
  var alvo = document.getElementById('inscricao');
  if (!alvo || !('IntersectionObserver' in window)) return;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        if (typeof fbq === 'function') fbq('trackCustom', 'ViewOffer');
        obs.disconnect();            // dispara 1x só
      }
    });
  }, { threshold: 0.5 });
  obs.observe(alvo);
}());
