/**
 * loads and decorates the hero-parallax block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = Array.from(block.children);

  if (rows.length < 2) return;

  // Set block to relative positioning for absolute children
  block.style.position = 'relative';
  block.style.overflow = 'hidden';

  // Background layer (Row 1) - static, takes up natural space
  const bgRow = rows[0];
  bgRow.style.position = 'relative';
  bgRow.style.width = '100%';
  bgRow.style.zIndex = '1';

  // Floating layer (Row 2) - parallax effect, positioned absolutely over background
  const floatRow = rows[1];
  floatRow.style.position = 'absolute';
  floatRow.style.top = '0';
  floatRow.style.left = '0';
  floatRow.style.width = '100%';
  floatRow.style.zIndex = '2';
  floatRow.style.willChange = 'transform';

  let rafId = null;
  const offsetMultiplier = 0.2;

  function updateParallax() {
    const blockRect = block.getBoundingClientRect();
    const blockTop = blockRect.top;
    const blockHeight = blockRect.height;

    // Only update if block is in viewport
    if (blockTop < window.innerHeight && blockTop + blockHeight > 0) {
      const blockCenter = blockTop + blockHeight / 2;
      const viewportCenter = window.innerHeight / 2;
      const distanceFromCenter = blockCenter - viewportCenter;
      const offset = distanceFromCenter * offsetMultiplier;
      floatRow.style.transform = `translateY(${offset}px)`;
    }

    rafId = null;
  }

  function onScroll() {
    if (!rafId) {
      rafId = requestAnimationFrame(updateParallax);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  updateParallax();
}

