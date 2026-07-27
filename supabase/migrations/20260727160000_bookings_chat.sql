create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 60 check (duration_minutes > 0),
  subject text,
  notes text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(student_id, tutor_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists bookings_student_id_idx on public.bookings(student_id);
create index if not exists bookings_tutor_id_idx on public.bookings(tutor_id);
create index if not exists bookings_scheduled_at_idx on public.bookings(scheduled_at);
create index if not exists messages_conversation_id_created_at_idx on public.messages(conversation_id, created_at);

alter table public.bookings enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "Users view own bookings"
on public.bookings
for select
to authenticated
using (
  auth.uid() = student_id
  or auth.uid() = tutor_id
);

create policy "Students create bookings"
on public.bookings
for insert
to authenticated
with check (
  auth.uid() = student_id
);

create policy "Participants update bookings"
on public.bookings
for update
to authenticated
using (
  auth.uid() = student_id
  or auth.uid() = tutor_id
)
with check (
  auth.uid() = student_id
  or auth.uid() = tutor_id
);

create policy "Users view own conversations"
on public.conversations
for select
to authenticated
using (
  auth.uid() = student_id
  or auth.uid() = tutor_id
);

create policy "Users create own conversations"
on public.conversations
for insert
to authenticated
with check (
  auth.uid() = student_id
  or auth.uid() = tutor_id
);

create policy "Users view conversation messages"
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and (
        c.student_id = auth.uid()
        or c.tutor_id = auth.uid()
      )
  )
);

create policy "Users send conversation messages"
on public.messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and (
        c.student_id = auth.uid()
        or c.tutor_id = auth.uid()
      )
  )
);

alter publication supabase_realtime add table public.messages;
