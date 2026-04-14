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
    <style>
        html, body { height: 100vh; width: 100vw; margin: 0; padding: 0; overflow: hidden; }
        body { 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            background: #fff; 
            font-family: sans-serif;
        }
        .box { 
            border: 1px solid #a2a9b1; 
            padding: 48px 40px; 
            max-width: 480px; 
            width: 90%; 
            text-align: center; 
            background: #fff; 
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
        }
        .footer-note { 
            margin-top: 28px; 
            font-size: 0.78em; 
            color: #a2a9b1; 
        }
        .don-word {
            cursor: pointer;
        }
        #hint {
            position: fixed;
            bottom: 10px;
            left: 10px;
            font-size: 12px;
            color: #888;
            display: none;
            background: #fff;
            padding: 5px 10px;
            border: 1px solid #ccc;
        }
        #hint a {
            color: #0645ad;
        }
    </style>
</head>
<body>
    <div class="box">
        <h1>${isWelldone ? 'Конец Дона' : (isSecret ? '<span class="don-word" onclick="showHint()">Дон</span> в разработке..' : 'Дон ограничен')}</h1>
        <img src="asset/${isWelldone ? 'pizda' : (isSecret ? 'murino-cd-don.vercel.app' : 'blya')}.gif">
        <p>${isWelldone
            ? 'Муринопедия окончательно закрыта. Сайт доживает последние дни — пока ещё естч светл.'
            : (isSecret 
                ? 'Сайтость в разработке.'
                : 'Сайтость закрыта на тех обслуживанность, оставайтесь в донах.')
        }</p>
        <div class="footer-note">
            Муринопедия — 2026. Ч илу 
            <span class="don-word" onclick="showHint()">дон</span>ой, пока естч светл.
        </div>
    </div>
    <div id="hint">
        скачай или посмотри на <a href="https://github.com/pap3ryyy/murinoCDDon/raw/main/murino-cd-don.vercel.app.gif" target="_blank">ссылку гифки</a>
    </div>
    <script>
        function showHint() {
            document.getElementById('hint').style.display = 'block';
        }
        document.addEventListener('click', function(e) {
            if (!e.target.classList.contains('don-word')) {
                document.getElementById('hint').style.display = 'none';
            }
        });
    </script>
</body>`;

    document.documentElement.innerHTML = content;
})();
