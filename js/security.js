(function() {
    const m = document.createElement('meta');
    m.httpEquiv = "Content-Security-Policy";
    m.content = "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; connect-src 'self' https://rvykoymrumzgkgbwdefm.supabase.co wss://rvykoymrumzgkgbwdefm.supabase.co https://cdn.jsdelivr.net; img-src 'self' data: https://rvykoymrumzgkgbwdefm.supabase.co;";
    document.head.prepend(m);

    const clean = (el) => {
        if (el.innerHTML.includes('<') || el.innerHTML.includes('on')) {
            el.textContent = el.innerHTML;
        }
    };

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mo) => {
            mo.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    node.querySelectorAll('.article-card-title, .article-card-desc, .user-data').forEach(clean);
                    if (node.classList && (node.classList.contains('article-card-title') || node.classList.contains('user-data'))) clean(node);
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    document.querySelectorAll('.article-card-title, .article-card-desc, .user-data').forEach(clean);
})();
