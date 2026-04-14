(async function () {
    const data = {
        value: 'true',
        mode: '???',
        reason: ''
    };

    const mode = data.mode ?? 'maintenance';
    const reason = data.reason ?? null;
    const isWelldone = mode === 'welldone';
    const isSecret = mode === '???';

    const content = `
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Муринопедия — ${isWelldone ? 'Конец Дона' : (isSecret ? 'Дон в разработке..' : 'Дон ограничен')}</title>
    <link rel="icon" type="image/png" href="asset/logo.ico">
    <link rel="stylesheet" href="css/wiki.css">
    <style>
        html, body { height: 100vh; width: 100vw; margin: 0; padding: 0; overflow: hidden; }
        body { 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            background: #fff !important; 
            font-family: sans-serif;
            position: relative;
        }
        .box { 
            border: 1px solid #a2a9b1; 
            padding: 48px 40px; 
            max-width: 480px; 
            width: 90%; 
            text-align: center; 
            background: #fff; 
            box-sizing: border-box; 
        }
        .box h1 { 
            font-family: serif; 
            font-size: 1.6em; 
            margin: 0 0 24px 0; 
            ${isWelldone ? 'color: #d33;' : ''} 
        }
        .box img { 
            width: 220px; 
            height: 220px; 
            object-fit: contain; 
            display: block; 
            margin: 0 auto 24px auto; 
        }
        .box p { 
            font-size: 0.95em; 
            color: #54595d; 
            margin: 0 0 10px 0; 
            line-height: 1.6; 
        }
        .reason-box { 
            margin-top: 16px; 
            background: ${isWelldone ? '#fee7e6' : '#f8f9fa'}; 
            border: 1px solid #eaecf0; 
            border-left: 4px solid ${isWelldone ? '#d33' : '#a2a9b1'}; 
            padding: 10px 14px; 
            font-size: 0.88em; 
            color: ${isWelldone ? '#7a0000' : '#54595d'}; 
            text-align: left; 
        }
        .footer-note { 
            margin-top: 28px; 
            font-size: 0.78em; 
            color: #a2a9b1; 
        }
        .don-word {
            cursor: pointer;
            color: inherit;
            text-decoration: none;
            font-weight: inherit;
        }
        .secret-hint {
            position: fixed;
            bottom: 10px;
            left: 10px;
            font-size: 0.7em;
            color: #a2a9b1;
            opacity: 0;
            transition: opacity 0.3s;
            font-family: monospace;
            z-index: 9999;
            background: rgba(255,255,255,0.9);
            padding: 6px 10px;
            border: 1px solid #e0e0e0;
            pointer-events: none;
        }
        .secret-hint.visible {
            opacity: 1;
            pointer-events: auto;
        }
        .secret-hint a {
            color: #0645ad;
            text-decoration: none;
            pointer-events: auto;
        }
        .secret-hint a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="box">
        <h1>${isWelldone ? 'Конец Дона' : (isSecret ? '<span class="don-word">Дон</span> в разработке..' : 'Дон ограничен')}</h1>
        <img src="asset/${isWelldone ? 'pizda' : (isSecret ? 'murino-cd-don.vercel.app' : 'blya')}.gif" alt="">
        <p>${isWelldone
            ? 'Муринопедия окончательно закрыта. Сайт доживает последние дни — пока ещё естч светл.'
            : (isSecret 
                ? 'Сайтость в разработке.'
                : 'Сайтость закрыта на тех обслуживанность, оставайтесь в донах.')
        }</p>
        ${reason && !isSecret ? `<div class="reason-box"><b>Причина:</b> ${reason}</div>` : ''}
        <div class="footer-note" id="footerNote">
            Муринопедия — 2026. Ч илу 
            <span class="don-word">дон</span>ой, пока естч светл.
        </div>
    </div>
    ${isSecret ? `
    <div class="secret-hint" id="secretHint">
        скачай или посмотри на <a href="https://github.com/pap3ryyy/murinoCDDon/raw/main/murino-cd-don.vercel.app.gif" target="_blank">ссылку гифки</a>
    </div>` : ''}
</body>`;

    document.documentElement.innerHTML = content;

    if (isSecret) {
        const donWords = document.querySelectorAll('.don-word');
        const secretHint = document.getElementById('secretHint');

        donWords.forEach(function (word) {
            word.addEventListener('click', function (e) {
                e.stopPropagation();
                secretHint.classList.add('visible');
            });
        });

        document.addEventListener('click', function () {
            secretHint.classList.remove('visible');
        });

        secretHint.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }
})();
