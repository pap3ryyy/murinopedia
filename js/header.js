(async function() {
    const MSV_ROLES = ['м.с.в.проверкость', 'м.с.в.содрунник', 'м.с.в.основательность']

    const headerEl = document.querySelector('header')
    if (!headerEl) return

    headerEl.innerHTML = `
        <div class="logo-area">
            <img src="asset/logo.png" alt="М.С.В." class="logo-img">
            <a href="index.html" class="logo-text">Муринопедия</a>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
            <div class="status-bar" id="db-status">
                Оперативная обстановка: <span style="color: #d33; font-weight: bold;">СТАБИЛЬНАЯ</span>
            </div>
            <div id="header-user-zone" style="font-size:0.85em;color:#54595d;display:flex;align-items:center;gap:8px;"></div>
        </div>
    `

    const style = document.createElement('style')
    style.textContent = `
        .notif-btn {
            position: relative;
            background: none;
            border: 1px solid #a2a9b1;
            cursor: pointer;
            padding: 3px 8px;
            border-radius: 2px;
            font-size: 1em;
            background: #f8f9fa;
            line-height: 1;
        }
        .notif-btn:hover { background: #eaecf0; }
        .notif-badge {
            position: absolute;
            top: -6px;
            right: -6px;
            background: #d33;
            color: #fff;
            font-size: 0.65em;
            font-weight: bold;
            border-radius: 10px;
            padding: 1px 4px;
            min-width: 16px;
            text-align: center;
            line-height: 1.4;
            pointer-events: none;
        }
        .notif-dropdown {
            position: absolute;
            top: calc(100% + 6px);
            right: 0;
            width: 320px;
            background: #fff;
            border: 1px solid #a2a9b1;
            box-shadow: 0 4px 12px rgba(0,0,0,0.12);
            z-index: 1000;
            display: none;
            max-height: 420px;
            overflow-y: auto;
        }
        .notif-dropdown.open { display: block; }
        .notif-header {
            padding: 8px 12px;
            border-bottom: 1px solid #eaecf0;
            font-size: 0.82em;
            font-weight: bold;
            color: #54595d;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .notif-item {
            padding: 10px 12px;
            border-bottom: 1px solid #eaecf0;
            font-size: 0.82em;
            cursor: pointer;
            display: flex;
            gap: 8px;
            align-items: flex-start;
        }
        .notif-item:hover { background: #f8f9fa; }
        .notif-item.unread { background: #f0f4ff; }
        .notif-item.unread:hover { background: #e8eeff; }
        .notif-dot {
            width: 8px;
            height: 8px;
            background: #3366cc;
            border-radius: 50%;
            flex-shrink: 0;
            margin-top: 3px;
        }
        .notif-dot.read { background: transparent; }
        .notif-text { flex: 1; line-height: 1.4; color: #202122; }
        .notif-time { font-size: 0.85em; color: #a2a9b1; white-space: nowrap; }
        .notif-empty { padding: 20px; text-align: center; color: #a2a9b1; font-size: 0.85em; }
        .notif-mark-all {
            font-size: 0.78em;
            color: #3366cc;
            cursor: pointer;
            background: none;
            border: none;
            padding: 0;
        }
        .notif-mark-all:hover { text-decoration: underline; }
        .notif-wrap { position: relative; }
    `
    document.head.appendChild(style)

    const { data: { session } } = await supabaseClient.auth.getSession()
    const zone = document.getElementById('header-user-zone')

    if (!session) {
        zone.innerHTML = `<a href="login.html" style="font-size:0.85em;">Войти</a>`
        return
    }

    const { data: user } = await supabaseClient
        .from('users').select('id, public_id, username, role').eq('id', session.user.id).single()

    if (!user) {
        zone.innerHTML = `<a href="login.html" style="font-size:0.85em;">Войти</a>`
        return
    }

    window._msvUser = user

    const { data: notifs } = await supabaseClient
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

    const unread = (notifs ?? []).filter(n => !n.read).length

    zone.innerHTML = `
        <div class="notif-wrap" id="notif-wrap">
            <button class="notif-btn" onclick="toggleNotifDropdown()" title="Оповещения">
                🔔
                ${unread > 0 ? `<span class="notif-badge">${unread > 99 ? '99+' : unread}</span>` : ''}
            </button>
            <div class="notif-dropdown" id="notif-dropdown">
                <div class="notif-header">
                    <span>Оповещения</span>
                    ${unread > 0 ? `<button class="notif-mark-all" onclick="markAllRead()">Отметить все</button>` : ''}
                </div>
                <div id="notif-list">
                    ${renderNotifList(notifs ?? [])}
                </div>
            </div>
        </div>
        <a href="profile.html?id=${user.public_id}" style="color:#0645ad;">${user.username}</a>
        <button onclick="headerLogout()" style="padding:3px 10px;border:1px solid #a2a9b1;background:#f8f9fa;cursor:pointer;font-size:0.85em;border-radius:2px;">Выйти</button>
    `

    const msvNav = document.getElementById('msv-nav')
    if (msvNav && MSV_ROLES.includes(user.role)) {
        msvNav.style.display = 'block'
        const navAdmin = document.getElementById('nav-admin')
        const navReview = document.getElementById('nav-review')
        if (user.role === 'м.с.в.проверкость') {
            if (navReview) navReview.style.display = 'inline'
        } else {
            if (navAdmin) navAdmin.style.display = 'inline'
            if (navReview) navReview.style.display = 'inline'
        }
    }

    const createBtn = document.getElementById('create-btn')
    if (createBtn) createBtn.style.display = 'inline-block'

    document.addEventListener('click', function(e) {
        const wrap = document.getElementById('notif-wrap')
        if (wrap && !wrap.contains(e.target)) {
            const dd = document.getElementById('notif-dropdown')
            if (dd) dd.classList.remove('open')
        }
    })

    window._notifications = notifs ?? []
})()

function renderNotifList(notifs) {
    if (!notifs.length) return '<div class="notif-empty">Нрт оповещений</div>'
    return notifs.map(n => {
        const time = new Date(n.created_at).toLocaleDateString('ru-RU')
        const item = `<div class="notif-item ${n.read ? '' : 'unread'}" onclick="openNotif(${n.id}, '${n.link ?? ''}')" id="nitem-${n.id}">
            <div class="notif-dot ${n.read ? 'read' : ''}"></div>
            <div class="notif-text">${n.message}</div>
            <div class="notif-time">${time}</div>
        </div>`
        return item
    }).join('')
}

function toggleNotifDropdown() {
    const dd = document.getElementById('notif-dropdown')
    if (dd) dd.classList.toggle('open')
}

async function openNotif(id, link) {
    await supabaseClient.from('notifications').update({ read: true }).eq('id', id)
    const item = document.getElementById('nitem-' + id)
    if (item) { item.classList.remove('unread'); item.querySelector('.notif-dot')?.classList.add('read') }

    const badge = document.querySelector('.notif-badge')
    if (badge) {
        const count = parseInt(badge.textContent) - 1
        if (count <= 0) badge.remove()
        else badge.textContent = count
    }
    if (link) window.location.href = link
}

async function markAllRead() {
    const user = window._msvUser
    if (!user) return
    await supabaseClient.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    document.querySelectorAll('.notif-item').forEach(el => {
        el.classList.remove('unread')
        el.querySelector('.notif-dot')?.classList.add('read')
    })
    const badge = document.querySelector('.notif-badge')
    if (badge) badge.remove()
    const markBtn = document.querySelector('.notif-mark-all')
    if (markBtn) markBtn.remove()
}

async function headerLogout() {
    await supabaseClient.auth.signOut()
    window.location.href = 'index.html'
}

async function sendNotification(userId, type, message, link) {
    if (!userId) return
    await supabaseClient.from('notifications').insert({
        user_id: userId,
        type,
        message,
        link: link || null,
        read: false
    })
}
