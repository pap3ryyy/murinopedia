window.MurinoFM = (function () {
    let currentTrack = null, audio = null, isRepeat = false, playerEl = null

    function createPlayer() {
        if (document.getElementById('murino-fm-player')) return
        playerEl = document.createElement('div')
        playerEl.id = 'murino-fm-player'
        playerEl.style.cssText = [
            'position:fixed;bottom:0;left:0;right:0',
            'background:#1c1c1f;border-top:2px solid #3366cc',
            'padding:8px 16px;display:flex;align-items:center;gap:12px',
            'z-index:9000;font-family:sans-serif;font-size:0.83em;color:#e4e4e7',
            'transform:translateY(100%);transition:transform 0.3s ease'
        ].join(';')
        playerEl.innerHTML = `
            <div style="min-width:160px;flex:1;overflow:hidden;">
                <div id="fmp-title" style="font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></div>
                <div id="fmp-author" style="font-size:0.8em;color:#a1a1aa;"></div>
            </div>
            <button onclick="MurinoFM.toggle()" id="fmp-play" style="background:#3366cc;border:none;color:#fff;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:0.9em;display:flex;align-items:center;justify-content:center;">▶</button>
            <button onclick="MurinoFM.toggleRepeat()" id="fmp-repeat" style="background:none;border:none;color:#a1a1aa;cursor:pointer;font-size:1em;" title="Повтор">🔁</button>
            <span id="fmp-cur" style="font-size:0.78em;color:#a1a1aa;min-width:32px;">0:00</span>
            <div id="fmp-bar" style="flex:2;height:4px;background:#3f3f46;cursor:pointer;border-radius:2px;" onclick="MurinoFM.seek(event)">
                <div id="fmp-fill" style="height:100%;background:#3366cc;border-radius:2px;width:0%;"></div>
            </div>
            <span id="fmp-dur" style="font-size:0.78em;color:#a1a1aa;min-width:32px;">0:00</span>
            <span style="color:#a1a1aa;font-size:0.85em;">🔊</span>
            <input type="range" id="fmp-vol" min="0" max="1" step="0.05" value="0.8" style="width:60px;cursor:pointer;" oninput="MurinoFM.setVolume(this.value)">
            <button onclick="MurinoFM.close()" style="background:none;border:none;color:#a1a1aa;cursor:pointer;font-size:1em;">✕</button>
        `
        document.body.style.paddingBottom = '52px'
        document.body.appendChild(playerEl)
        setTimeout(() => { playerEl.style.transform = 'translateY(0)' }, 50)
    }

    function fmt(s) { if (!s || isNaN(s)) return '0:00'; const m = Math.floor(s / 60), sc = Math.floor(s % 60); return m + ':' + (sc < 10 ? '0' : '') + sc }

    function play(track) {
        if (audio) { audio.pause(); audio = null }
        currentTrack = track
        createPlayer()
        document.getElementById('fmp-title').textContent = track.title
        document.getElementById('fmp-author').textContent = '@' + track.author
        audio = new Audio(track.file_url)
        audio.volume = parseFloat(document.getElementById('fmp-vol')?.value || 0.8)
        audio.addEventListener('loadedmetadata', () => { document.getElementById('fmp-dur').textContent = fmt(audio.duration) })
        audio.addEventListener('timeupdate', () => {
            if (!audio.duration) return
            document.getElementById('fmp-fill').style.width = (audio.currentTime / audio.duration * 100) + '%'
            document.getElementById('fmp-cur').textContent = fmt(audio.currentTime)
        })
        audio.addEventListener('ended', () => {
            if (isRepeat) { audio.currentTime = 0; audio.play() }
            else { const b = document.getElementById('fmp-play'); if (b) b.textContent = '▶' }
        })
        audio.play()
        const b = document.getElementById('fmp-play'); if (b) b.textContent = '⏸'
    }

    function toggle() {
        if (!audio) return
        if (audio.paused) { audio.play(); document.getElementById('fmp-play').textContent = '⏸' }
        else { audio.pause(); document.getElementById('fmp-play').textContent = '▶' }
    }

    function toggleRepeat() {
        isRepeat = !isRepeat
        const b = document.getElementById('fmp-repeat'); if (b) b.style.color = isRepeat ? '#3366cc' : '#a1a1aa'
    }

    function seek(e) {
        if (!audio || !audio.duration) return
        const rect = e.currentTarget.getBoundingClientRect()
        audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration
    }

    function setVolume(v) { if (audio) audio.volume = parseFloat(v) }

    function getCurrentTime() { return audio ? audio.currentTime : null }

    function close() {
        if (audio) { audio.pause(); audio = null }
        if (playerEl) { playerEl.style.transform = 'translateY(100%)'; setTimeout(() => { playerEl?.remove(); playerEl = null }, 300) }
        document.body.style.paddingBottom = ''
        currentTrack = null
    }

    return { play, toggle, toggleRepeat, seek, setVolume, close, getCurrentTime, getAudio: () => audio }
})()
