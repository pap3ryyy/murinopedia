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
        const vid = document.createElement('video')
        vid.src = videoUrl
        vid.autoplay = true
        vid.loop = true
        vid.muted = false
        vid.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;object-fit:fill;z-index:99999;'
        document.body.appendChild(vid)

        vid.play().catch(() => {
            vid.muted = true
            vid.play()
            document.addEventListener('click', function() {
                vid.muted = false
                vid.volume = 1
            }, { once: true })
            document.addEventListener('keydown', function() {
                vid.muted = false
                vid.volume = 1
            }, { once: true })
            document.addEventListener('scroll', function() {
                vid.muted = false
                vid.volume = 1
            }, { once: true })
        })

        const targets = document.querySelectorAll('main, aside, header, footer, .article-card, .nav-card, .comment, .sidebar-box')
        targets.forEach(el => {
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
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEasterEgg)
    } else {
        initEasterEgg()
    }
})()
