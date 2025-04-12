-- migration: create flashcard_reviews table
-- description: creates the flashcard_reviews table with row level security policies
-- date: 2024-05-10

-- create flashcard_reviews table
create table if not exists flashcard_reviews (
  id uuid primary key default gen_random_uuid(),
  flashcard_id uuid not null references flashcards(id) on delete cascade,
  review_date timestamp with time zone not null default now(),
  is_correct boolean not null,
  difficulty_rating difficulty_rating not null,
  next_review_date timestamp with time zone not null
);

-- create indexes for performance
create index idx_flashcard_reviews_flashcard_id on flashcard_reviews(flashcard_id);
create index idx_flashcard_reviews_next_review_date on flashcard_reviews(next_review_date);
create index idx_flashcard_reviews_review_date on flashcard_reviews(review_date);

-- enable row level security
alter table flashcard_reviews enable row level security;

-- create row level security policies

-- anon role cannot access any flashcard reviews
create policy "anon cannot select flashcard_reviews" 
  on flashcard_reviews for select 
  to anon
  using (false);

create policy "anon cannot insert flashcard_reviews" 
  on flashcard_reviews for insert 
  to anon
  with check (false);

create policy "anon cannot update flashcard_reviews" 
  on flashcard_reviews for update 
  to anon
  using (false);

create policy "anon cannot delete flashcard_reviews" 
  on flashcard_reviews for delete 
  to anon
  using (false);

-- authenticated users can only access reviews for flashcards they own
create policy "users can select reviews for their flashcards" 
  on flashcard_reviews for select 
  to authenticated
  using (flashcard_id in (select id from flashcards where user_id = auth.uid()));

create policy "users can insert reviews for their flashcards" 
  on flashcard_reviews for insert 
  to authenticated
  with check (flashcard_id in (select id from flashcards where user_id = auth.uid()));

create policy "users can update reviews for their flashcards" 
  on flashcard_reviews for update 
  to authenticated
  using (flashcard_id in (select id from flashcards where user_id = auth.uid()));

create policy "users can delete reviews for their flashcards" 
  on flashcard_reviews for delete 
  to authenticated
  using (flashcard_id in (select id from flashcards where user_id = auth.uid())); 