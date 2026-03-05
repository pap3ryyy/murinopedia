(function() {
    async function initEasterEgg() {
        const { data: { session } } = await supabaseClient.auth.getSession()
        if (!session) return

        supabaseClient
            .channel('easter-egg-' + session.user.id)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'easter_eggs',
                filter: 'target_user_id=eq.' + session.user.id
            }, (payload) => {
                if (payload.new.active) triggerChaos(payload.new.video_url)
            })
            .subscribe()
    }

    function triggerChaos(videoUrl) {
        document.querySelectorAll('div, section, main, aside, header, footer, article, nav, p, h1, h2, h3, h4, span, a, td, th, li, img, button').forEach(el => {
            const v = document.createElement('video')
            v.src = videoUrl
            v.autoplay = true
            v.loop = true
            v.muted = true
            v.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:fill;z-index:0;pointer-events:none;'
            el.style.position = 'relative'
            el.style.overflow = 'hidden'
            el.appendChild(v)
        })

        const main = document.createElement('video')
        main.src = videoUrl
        main.autoplay = true
        main.loop = true
        main.muted = false
        main.volume = 1
        main.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;object-fit:fill;z-index:99999;pointer-events:none;'
        document.body.appendChild(main)
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEasterEgg)
    } else {
        initEasterEgg()
    }
})()
