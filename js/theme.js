(async function() {
    const { data: { session } } = await supabaseClient.auth.getSession()
    if (!session) return
    const { data: user } = await supabaseClient
        .from('users').select('theme').eq('id', session.user.id).single()
    if (user && user.theme === 'dark') {
        document.body.classList.add('dark')
    }
})()
