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

  /* ── Máscara de telefone ── */
  function maskPhone(input) {
    input.addEventListener('input', function () {
      var v = input.value.replace(/\D/g, '').slice(0, 11);
      if (v.length <= 10) {
        v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
      } else {
        v = v.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
      }
      input.value = v;
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
  var SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwrLYAbupk_gU0EHKMe2vHOztqHYPRrn49ALrR3hYSCB78KfCW6lhFh8FMIODmnm0Hj/exec';

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
        whatsapp:  (form.querySelector('[name="whatsapp"]')  || {}).value || '',
        email:     (form.querySelector('[name="email"]')     || {}).value || '',
        profissao: (form.querySelector('[name="profissao"]') || {}).value || ''
      };

      navigator.sendBeacon(SHEETS_URL, new URLSearchParams(data));
      window.location.href = 'obrigado.html';
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
