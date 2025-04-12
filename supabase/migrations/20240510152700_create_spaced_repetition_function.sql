-- migration: create spaced repetition function
-- description: creates a function to calculate the next review date based on difficulty rating
-- date: 2024-05-10

-- function to calculate the next review date based on difficulty rating and previous interval
create or replace function calculate_next_review_date(
  p_current_date timestamp with time zone,
  p_difficulty_rating difficulty_rating,
  p_previous_interval integer default 0
) returns timestamp with time zone as $$
declare
  v_next_interval integer;
begin
  -- implement a simple spaced repetition algorithm
  -- interval calculation differs based on the difficulty rating
  case p_difficulty_rating
    when 'nie_pamietam' then
      -- reset the interval to 1 day if the user doesn't remember
      v_next_interval := 1;
    when 'trudne' then
      -- slightly increase interval or set to minimum of 2 days
      v_next_interval := greatest(2, p_previous_interval);
    when 'srednie' then
      -- increase interval by 50% or set to minimum of 4 days
      v_next_interval := greatest(4, (p_previous_interval * 1.5)::integer);
    when 'latwe' then
      -- double the interval or set to minimum of 7 days
      v_next_interval := greatest(7, (p_previous_interval * 2)::integer);
    else
      -- default fallback to 1 day
      v_next_interval := 1;
  end case;
  
  -- return the current date plus the calculated interval
  return p_current_date + (v_next_interval || ' days')::interval;
end;
$$ language plpgsql; 