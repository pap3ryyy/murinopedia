(async function() {
    const { data: majorUpdate } = await supabaseClient
        .from('update_logs')
        .select('id, version, title, description')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (!majorUpdate) return

    const storageKey = 'murino_major_seen_' + majorUpdate.id
    if (localStorage.getItem(storageKey)) return

    const overlay = document.createElement('div')
    overlay.id = 'major-update-overlay'
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;'
    overlay.innerHTML = `
        <div style="background:#fff;border:2px solid #3366cc;max-width:480px;width:90%;padding:24px;position:relative;">
            <div style="font-size:0.72em;color:#3366cc;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:8px;">
                М.С.В. · Оповещение · v${majorUpdate.version}
            </div>
            <h3 style="font-family:serif;font-weight:normal;font-size:1.3em;margin:0 0 12px 0;color:#202122;">
                ${majorUpdate.title.replace(/</g,'&lt;').replace(/>/g,'&gt;')}
            </h3>
            <p style="font-size:0.88em;color:#54595d;line-height:1.5;margin-bottom:20px;">
                ${majorUpdate.description ? majorUpdate.description.replace(/</g,'&lt;').replace(/>/g,'&gt;') : 'М.С.В. сообщает о важном изменении.'}
            </p>
            <div style="display:flex;gap:10px;">
                <button id="major-close-btn" class="btn btn-primary" style="padding:6px 18px;">Принятость</button>
            </div>
        </div>
    `

    document.body.appendChild(overlay)

    document.getElementById('major-close-btn').addEventListener('click', function() {
        localStorage.setItem(storageKey, '1')
        overlay.remove()
    })
})()
