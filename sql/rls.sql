alter table profiles enable row level security;
alter table notifications enable row level security;

create policy "profile self access" on profiles
for select using(auth.uid()=id);

create policy "notification self access" on notifications
for select using(auth.uid()=user_id);
