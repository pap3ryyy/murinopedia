(function() {
    const m = document.createElement('meta');
    m.httpEquiv = "Content-Security-Policy";
    m.content = "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://rvykoymrumzgkgbwdefm.supabase.co wss://rvykoymrumzgkgbwdefm.supabase.co https://cdn.jsdelivr.net; img-src 'self' data: https://rvykoymrumzgkgbwdefm.supabase.co;";
    document.head.prepend(m);

    const clean = (el) => {
        if (el.innerHTML.includes('<img') || el.innerHTML.includes('onerror') || el.innerHTML.includes('<script')) {
            el.textContent = el.innerHTML;
        }
    };

    const runClean = () => {
        document.querySelectorAll('.article-card-title, .article-card-desc, .user-data, .article-content').forEach(clean);
    };

    if (document.body) {
        const observer = new MutationObserver(() => runClean());
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        document.addEventListener("DOMContentLoaded", () => {
            const observer = new MutationObserver(() => runClean());
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }
    
    runClean();
})();
