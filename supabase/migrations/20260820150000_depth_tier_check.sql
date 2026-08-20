-- The add-someone flow settled the tier vocabulary, so the promised
-- check constraint from the initial schema lands now. The client-side
-- counterpart is TIERS in src/lib/friends.js — change both or neither.

alter table people
  add constraint people_depth_tier_check
  check (depth_tier in ('childhood', 'uni', 'adult', 'new'));
