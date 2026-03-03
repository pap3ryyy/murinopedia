const SB_URL = "https://rvykoymrumzgkgbwdefm.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2eWtveW1ydW16Z2tnYndkZWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMTcxMjksImV4cCI6MjA4Njc5MzEyOX0.4vBw0N_f8Xtr7P8HQd4tPG90m2fuulRGAqRO-K3lZ-M";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

(async function() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return;

    const { data: user } = await supabaseClient
        .from('users')
        .select('is_banned')
        .eq('id', session.user.id)
        .single();

    const path = window.location.pathname;
    const isBannedPage = path.includes('banned.html');

    if (user && user.is_banned) {
        if (!isBannedPage) {
            window.location.href = 'banned.html';
        }
    } else if (isBannedPage) {
        window.location.href = 'index.html';
    }
})();
