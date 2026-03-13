(async function() {
    const { data: alerts } = await supabaseClient
        .from('site_alerts')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })

    if (!alerts || alerts.length === 0) return

    const colors = {
        error:   { bg: '#fff0f0', border: '#d33',    text: '#a00' },
        warn:    { bg: '#fff8e6', border: '#c8a850',  text: '#7a5800' },
        success: { bg: '#f0fff4', border: '#14866d',  text: '#0a5c3a' }
    }

    const wrap = document.createElement('div')
    wrap.id = 'site-alerts-wrap'
    wrap.style.cssText = 'width:100%;'

    alerts.forEach(a => {
        const c = colors[a.type] || colors.warn
        const el = document.createElement('div')
        el.style.cssText = `
            background:${c.bg};
            border-bottom:2px solid ${c.border};
            color:${c.text};
            padding:8px 20px;
            font-size:0.88em;
            text-align:center;
            font-family:sans-serif;
        `
        el.textContent = a.message
        wrap.appendChild(el)
    })

    const header = document.querySelector('header')
    if (header && header.nextSibling) {
        header.parentNode.insertBefore(wrap, header.nextSibling)
    } else if (header) {
        header.parentNode.appendChild(wrap)
    } else {
        document.body.prepend(wrap)
    }
})()
