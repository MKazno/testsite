export default function decorate(block) {
  const message = block.textContent.trim() || 'Test block is live';
  block.textContent = '';

  const badge = document.createElement('p');
  badge.className = 'test-eyebrow';
  badge.textContent = 'Test block';

  const heading = document.createElement('p');
  heading.className = 'test-message';
  heading.textContent = message;

  block.append(badge, heading);
}