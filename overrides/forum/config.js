// The audience UI may be served by GitHub Pages; the live service requires a server.
// Owner-private review stays same-origin. Public access is a separate approval step.
window.FORUM_API_BASE = location.hostname === 'customerservices2040.github.io'
  ? 'https://spf-governorates-forum-review.spf2040.chatgpt.site' : '';
window.FORUM_CONTROL_BASE = window.FORUM_API_BASE ? window.FORUM_API_BASE + '/forum/' : '';
