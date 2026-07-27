// Motion One micro-interactions — Roblox theme
// Auto-applies entrance animations and press feedback.
// Loaded per page after Motion One CDN.
(function () {
  if (!window.Motion) return;
  const { animate, stagger, inView } = window.Motion;

  // Entrance: cards & tiles
  const targets = document.querySelectorAll(
    '.roblox-card, .menu-tile, .stat-card, .btn-roblox, .welcome-banner'
  );
  if (targets.length) {
    animate(
      targets,
      { opacity: [0, 1], transform: ['translateY(24px) scale(0.96)', 'translateY(0) scale(1)'] },
      { duration: 0.55, delay: stagger(0.06), easing: [0.34, 1.4, 0.64, 1] }
    );
  }

  // Menu tile / stat card hover lift
  document.querySelectorAll('.menu-tile, .stat-card, .rbx-hover').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      animate(el, { transform: 'translate(-4px, -4px)' }, { duration: 0.18 });
    });
    el.addEventListener('mouseleave', () => {
      animate(el, { transform: 'translate(0, 0)' }, { duration: 0.18 });
    });
  });

  // Press feedback on any Roblox button
  document.querySelectorAll('.btn-roblox, .menu-tile').forEach((el) => {
    el.addEventListener('pointerdown', () => {
      animate(el, { transform: 'translate(2px, 2px) scale(0.98)' }, { duration: 0.08 });
    });
    el.addEventListener('pointerup', () => {
      animate(el, { transform: 'translate(0, 0) scale(1)' }, { duration: 0.15, easing: [0.34, 1.4, 0.64, 1] });
    });
  });

  // Reveal-on-scroll for sections deeper in the page
  document.querySelectorAll('[data-rbx-reveal]').forEach((el) => {
    el.style.opacity = '0';
    inView(el, () => {
      animate(
        el,
        { opacity: [0, 1], transform: ['translateY(30px)', 'translateY(0)'] },
        { duration: 0.55, easing: [0.34, 1.4, 0.64, 1] }
      );
    });
  });
})();
