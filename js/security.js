(function() {
    const m = document.createElement('meta');
    m.httpEquiv = "Content-Security-Policy";
    m.content = "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://rvykoymrumzgkgbwdefm.supabase.co wss://rvykoymrumzgkgbwdefm.supabase.co https://cdn.jsdelivr.net; img-src 'self' data: https://rvykoymrumzgkgbwdefm.supabase.co;";
    document.head.prepend(m);

    const sanitize = (el) => {
        const dangerousTags = el.querySelectorAll('script, iframe, object, embed, frame, frameset');
        dangerousTags.forEach(s => s.remove());

        const allElements = el.querySelectorAll('*');
        allElements.forEach(item => {
            const attrs = item.attributes;
            for (let i = attrs.length - 1; i >= 0; i--) {
                if (attrs[i].name.toLowerCase().startsWith('on')) {
                    item.removeAttribute(attrs[i].name);
                }
            }
            if (item.tagName === 'A' && item.getAttribute('href')?.toLowerCase().startsWith('javascript:')) {
                item.removeAttribute('href');
            }
        });
    };

    const run = () => {
        document.querySelectorAll('.article-content, .user-data, .article-card-desc, .meta-infobox, .infobox-table').forEach(sanitize);
    };

    if (document.body) {
        new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
    }
    run();
})();
