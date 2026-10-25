(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* SETTINGS: change these two lines.
     email        = the address shown on the Contact page.
     formEndpoint = your Formspree form URL (formspree.io, free). Messages are then delivered to your inbox.
                    Leave the placeholder and the form opens the visitor's email app instead. */
  var CONFIG = {
    email: 'angelinetagalog0829@gmail.com',
    formEndpoint: 'https://formspree.io/f/mwllvpyp'
  };

  /* theme */
  document.getElementById('theme').addEventListener('click', function () {
    var cur = root.getAttribute('data-theme');
    if (!cur) cur = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.setAttribute('data-theme', cur === 'dark' ? 'light' : 'dark');
  });

  /* skill cards (placeholders) */
  var P = [90, 82, 76, 70];
  var grid = document.getElementById('skGrid');
  P.forEach(function (p, i) {
    var n = String(i + 1).padStart(2, '0');
    var c = document.createElement('div');
    c.className = 'skill st';
    c.style.setProperty('--i', i + 3);
    c.style.setProperty('--p', p);
    c.innerHTML =
      '<div class="top"><span class="idx">' + n + '</span>' +
      '<div class="ring" style="--p:' + p + ';--i:' + (i + 3) + '"><svg viewBox="0 0 64 64" aria-hidden="true"><circle class="tr" cx="32" cy="32" r="26"/><circle class="fg" cx="32" cy="32" r="26"/></svg><span class="val"><span class="count" data-to="' + p + '">' + p + '</span>%</span></div></div>' +
      '<h3>Skill name</h3><p>A short line about how you use this skill in real projects.</p>' +
      '<div class="bar-s" style="--p:' + p + ';--i:' + (i + 3) + '"></div>';
    grid.appendChild(c);
    if (!reduce && window.matchMedia('(hover: hover)').matches) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        var x = e.clientX - r.left, y = e.clientY - r.top;
        c.style.setProperty('--mx', x + 'px'); c.style.setProperty('--my', y + 'px');
        var rx = ((y / r.height) - 0.5) * -10, ry = ((x / r.width) - 0.5) * 10;
        c.style.animation = 'none';
        c.style.transform = 'perspective(700px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-4px)';
      });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    }
  });

  /* count-up for rings */
  function countUp(view) {
    if (reduce) return;
    view.querySelectorAll('.count').forEach(function (el, i) {
      var to = Number(el.getAttribute('data-to')), start = null;
      var delay = (i + 3) * 80 + 500;
      el.textContent = '0';
      function step(ts) {
        if (start === null) start = ts + delay;
        var p = Math.min(Math.max((ts - start) / 1400, 0), 1);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* one long page: smooth scroll to a section, highlight the section in view */
  var ids = ['home', 'about', 'skills', 'projects', 'contact'];
  var links = document.querySelectorAll('.nav-link');
  function setActive(id) {
    links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-go') === id); });
  }
  /* smooth, eased scrolling between sections; the target section's content then fades in one piece at a time */
  var headerEl = document.querySelector('header');
  var lockId = null, anim = null, arriveTimer = null;
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function arrive(el) { el.classList.remove('arrive'); void el.offsetWidth; el.classList.add('arrive'); }
  function sectionTop(el) {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    return Math.min(max, Math.max(0, el.getBoundingClientRect().top + window.scrollY - headerEl.offsetHeight + 1));
  }
  function cancelScroll() {
    if (anim) { cancelAnimationFrame(anim); anim = null; }
    clearTimeout(arriveTimer);
    lockId = null;
  }
  function go(id) {
    var el = document.getElementById(id);
    if (!el) return;
    cancelScroll();
    setActive(id);
    try { history.replaceState(null, '', '#' + id); } catch (err) {}
    var from = window.scrollY, to = sectionTop(el), dist = to - from;
    if (reduce || Math.abs(dist) < 2) { window.scrollTo(0, to); arrive(el); return; }
    lockId = id;
    var dur = Math.min(1600, Math.max(750, 500 + Math.abs(dist) * 0.3)), t0 = null;
    arriveTimer = setTimeout(function () { arrive(el); }, dur * 0.4);
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      window.scrollTo(0, from + dist * ease(p));
      if (p < 1) { anim = requestAnimationFrame(step); }
      else { anim = null; lockId = null; }
    }
    anim = requestAnimationFrame(step);
  }
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) {
    window.addEventListener(ev, cancelScroll, { passive: true });
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-go]');
    if (!a) return;
    e.preventDefault();
    go(a.getAttribute('data-go'));
  });

  /* thin progress line under the header */
  var progress = document.getElementById('progress');
  function updateProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
  var skills = document.getElementById('skills');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      if (lockId) return;
      entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ids.forEach(function (id) { spy.observe(document.getElementById(id)); });
    var once = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { skills.classList.add('go'); countUp(skills); once.disconnect(); }
    }, { threshold: 0.25 });
    once.observe(skills);
  } else { skills.classList.add('go'); }
  window.addEventListener('scroll', function () {
    if (!lockId && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) setActive('contact');
  }, { passive: true });
  setActive('home');
  if (location.hash) {
    var target = document.getElementById(location.hash.slice(1));
    if (target && ids.indexOf(target.id) >= 0) target.scrollIntoView();
  }

  /* photo frames follow the pointer: a slight tilt, parallax and a soft glare */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.slot').forEach(function (slot) {
      slot.addEventListener('pointermove', function (e) {
        var r = slot.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        slot.style.setProperty('--ry', ((x - 0.5) * 12).toFixed(2) + 'deg');
        slot.style.setProperty('--rx', ((0.5 - y) * 10).toFixed(2) + 'deg');
        slot.style.setProperty('--px', ((x - 0.5) * 2).toFixed(3));
        slot.style.setProperty('--py', ((y - 0.5) * 2).toFixed(3));
        slot.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
        slot.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
      });
      slot.addEventListener('pointerleave', function () {
        ['--rx', '--ry', '--px', '--py', '--gx', '--gy'].forEach(function (p) { slot.style.removeProperty(p); });
      });
    });
  }

  /* photo: looks for photo.jpg, photo.jpeg, photo.png or photo.webp in the same folder */
  function setPhoto(src) {
    document.querySelectorAll('img[data-photo]').forEach(function (img) {
      img.src = src; img.hidden = false;
      var slot = img.closest('.slot'); if (slot) slot.classList.add('has-photo');
    });
  }
  var list = (root.getAttribute('data-photo-src') || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
  (function tryNext(i) {
    if (i >= list.length) return;
    var probe = new Image();
    probe.onload = function () { setPhoto(list[i]); };
    probe.onerror = function () { tryNext(i + 1); };
    probe.src = list[i];
  })(0);

  /* contact */
  var mail = document.getElementById('mail');
  mail.textContent = CONFIG.email;
  var copyBtn = document.getElementById('copy');
  copyBtn.addEventListener('click', function () {
    function done() { copyBtn.textContent = 'Copied'; setTimeout(function () { copyBtn.textContent = 'Copy address'; }, 1800); }
    function fallback() {
      var r = document.createRange(); r.selectNodeContents(mail);
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      copyBtn.textContent = 'Press Ctrl/Cmd+C';
    }
    try { navigator.clipboard.writeText(mail.textContent).then(done, fallback); } catch (e) { fallback(); }
  });

  var form = document.getElementById('contactForm');
  var sendBtn = document.getElementById('send');
  var statusEl = document.getElementById('status');
  function setStatus(text, kind) { statusEl.textContent = text; statusEl.className = 'status' + (kind ? ' ' + kind : ''); }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = new FormData(form);
    if (data.get('_gotcha')) return;
    var configured = CONFIG.formEndpoint.indexOf('YOUR_FORM_ID') < 0;
    if (!configured) {
      var subject = 'Portfolio message from ' + data.get('name');
      var body = data.get('message') + '\n\n' + data.get('name') + ' (' + data.get('email') + ')';
      window.location.href = 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      setStatus('Your email app should open with the message ready. If nothing opens, write to ' + CONFIG.email + ' directly.', '');
      return;
    }
    data.append('_subject', 'New message from your portfolio');
    sendBtn.disabled = true; sendBtn.textContent = 'Sending...';
    setStatus('', '');
    fetch(CONFIG.formEndpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (r) {
        if (!r.ok) throw new Error('bad response');
        form.reset();
        setStatus('Thanks! Your message was sent.', 'ok');
      })
      .catch(function () { setStatus('Something went wrong. Please try again or email ' + CONFIG.email + '.', 'err'); })
      .then(function () { sendBtn.disabled = false; sendBtn.textContent = 'Send message'; });
  });
})();