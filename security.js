const meta = document.createElement('meta');
meta.httpEquiv = "Content-Security-Policy";
meta.content = "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
document.head.appendChild(meta);

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.user-data').forEach(el => {
        el.textContent = el.innerHTML;
    });
});
