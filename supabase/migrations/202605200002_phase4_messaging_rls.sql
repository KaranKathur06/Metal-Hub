-- Phase 4: Fix message_threads / messages RLS (profile_id join, not raw auth.uid())

drop policy if exists threads_participant on public.message_threads;
drop policy if exists "threads_participant" on public.message_threads;

create policy message_threads_participant_select on public.message_threads
  for select using (
    exists (
      select 1 from public.buyer_profiles bp
      where bp.id = message_threads.buyer_profile_id
        and bp.profile_id = auth.uid()
    )
    or exists (
      select 1 from public.seller_profiles sp
      where sp.id = message_threads.seller_profile_id
        and sp.profile_id = auth.uid()
    )
  );

create policy message_threads_participant_insert on public.message_threads
  for insert with check (
    exists (
      select 1 from public.buyer_profiles bp
      where bp.id = message_threads.buyer_profile_id
        and bp.profile_id = auth.uid()
    )
    or exists (
      select 1 from public.seller_profiles sp
      where sp.id = message_threads.seller_profile_id
        and sp.profile_id = auth.uid()
    )
  );

create policy message_threads_participant_update on public.message_threads
  for update using (
    exists (
      select 1 from public.buyer_profiles bp
      where bp.id = message_threads.buyer_profile_id
        and bp.profile_id = auth.uid()
    )
    or exists (
      select 1 from public.seller_profiles sp
      where sp.id = message_threads.seller_profile_id
        and sp.profile_id = auth.uid()
    )
  );

drop policy if exists messages_thread_participant on public.messages;
drop policy if exists "messages_thread_participant" on public.messages;

create policy messages_thread_participant_select on public.messages
  for select using (
    exists (
      select 1 from public.message_threads t
      where t.id = messages.thread_id
        and (
          exists (
            select 1 from public.buyer_profiles bp
            where bp.id = t.buyer_profile_id and bp.profile_id = auth.uid()
          )
          or exists (
            select 1 from public.seller_profiles sp
            where sp.id = t.seller_profile_id and sp.profile_id = auth.uid()
          )
        )
    )
  );

create policy messages_thread_participant_insert on public.messages
  for insert with check (
    exists (
      select 1 from public.message_threads t
      where t.id = messages.thread_id
        and (
          exists (
            select 1 from public.buyer_profiles bp
            where bp.id = t.buyer_profile_id and bp.profile_id = auth.uid()
          )
          or exists (
            select 1 from public.seller_profiles sp
            where sp.id = t.seller_profile_id and sp.profile_id = auth.uid()
          )
        )
    )
    and sender_id = auth.uid()
  );

create policy messages_thread_participant_update on public.messages
  for update using (
    exists (
      select 1 from public.message_threads t
      where t.id = messages.thread_id
        and (
          exists (
            select 1 from public.buyer_profiles bp
            where bp.id = t.buyer_profile_id and bp.profile_id = auth.uid()
          )
          or exists (
            select 1 from public.seller_profiles sp
            where sp.id = t.seller_profile_id and sp.profile_id = auth.uid()
          )
        )
    )
  );
