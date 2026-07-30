create table if not exists profiles(
 id uuid primary key references auth.users(id) on delete cascade,
 role text default 'collector',
 created_at timestamptz default now()
);
create table if not exists notifications(
 id uuid primary key default gen_random_uuid(),
 user_id uuid references profiles(id),
 message text,
 created_at timestamptz default now()
);
