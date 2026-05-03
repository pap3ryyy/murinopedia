## гайд по запуску Муринопедии (pap3ryyy, 4 мая 2026)

код — говнокод. проект легендарный но поддерживать я его больше не буду (но не факт), но вы можете поднять копию. Всё ниже написано предельно прямо, без украшений. Местами будет больно, но оно работает. (если нихуя не понятно спросите нейронку мне просто похуй ну или напишите в личку или в приватный чат муринопедии если имеете я вам помогу)

---

### 1. Что нужно

- аккаунт на [Supabase](https://supabase.com) (бесплатного достаточно)  
- сами файлы Муринопедии (форкните репу или скачайте zip)  
- уметь открыть SQL Editor в Supabase и вставить большую портянку кода  

---

### 2. Создайте проект в Supabase

Заходите, жмёте New project, даёте имя, придумываете пароль базы, выбираете ближайший регион. Ждёте пару минут.

---

### 3. Настройте авторизацию в Supabase
Сначала зайдите в Supabase → Authentication → Settings и в поле Site URL временно поставьте любой адрес, например http://localhost. Это нужно, чтобы сохранить настройки, но позже вы замените его на реальный URL сайта.

После того как вы выложите сайт в интернет (шаг 7) и получите публичную ссылку, вернитесь сюда и замените:

Site URL: https://ваш-сайт.vercel.app (или ваш GitHub Pages)

Redirect URLs: добавьте этот же адрес и его же с /** (например, https://ваш-сайт.vercel.app/**)

Без финальной замены авторизация не заработает — вы просто не сможете войти.


---

### 4. Воссоздайте структуру базы (единый SQL)

Скопируйте блок ниже целиком, вставьте в Supabase → **SQL Editor** → **New query**, нажмите **Run**.  
Создадутся все таблицы, типы, триггер для авто-регистрации юзеров и начальная конфигурация.

```sql
-- МУРИНОПЕДИЯ: СТРУКТУРА БАЗЫ
-- Выполните всё за один раз

-- пользователи (расширяет auth.users)
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  username text not null,
  role text default 'людич' check (role in ('людич','м.с.в.проверкость','м.с.в.содрунник','м.с.в.основательность')),
  is_banned boolean default false,
  banned_by text,
  ban_reason text,
  ban_until timestamptz,
  avatar_url text,
  bio text default '',
  previous_usernames jsonb default '[]'::jsonb,
  public_id serial unique,
  banner_url text,
  name_color text,
  profile_bg text,
  title text,
  avatar_border text default '3px solid #202122',
  pinned_article_id bigint,
  last_seen timestamptz,
  theme text default 'light',
  banned_until timestamptz,
  force_rename boolean default false,
  equipped_badges jsonb default '[]'::jsonb
);

-- статьи
create table if not exists articles (
  id bigserial primary key,
  created_at timestamptz default now(),
  title text not null,
  tag text,
  description text,
  content text,
  author text,
  status text default 'pending' check (status in ('pending','published','rejected')),
  slug text,
  infobox jsonb default '[]'::jsonb,
  image_url text,
  likes_count bigint default 0,
  views_count bigint default 0,
  pinned boolean default false,
  reviewed_by text,
  reviewed_at timestamptz,
  cover_url text,
  code_blocks jsonb default '[]'::jsonb,
  private boolean default false,
  season text
);

-- комментарии к статьям
create table if not exists comments (
  id bigserial primary key,
  created_at timestamptz default now(),
  article_id bigint references articles(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  username text,
  content text,
  parent_id bigint references comments(id) on delete cascade,
  deleted boolean default false
);

-- лайки комментариев
create table if not exists likes (
  id bigserial primary key,
  comment_id bigint references comments(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  unique(comment_id, user_id)
);

-- лайки статей
create table if not exists article_likes (
  article_id bigint references articles(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  primary key (article_id, user_id)
);

-- просмотры статей
create table if not exists article_views (
  article_id bigint references articles(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (article_id, user_id)
);

-- значки
create table if not exists badges (
  id bigserial primary key,
  name text not null,
  description text,
  icon_url text,
  created_at timestamptz default now(),
  how_to_get text,
  rarity text check (rarity in ('common','rare','legendary')),
  max_supply bigint,
  current_supply bigint default 0,
  transferable boolean default true,
  last_emission_at timestamptz
);

-- рынок значков
create table if not exists badge_market (
  id bigserial primary key,
  seller_id uuid references users(id) on delete cascade,
  badge_id bigint references badges(id) on delete cascade,
  price numeric not null,
  is_emission boolean default false,
  created_at timestamptz default now(),
  amount bigint default 1
);

-- история цен на рынке
create table if not exists badge_prices (
  id bigserial primary key,
  badge_id bigint references badges(id) on delete cascade,
  price numeric not null,
  sold_at timestamptz default now(),
  buyer_id uuid references users(id),
  seller_id uuid references users(id)
);

-- муринский словарь
create table if not exists dictionary (
  id bigserial primary key,
  russian text not null,
  murino text not null,
  author_id uuid references users(id) on delete set null,
  author_username text,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  reject_reason text,
  created_at timestamptz default now()
);

-- пасхалки
create table if not exists easter_eggs (
  id bigserial primary key,
  target_user_id uuid references users(id) on delete cascade,
  triggered_by uuid references users(id) on delete cascade,
  video_url text not null,
  active boolean default true,
  created_at timestamptz default now()
);

-- уведомления
create table if not exists notifications (
  id bigserial primary key,
  user_id uuid references users(id) on delete cascade,
  type text,
  message text not null,
  link text,
  read boolean default false,
  created_at timestamptz default now()
);

-- глобальные оповещения на сайте
create table if not exists site_alerts (
  id uuid primary key default gen_random_uuid(),
  type text check (type in ('warn','info','danger')),
  message text not null,
  active boolean default true,
  created_at timestamptz default now()
);

-- конфигурация сайта
create table if not exists site_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now(),
  mode text,
  reason text
);
insert into site_config (key, value) values ('maintenance', 'false'::jsonb)
on conflict (key) do update set value = 'false'::jsonb;

-- музыкальные треки
create table if not exists tracks (
  id bigserial primary key,
  title text not null,
  author text,
  mashup_source text,
  file_url text not null,
  file_type text,
  cover_url text,
  duration bigint,
  likes_count bigint default 0,
  plays_count bigint default 0,
  status text default 'pending' check (status in ('pending','published','rejected')),
  uploaded_by text,
  created_at timestamptz default now(),
  trim_watermark boolean default false
);

-- комментарии к трекам
create table if not exists track_comments (
  id bigserial primary key,
  track_id bigint references tracks(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  username text,
  content text,
  timestamp_sec bigint default 0,
  created_at timestamptz default now()
);

-- лайки треков
create table if not exists track_likes (
  track_id bigint references tracks(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  primary key (track_id, user_id)
);

-- просмотры треков
create table if not exists track_views (
  track_id bigint references tracks(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  primary key (track_id, user_id)
);

-- прослушивания треков
create table if not exists track_plays (
  id bigserial primary key,
  track_id bigint references tracks(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  played_at timestamptz default now()
);

-- транзакции
create table if not exists transactions (
  id bigserial primary key,
  user_id uuid references users(id) on delete cascade,
  amount numeric not null,
  type text check (type in ('purchase','sale')),
  description text,
  created_at timestamptz default now()
);

-- кошелёк
create table if not exists wallets (
  user_id uuid primary key references users(id) on delete cascade,
  balance numeric default 50,
  total_earned numeric default 0,
  total_spent numeric default 0,
  updated_at timestamptz default now()
);

-- значки у пользователей
create table if not exists user_badges (
  id bigserial primary key,
  user_id uuid references users(id) on delete cascade,
  badge_id bigint references badges(id) on delete cascade,
  granted_by text,
  granted_at timestamptz default now(),
  acquired_at timestamptz,
  acquired_price numeric
);

-- авто-создание профиля и кошелька после регистрации
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', 'Людич_' || substring(new.id::text,1,8)));
  insert into public.wallets (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

---

### 5. Включите RLS (защита от повторения старых взломов)

После предыдущего шага таблицы созданы, но политики безопасности не настроены. Без RLS любой, кто знает URL и ключ, может читать/писать всё подряд. Меня так уже ломали, поэтому дальше обязательно.

Скопируйте второй блок ниже, вставьте в новый запрос SQL Editor и выполните.  
**Я эти политики не проверял** — возможности запустить базу сейчас нет. По идее должны работать. Если что-то сломается (например, не сможете создать статью) — ищите ошибку в условии политики или на время отключите RLS для конкретной таблицы.

```sql
-- RLS: базовые политики доступа
-- Включаем RLS для всех таблиц
alter table users enable row level security;
alter table articles enable row level security;
alter table comments enable row level security;
alter table likes enable row level security;
alter table article_likes enable row level security;
alter table article_views enable row level security;
alter table badges enable row level security;
alter table badge_market enable row level security;
alter table badge_prices enable row level security;
alter table dictionary enable row level security;
alter table easter_eggs enable row level security;
alter table notifications enable row level security;
alter table site_alerts enable row level security;
alter table site_config enable row level security;
alter table tracks enable row level security;
alter table track_comments enable row level security;
alter table track_likes enable row level security;
alter table track_views enable row level security;
alter table track_plays enable row level security;
alter table transactions enable row level security;
alter table wallets enable row level security;
alter table user_badges enable row level security;

-- ========= users =========
-- каждый видит всех (для упоминаний, профилей)
create policy "users_select" on users for select using (true);
-- обновлять может только владелец или основатель/содрунник
create policy "users_update" on users for update to authenticated
  using (id = auth.uid() or (select role from users where id = auth.uid()) in ('м.с.в.содрунник','м.с.в.основательность'));

-- ========= articles =========
-- все видят опубликованные и приватные, если автор или админ
create policy "articles_select" on articles for select
  using (status = 'published' or author = (select username from users where id = auth.uid()) or (select role from users where id = auth.uid()) in ('м.с.в.проверкость','м.с.в.содрунник','м.с.в.основательность'));
-- создавать могут только залогиненные
create policy "articles_insert" on articles for insert to authenticated with check (true);
-- обновлять может автор или админ
create policy "articles_update" on articles for update to authenticated
  using (author = (select username from users where id = auth.uid()) or (select role from users where id = auth.uid()) in ('м.с.в.проверкость','м.с.в.содрунник','м.с.в.основательность'));
-- удалять только админ
create policy "articles_delete" on articles for delete to authenticated
  using ((select role from users where id = auth.uid()) in ('м.с.в.содрунник','м.с.в.основательность'));

-- ========= comments =========
create policy "comments_select" on comments for select using (true);
create policy "comments_insert" on comments for insert to authenticated with check (true);
create policy "comments_update" on comments for update to authenticated
  using (user_id = auth.uid() or (select role from users where id = auth.uid()) in ('м.с.в.содрунник','м.с.в.основательность'));
create policy "comments_delete" on comments for delete to authenticated
  using (user_id = auth.uid() or (select role from users where id = auth.uid()) in ('м.с.в.содрунник','м.с.в.основательность'));

-- ========= likes =========
create policy "likes_select" on likes for select using (true);
create policy "likes_insert" on likes for insert to authenticated with check (user_id = auth.uid());
create policy "likes_delete" on likes for delete to authenticated using (user_id = auth.uid());

-- ========= article_likes =========
create policy "article_likes_select" on article_likes for select using (true);
create policy "article_likes_insert" on article_likes for insert to authenticated with check (user_id = auth.uid());
create policy "article_likes_delete" on article_likes for delete to authenticated using (user_id = auth.uid());

-- ========= article_views =========
create policy "article_views_select" on article_views for select using (true);
create policy "article_views_insert" on article_views for insert to authenticated with check (user_id = auth.uid());

-- ========= badges =========
create policy "badges_select" on badges for select using (true);

-- ========= badge_market =========
create policy "badge_market_select" on badge_market for select using (true);
create policy "badge_market_insert" on badge_market for insert to authenticated with check (seller_id = auth.uid());

-- ========= badge_prices =========
create policy "badge_prices_select" on badge_prices for select using (true);

-- ========= dictionary =========
create policy "dictionary_select" on dictionary for select using (true);
create policy "dictionary_insert" on dictionary for insert to authenticated with check (true);
create policy "dictionary_update" on dictionary for update to authenticated using ((select role from users where id = auth.uid()) in ('м.с.в.содрунник','м.с.в.основательность'));

-- ========= easter_eggs =========
create policy "easter_eggs_select" on easter_eggs for select using (true);

-- ========= notifications =========
create policy "notifications_select" on notifications for select using (user_id = auth.uid());

-- ========= site_alerts =========
create policy "site_alerts_select" on site_alerts for select using (true);

-- ========= site_config =========
create policy "site_config_select" on site_config for select using (true);

-- ========= tracks =========
create policy "tracks_select" on tracks for select using (status = 'published' or uploaded_by = (select username from users where id = auth.uid()) or (select role from users where id = auth.uid()) in ('м.с.в.содрунник','м.с.в.основательность'));
create policy "tracks_insert" on tracks for insert to authenticated with check (true);
create policy "tracks_update" on tracks for update to authenticated
  using (uploaded_by = (select username from users where id = auth.uid()) or (select role from users where id = auth.uid()) in ('м.с.в.содрунник','м.с.в.основательность'));

-- ========= track_comments =========
create policy "track_comments_select" on track_comments for select using (true);
create policy "track_comments_insert" on track_comments for insert to authenticated with check (user_id = auth.uid());

-- ========= track_likes =========
create policy "track_likes_select" on track_likes for select using (true);
create policy "track_likes_insert" on track_likes for insert to authenticated with check (user_id = auth.uid());
create policy "track_likes_delete" on track_likes for delete to authenticated using (user_id = auth.uid());

-- ========= track_views =========
create policy "track_views_select" on track_views for select using (true);
create policy "track_views_insert" on track_views for insert to authenticated with check (user_id = auth.uid());

-- ========= track_plays =========
create policy "track_plays_select" on track_plays for select using (true);
create policy "track_plays_insert" on track_plays for insert to authenticated with check (user_id = auth.uid());

-- ========= transactions =========
create policy "transactions_select" on transactions for select using (user_id = auth.uid());

-- ========= wallets =========
create policy "wallets_select" on wallets for select using (user_id = auth.uid());

-- ========= user_badges =========
create policy "user_badges_select" on user_badges for select using (true);
```

Если после этого что-то не работает, проще всего временно отключить RLS для проблемной таблицы (Table Editor → таблица → три точки → Disable RLS) и разбираться позже. (но я нихуя не знаю)

---

### 6. Пропишите ключи доступа

В панели Supabase → **Settings** → **API** (или куда-то туда бля посмотрите спросите у нейронки я уже не помню) скопируйте:

- Project URL (это ваш `SB_URL`)
- `anon` public key (это `SB_KEY`)

Откройте в репозитории файл `js/config.js` и замените две строки:

```js
const SB_URL = "https://ваш-проект.supabase.co";
const SB_KEY = "ваш-длинный-ключ";
```

Остальное в `config.js` не трогайте.

---

Понял, бро, моя вина — это была заметка для меня, а не для текста гайда. В готовом README, конечно, всё будет от твоего лица. Вот исправленный блок, который пойдёт в файл. Никаких «автор сказал» — просто ты рассказываешь, как сам поднимал сайт.

---

### 7. Как выложить сайт в интернет

Я хостил на GitHub Pages и никогда не проверял локально. Просто заливал файлы в репозиторий, включал Pages, и через минуту сайт обновлялся в сети. Иногда я пушил сломанный код, и он тоже мгновенно уходил в прод. Если ты хочешь так же — вот как это делается.

#### GitHub Pages (мой способ)

1. Форкни этот репозиторий к себе на GitHub.
2. Убедись, что index.html, папки js, css, asset и всё остальное лежат прямо в корне репозитория, а не во вложенной папке.
3. Зайди в настройки репозитория → **Settings** → **Pages**.
4. В разделе «Branch» выбери `main`, папка `/ (root)`, нажми **Save**.
5. Через пару минут GitHub выдаст ссылку типа `https://твой-юзернейм.github.io/название-репозитория`. Это и есть сайт.
6. Эту ссылку вставь в Supabase в **Authentication → Settings → Site URL**, а также добавь в **Redirect URLs** с `/**` (например, `https://твой-юзернейм.github.io/название-репозитория/**`).

Готово. После каждого пуша в репозиторий сайт обновляется сам. Если сломал — откатываешь коммит или пушишь исправление.

#### Vercel (если не хочешь светить никнейм или нужно быстрее)

Это тоже бесплатно и без консоли.

1. Зарегистрируйся на [Vercel](https://vercel.com) через GitHub.
2. Нажми **Add New Project**, выбери репозиторий с Муринопедией.
3. Vercel сам поймёт, что это статический сайт. В настройках деплоя оставь Build Command и Output Directory пустыми (или поставь `.` в Output Directory).
4. Нажми **Deploy**. Через полминуты сайт будет доступен по ссылке `*.vercel.app`.
5. Эту ссылку пропиши в Supabase (Site URL и Redirect URLs с `/**`).

Vercel тоже автоматически обновляет сайт при пушах. Плюс — URL чище, без `github.io`.

Оба варианта работают без локального сервера и командной строки. Я выбрал GitHub Pages, потому что мне было лень куда-то ещё заходить. Ты можешь выбрать Vercel, если хочешь чуть более плавный деплой. Главное — после заливки сайта зарегистрируйся и выдай себе роль `м.с.в.основательность`, как описано в шаге 8.

---

### 8. Станьте администратором

После запуска зарегистрируйтесь через кнопку «Войти».  
Зайдите в Supabase → Table Editor → таблица `users`, найдите свою запись и смените `role` на `м.с.в.основательность`.  
Теперь у вас полный доступ: создание статей без проверки, выдача значков, бан Фога.

---

### 9. Что нужно знать про этот код

Этот говнокод — полная свалка из рабочего и неиспользуемого говна. Не удивляйтесь, если что-то ведёт себя странно: порой я сам забывал, как оно работает. Я почти никогда не вырезал старое, поэтому даже в `js/` лежит ненужный мусор, а папка `unused` существует, но я уже не помню зачем.

Код писался на коленке, без нормальной архитектуры, местами дублируется, местами противоречит сам себе. Но при этом он как-то держал целую вселенную с лайками, рынком значков, радио и армией. Если вы полезете внутрь — готовьтесь к боли.

Тем не менее, на момент написания этого гайда оно работало. Если что-то отвалилось — скорее всего из-за изменений в Supabase или потому что я забыл какую-то мелочь. Чините сами.

Муринопедия ваша. Делайте с ней что хотите но пожалуйста укажите меня как автора исходного кода и проекта иначе вы нарушаете лицензию.
