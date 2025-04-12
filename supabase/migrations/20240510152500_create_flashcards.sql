-- migration: create flashcards table
-- description: creates the flashcards table with row level security policies
-- date: 2024-05-10

-- create custom type for difficulty rating
create type difficulty_rating as enum ('nie_pamietam', 'trudne', 'srednie', 'latwe');

-- create flashcards table
create table if not exists flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  front_content varchar(500) not null check (length(front_content) <= 500),
  back_content varchar(200) not null check (length(back_content) <= 200),
  created_at timestamp with time zone default now(),
  is_ai_generated boolean not null default false,
  correct_answers_count integer not null default 0
);

-- create indexes for performance
create index idx_flashcards_user_id on flashcards(user_id);
create index idx_flashcards_created_at on flashcards(created_at);

-- enable row level security
alter table flashcards enable row level security;

-- create row level security policies

-- anon role cannot access any flashcards
create policy "anon cannot select flashcards" 
  on flashcards for select 
  to anon
  using (false);

create policy "anon cannot insert flashcards" 
  on flashcards for insert 
  to anon
  with check (false);

create policy "anon cannot update flashcards" 
  on flashcards for update 
  to anon
  using (false);

create policy "anon cannot delete flashcards" 
  on flashcards for delete 
  to anon
  using (false);

-- authenticated users can only access their own flashcards
create policy "users can select their own flashcards" 
  on flashcards for select 
  to authenticated
  using (user_id = auth.uid());

create policy "users can insert their own flashcards" 
  on flashcards for insert 
  to authenticated
  with check (user_id = auth.uid());

create policy "users can update their own flashcards" 
  on flashcards for update 
  to authenticated
  using (user_id = auth.uid());

create policy "users can delete their own flashcards" 
  on flashcards for delete 
  to authenticated
  using (user_id = auth.uid()); 