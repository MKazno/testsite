/**
 * Loads and decorates the hero-parallax block.
 * Expected content structure:
 * - Row 1: Background image (no parallax)
 * - Row 2: Floating element (parallax at 0.2)
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = Array.from(block.children);

  // Row 1: Background image
  const bgRow = rows[0];
  const bgPicture = bgRow?.querySelector('picture');
  const bgImg = bgRow?.querySelector('img');

  block.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'hero-parallax-container';

  // Background layer
  if (bgPicture || bgImg) {
    const bgLayer = document.createElement('div');
    bgLayer.className = 'hero-parallax-bg';
    if (bgPicture) {
      bgLayer.appendChild(bgPicture.cloneNode(true));
    } else if (bgImg) {
      bgLayer.appendChild(bgImg.cloneNode(true));
    }
    container.appendChild(bgLayer);
  }

  // Row 2: Floating layer
  const floatLayers = [];
  const floatRow = rows[1];
  if (floatRow) {
    const floatLayer = document.createElement('div');
    floatLayer.className = 'hero-parallax-float';
    floatLayer.dataset.parallaxOffset = 0.2;

    const rowClone = floatRow.cloneNode(true);
    while (rowClone.firstChild) {
      floatLayer.appendChild(rowClone.firstChild.cloneNode(true));
    }

    container.appendChild(floatLayer);
    floatLayers.push(floatLayer);
  }

  block.appendChild(container);

  // Parallax animation
  if (floatLayers.length > 0) {
    let rafId = null;

    function updateParallax() {
      const blockRect = block.getBoundingClientRect();
      const blockTop = blockRect.top;
      const blockHeight = blockRect.height;
      const blockCenter = blockTop + blockHeight / 2;
      const viewportCenter = window.innerHeight / 2;

      if (blockTop < window.innerHeight && blockTop + blockHeight > 0) {
        const distanceFromCenter = blockCenter - viewportCenter;

        floatLayers.forEach((layer) => {
          const offsetMultiplier = parseFloat(layer.dataset.parallaxOffset);
          const offset = distanceFromCenter * offsetMultiplier;
          layer.style.transform = `translateY(${offset}px)`;
        });
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
}
