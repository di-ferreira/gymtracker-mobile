function initSidebar() {
  const links = document.querySelectorAll('.sidebar-nav a');
  const current = location.pathname.split('/').pop() || 'index.html';

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === current) {
      link.classList.add('active');
    }
    link.addEventListener('click', () => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

function initCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      const text = el.getAttribute('data-copy');
      navigator.clipboard.writeText(text).then(() => {
        const original = el.textContent;
        el.textContent = 'Copied!';
        setTimeout(() => { el.textContent = original; }, 1200);
      });
    });
  });
}

function initTabs() {
  document.querySelectorAll('.tab-group').forEach(group => {
    const tabs = group.querySelectorAll('.tab-btn');
    const panels = group.querySelectorAll('.tab-panel');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        panels.forEach(p => {
          p.classList.toggle('active', p.id === target);
        });
      });
    });
  });
}

function initMobileTOC() {
  const btn = document.querySelector('.mobile-toc-btn');
  const nav = document.querySelector('.mobile-toc-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    nav.classList.toggle('open');
    btn.classList.toggle('open');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initCopyButtons();
  initTabs();
  initMobileTOC();
});
