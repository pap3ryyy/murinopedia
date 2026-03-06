(function() {
    const m = document.createElement('meta');
    m.httpEquiv = "Content-Security-Policy";
    m.content = "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://rvykoymrumzgkgbwdefm.supabase.co wss://rvykoymrumzgkgbwdefm.supabase.co https://cdn.jsdelivr.net; img-src 'self' data: https://rvykoymrumzgkgbwdefm.supabase.co;";
    document.head.prepend(m);

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll('.article-card-title, .article-card-desc, .user-data').forEach(el => {
            el.textContent = el.innerHTML;
        });
    });
})();
