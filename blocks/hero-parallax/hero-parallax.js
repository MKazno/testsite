/**
 * loads and decorates the hero-parallax block
 * @param {Element} block The block element
 */
/**
 * loads and decorates the hero-parallax block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = Array.from(block.children);

  if (rows.length < 2) return;

  // Set block to full viewport width and contain children
  block.style.position = 'relative';
  block.style.overflow = 'hidden';
  block.style.left = '50%';
  block.style.marginLeft = '-50vw';
  block.style.width = '100vw';

  // Analyze rows to identify content type
  const rowAnalysis = rows.map((row) => {
    const hasImages = row.querySelector('picture, img');
    const hasText = row.textContent.trim().length > 0;
    const columns = Array.from(row.children);

    return {
      element: row,
      hasImages: !!hasImages,
      hasText: hasText && !hasImages, // Text-only rows
      columns,
      columnCount: columns.length,
    };
  });

  // Separate image and text rows
  const imageRows = rowAnalysis.filter((r) => r.hasImages);
  const textRows = rowAnalysis.filter((r) => r.hasText);

  // Position all rows with proper z-index
  // Lower rows (higher index) get higher z-index
  let zIndex = 1;

  rowAnalysis.forEach((row, index) => {
    const isFirstImageRow = row.hasImages && imageRows[0] === row;
    const isFullWidthRow = row.hasImages && !isFirstImageRow;

    row.element.style.position = isFirstImageRow ? 'relative' : 'absolute';
    row.element.style.top = '0';
    row.element.style.left = '0';
    row.element.style.width = '100%';
    row.element.style.zIndex = zIndex;
    row.element.style.display = 'flex';

    if (row.hasImages) {
      // Image row: make flex items match column structure
      row.columns.forEach((col) => {
        col.style.flex = '1';
        col.style.overflow = 'hidden';
        const img = col.querySelector('img, picture');
        if (img) {
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'cover';
          img.style.display = 'block';
        }
      });

      // Apply parallax only to non-first image rows
      if (!isFirstImageRow) {
        row.element.style.willChange = 'transform';
      }
    } else if (row.hasText) {
      // Text row: position columns to match layout
      row.columns.forEach((col) => {
        col.style.flex = '1';
        col.style.padding = '1rem';
      });
      row.element.style.willChange = 'transform';
    }

    zIndex += 1;
  });

  // Apply parallax effect to non-background image rows only
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

      // Apply parallax to all non-background image rows
      imageRows.forEach((row, index) => {
        if (index > 0) { // Skip first image row (background)
          row.element.style.transform = `translateY(${offset}px)`;
        }
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

