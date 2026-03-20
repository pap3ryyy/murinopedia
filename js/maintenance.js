(async function () {
    const MSV_ROLES = ['м.с.в.основательность', 'м.с.в.содрунник', 'м.с.в.проверкость']

    await new Promise(resolve => {
        if (typeof supabaseClient !== 'undefined') return resolve()
        const i = setInterval(() => {
            if (typeof supabaseClient !== 'undefined') { clearInterval(i); resolve() }
        }, 50)
    })

    const { data, error } = await supabaseClient
        .from('site_config').select('value, mode, reason').eq('key', 'maintenance').single()

    if (error || !data || data.value !== 'true') return

    const { data: { session } } = await supabaseClient.auth.getSession()
    if (session) {
        const { data: user } = await supabaseClient
            .from('users').select('role').eq('id', session.user.id).single()
        if (user && MSV_ROLES.includes(user.role)) return
    }

    const mode = data.mode ?? 'maintenance'
    const reason = data.reason ?? null

    const isWelldone = mode === 'welldone'

    document.open()
    document.write(`<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Муринопедия — ${isWelldone ? 'Конец Дона' : 'Дон ограничен'}</title>
    <link rel="icon" type="image/png" href="asset/logo.ico">
    <link rel="stylesheet" href="css/wiki.css">
    <style>
        body { display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; }
        .box { border:1px solid #a2a9b1; padding:48px 40px; max-width:480px; width:100%; text-align:center; }
        .box h1 { font-family:serif; font-size:1.6em; margin:0 0 24px 0; ${isWelldone ? 'color:#d33;' : ''} }
        .box img { width:220px; height:220px; object-fit:contain; display:block; margin:0 auto 24px auto; }
        .box p { font-size:0.95em; color:#54595d; margin:0 0 10px 0; line-height:1.6; }
        .reason-box { margin-top:16px; background:${isWelldone ? '#fee7e6' : '#f8f9fa'}; border:1px solid #eaecf0; border-left:4px solid ${isWelldone ? '#d33' : '#a2a9b1'}; padding:10px 14px; font-size:0.88em; color:${isWelldone ? '#7a0000' : '#54595d'}; text-align:left; }
        .footer-note { margin-top:28px; font-size:0.78em; color:#a2a9b1; }
    </style>
</head>
<body>
    <div class="box">
        <h1>${isWelldone ? 'Конец Дона' : 'Дон ограничен'}</h1>
        <img src="asset/${isWelldone ? 'pizda' : 'blya'}.gif" alt="">
        <p>${isWelldone
            ? 'Муринопедия окончательно закрыта. Сайт доживает последние дни — пока ещё естч светл.'
            : 'Сайтость закрыта на тех обслуживанность, оставайтесь в донах.'
        }</p>
        ${reason ? `<div class="reason-box"><b>Причина:</b> ${reason}</div>` : ''}
        <div class="footer-note">Муринопедия — 2026. Ч илу доной, пока естч светл.</div>
    </div>
</body>
</html>`)
    document.close()
})()
