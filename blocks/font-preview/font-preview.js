const DEFAULT_FONTS = [
  { name: 'Sky Text Regular', file: '/fonts/SkyText/SkyTextVF_W_Rg.woff', weight: '400', style: 'normal' },
  { name: 'Sky Text Light', file: '/fonts/SkyText/SkyTextVF_W_Lt.woff', weight: '300', style: 'normal' },
  { name: 'Sky Text Medium', file: '/fonts/SkyText/SkyTextVF_W_Md.woff', weight: '500', style: 'normal' },
  { name: 'Sky Text Bold', file: '/fonts/SkyText/SkyTextVF_W_Bd.woff', weight: '700', style: 'normal' },
  { name: 'Sky Text Super Bold', file: '/fonts/SkyText/SkyTextVF_W_SBd.woff', weight: '800', style: 'normal' },
];

function cleanText(value) {
  return value ? value.trim().replace(/\s+/g, ' ') : '';
}

function toFontId(name, index) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index}`;
}

function resolveFontFile(value) {
  if (!value) return '';
  const trimmed = value.trim();

  if (trimmed.startsWith('//') || /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  if (trimmed.startsWith('fonts/')) {
    return `/${trimmed}`;
  }

  return `/fonts/${trimmed}`;
}

function fontFormat(file) {
  const extension = file.split('?')[0].split('.').pop().toLowerCase();
  if (extension === 'otf') return 'opentype';
  if (extension === 'woff') return 'woff';
  if (extension === 'woff2') return 'woff2';
  return 'truetype';
}

function getCellText(row, index) {
  return cleanText(row.children[index]?.textContent || '');
}

function getCellLink(row, index) {
  const link = row.children[index]?.querySelector('a[href]');
  return link ? link.href : '';
}

function parseAuthoredFonts(block) {
  return [...block.children].map((row) => {
    const name = getCellText(row, 0);
    const authoredFile = getCellLink(row, 1) || getCellText(row, 1);
    const weight = getCellText(row, 2) || '400';
    const style = getCellText(row, 3) || 'normal';

    if (!name) return null;
    return {
      name,
      file: authoredFile,
      weight,
      style,
    };
  }).filter(Boolean);
}

function injectFontFaces(fonts) {
  const style = document.createElement('style');
  style.textContent = fonts.map((font, index) => {
    const family = toFontId(font.name, index);
    const url = resolveFontFile(font.file);
    if (!url) return '';
    return `@font-face { font-family: '${family}'; src: url('${url}') format('${fontFormat(url)}'); font-weight: ${font.weight}; font-style: ${font.style}; font-display: swap; }`;
  }).join('\n');
  document.head.append(style);
}

function setSelected(buttons, preview, download, fonts, index) {
  const font = fonts[index];
  const family = toFontId(font.name, index);

  buttons.forEach((button, buttonIndex) => {
    button.setAttribute('aria-selected', String(buttonIndex === index));
    button.tabIndex = buttonIndex === index ? 0 : -1;
  });

  preview.style.fontFamily = `'${family}'`;
  preview.style.fontWeight = font.weight;
  preview.style.fontStyle = font.style;
  preview.textContent = font.name;

  if (font.file) {
    download.href = resolveFontFile(font.file);
    download.download = font.file.split('/').pop() || `${font.name}.ttf`;
    download.removeAttribute('aria-disabled');
  } else {
    download.removeAttribute('href');
    download.removeAttribute('download');
    download.setAttribute('aria-disabled', 'true');
  }
}

function createFontButton(font, index) {
  const button = document.createElement('button');
  button.type = 'button';
  button.role = 'tab';
  button.id = `font-preview-tab-${index}`;
  button.setAttribute('aria-controls', 'font-preview-panel');
  button.textContent = font.name;
  return button;
}

export default function decorate(block) {
  const authoredFonts = parseAuthoredFonts(block);
  const fonts = authoredFonts.length ? authoredFonts : DEFAULT_FONTS;

  block.textContent = '';
  block.classList.add('font-preview-ready');
  injectFontFaces(fonts);

  const list = document.createElement('div');
  list.className = 'font-preview-list';
  list.role = 'tablist';
  list.setAttribute('aria-label', 'Font family');

  const previewWrap = document.createElement('div');
  previewWrap.className = 'font-preview-display';
  previewWrap.id = 'font-preview-panel';
  previewWrap.role = 'tabpanel';

  const preview = document.createElement('p');
  preview.className = 'font-preview-name';

  const sample = document.createElement('p');
  sample.className = 'font-preview-sample';
  sample.textContent = 'The quick brown fox jumps over the lazy dog. 0123456789';

  const download = document.createElement('a');
  download.className = 'font-preview-download';
  download.textContent = 'Download font';

  previewWrap.append(preview, sample, download);

  const buttons = fonts.map((font, index) => {
    const button = createFontButton(font, index);
    button.addEventListener('click', () => setSelected(buttons, preview, download, fonts, index));
    button.addEventListener('keydown', (event) => {
      const current = buttons.indexOf(button);
      const next = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? current + 1 : current - 1;
      if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(event.key)) return;
      event.preventDefault();
      const normalized = (next + buttons.length) % buttons.length;
      setSelected(buttons, preview, download, fonts, normalized);
      buttons[normalized].focus();
    });
    list.append(button);
    return button;
  });

  block.append(list, previewWrap);
  setSelected(buttons, preview, download, fonts, 0);
}


