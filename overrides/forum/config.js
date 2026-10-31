// Keep the visual system consistent on the audience, participant and facilitator pages.
if (!document.querySelector('link[href="vivid.css"]')) {
  const visualStyles = document.createElement('link');
  visualStyles.rel = 'stylesheet';
  visualStyles.href = 'vivid.css';
  document.head.appendChild(visualStyles);
}
// The audience UI is served by GitHub Pages; live rooms use the public service.
window.FORUM_API_BASE = location.hostname === 'customerservices2040.github.io'
  ? 'https://spf-governorates-forum-review.spf2040.chatgpt.site' : '';
window.FORUM_CONTROL_BASE = window.FORUM_API_BASE ? window.FORUM_API_BASE + '/forum/' : '';
