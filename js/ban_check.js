(async function() {
    const { data: { session } } = await supabaseClient.auth.getSession()
    if (!session) return

    const { data: user } = await supabaseClient
        .from('users').select('banned_until, ban_reason, banned_by, force_rename, username, id').eq('id', session.user.id).single()

    if (!user) return

    const isPermanent = user.banned_by !== null && user.banned_by !== undefined && user.banned_until === null
    const isTimed = user.banned_until && new Date(user.banned_until) > new Date()

    if (user.force_rename && !user.banned_by) {
        document.body.innerHTML = `
            <div style="font-family:sans-serif;background:#f6f6f6;min-height:100vh;display:flex;align-items:center;justify-content:center;margin:0;">
                <div style="max-width:500px;width:100%;background:#fff;border:1px solid #a2a9b1;padding:30px;">
                    <div style="border-bottom:1px solid #a2a9b1;padding-bottom:10px;margin-bottom:20px;">
                        <span style="font-family:serif;font-size:1.6em;font-weight:normal;">Муринопедия</span>
                    </div>
                    <div style="background:#fef6e4;border:1px solid #c8a850;border-left:5px solid #c8a850;padding:15px;margin-bottom:20px;">
                        <strong>М.С.В. требуетч сменить позывной</strong><br>
                        Ваш текущий позывной нарушаетч устав Муринопедии. Выберите новый.
                    </div>
                    <input type="text" id="new-username" placeholder="Новый позывной..." style="width:100%;padding:8px 10px;border:1px solid #a2a9b1;font-size:0.95em;margin-bottom:12px;box-sizing:border-box;">
                    <div id="rename-status" style="font-size:0.85em;color:#d33;margin-bottom:10px;"></div>
                    <button onclick="submitRename()" style="padding:8px 18px;background:#3366cc;color:#fff;border:none;cursor:pointer;font-size:0.9em;">Подтвердити</button>
                </div>
            </div>
        `

        window.submitRename = async function() {
            const val = document.getElementById('new-username').value.trim()
            const status = document.getElementById('rename-status')
            if (!val || val.length < 2) { status.textContent = 'Слишком короткий позывной'; return }
            const { data: taken } = await supabaseClient.from('users').select('id').eq('username', val).single()
            if (taken) { status.textContent = 'Позывной занят'; return }
            const { error } = await supabaseClient.from('users').update({ username: val, force_rename: false }).eq('id', session.user.id)
            if (error) { status.textContent = 'Смертч-шум: ' + error.message; return }
            window.location.reload()
        }
        return
    }

    if (!isPermanent && !isTimed) return

    const until = isPermanent
        ? 'Навсегда'
        : new Date(user.banned_until).toLocaleString('ru-RU')

    document.body.innerHTML = `
        <div style="font-family:sans-serif;background:#f6f6f6;min-height:100vh;display:flex;align-items:center;justify-content:center;margin:0;">
            <div style="max-width:500px;width:100%;background:#fff;border:1px solid #a2a9b1;padding:30px;">
                <div style="border-bottom:1px solid #a2a9b1;padding-bottom:10px;margin-bottom:20px;">
                    <span style="font-family:serif;font-size:1.6em;font-weight:normal;">Муринопедия</span>
                </div>
                <div style="background:#fee7e6;border:1px solid #d33;border-left:5px solid #d33;padding:15px;margin-bottom:20px;">
                    <strong style="color:#d33;font-size:1.1em;">Доступ закрытч</strong><br>
                    <span style="color:#d33;">Вы были забанены М.С.В.</span>
                </div>
                <table style="width:100%;border-collapse:collapse;font-size:0.95em;">
                    <tr style="border-bottom:1px solid #eaecf0;">
                        <td style="padding:8px;font-weight:bold;color:#54595d;white-space:nowrap;">Кто забанил</td>
                        <td style="padding:8px;">${user.banned_by ?? '—'}</td>
                    </tr>
                    <tr style="border-bottom:1px solid #eaecf0;">
                        <td style="padding:8px;font-weight:bold;color:#54595d;white-space:nowrap;">Причина</td>
                        <td style="padding:8px;">${user.ban_reason ?? '—'}</td>
                    </tr>
                    <tr>
                        <td style="padding:8px;font-weight:bold;color:#54595d;white-space:nowrap;">Длительность</td>
                        <td style="padding:8px;">${until}</td>
                    </tr>
                </table>
                <p style="font-size:0.82em;color:#54595d;margin-top:20px;border-top:1px solid #eaecf0;padding-top:12px;">
                    Ч илу доной, пока естч светл. Мурино стояти, Фог дрожати.
                </p>
            </div>
        </div>
    `
})()