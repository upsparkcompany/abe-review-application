# Implemented Rules

- Login keeps the desktop image's existing cover alignment at viewport height; overflowing desktop form content and short-screen mobile content must remain reachable through native scrolling.

- Keep the shared dashboard main scroller positioned so screen-reader-only loading labels remain contained within its scroll area instead of extending document overflow.

- Admin and reviewee dashboard content keeps its native scrollbar visible when needed at the viewport's right edge; preserve the centered content width and placement without hidden or custom overlay scrollbars.

- This project uses the local Supabase workflow. Put every database schema, policy, function, and privilege change in a new migration under `supabase/migrations/`.
- Existing files in `supabase/migrations/` are immutable migration history; never edit old migration files. Create new migrations through the local Supabase CLI so it generates the migration timestamp and filename rather than manually timestamping SQL files.
- Manage Reviewees invitation sends are logged in the database and atomically throttled per reviewee for one minute; failed email-provider requests do not consume the cooldown.
- Supabase Auth email delivery and Postgres logging cannot share one transaction, so invitation actions reserve the cooldown before requesting delivery and finalize the log immediately afterward; interrupted `sending` reservations conservatively expire after one minute.
- Accept-invite database changes are maintained through local Supabase migrations.
- Protected application server actions must use the active-account Supabase action client before role checks or service-role work; database access also requires an exact `active` account status through restrictive RLS and privileged RPC guards.
- Inactive-account enforcement is maintained through local Supabase migrations and restricts user-profile and role-assignment policies that could otherwise allow self-reactivation or role escalation.
- Assigned account roles must remain independent from account status. Use `get_user_roles` and JWT role claims for assigned dashboard identity, and use active-account helpers such as `is_current_user_active` or `is_current_user_active_admin` for access enforcement.
- Admin and reviewee app pages use the shared role-aware app shell and navigation components.
- The unfinished gray content block in the ABE Trivia reference is intentionally omitted.
- Reviewee quiz gameplay database changes are maintained through local Supabase migrations, and answer keys remain server-private instead of being returned with playable questions.
- Reviewee flash-card database changes are maintained through local Supabase migrations; each reviewee has at most one deck per subject area and each deck is limited to 250 cards.
- MCQ and flash-card client timers must not run until server timing is initialized, and local deadline scheduling must use monotonic elapsed durations while the database remains authoritative.
- `game_sessions` is the sole canonical activity-history source for MCQ and flash-card attempts; summary metrics are derived from the mode-specific session-item tables, and private answer-key tables remain the source for detailed results.
- Reviewee history database changes are maintained through local Supabase migrations, including removal of the redundant activity-history table and UUID-based, ownership-checked detail access.
- Flash-card game answers are compared server-side after trimming, collapsing repeated whitespace, and ignoring letter case; punctuation, accents, and word order remain significant.
- ABE Trivia database changes are maintained through local Supabase migrations; publish dates follow the Asia/Manila calendar, allow an unchanged historical date during editing, and otherwise cannot be in the past.
- ABE Trivia permits one trivia per publish date, restricts trivia management to administrators through row-level security, and exposes only today's trivia to reviewees.
- All successful application operations use the established animated teal success banner that slides down into view and slides back up after completion.
- Password recovery uses cloud-managed Supabase Auth and email-template settings, stores only a signed and expiring user ID recovery cookie, and never persists a Supabase recovery session in cookies.
- Subject areas and subjects remain readable by authenticated users, while their create, update, and delete operations are restricted to administrators through row-level security.
- MCQ and flash-card sessions and snapshots are created atomically only after the three-second countdown finishes; countdown cancellations are not persisted, and activity-history retention keeps each user's newest 50 completed or exited `game_sessions` with older linked items and answer keys cascade-deleted.
- Activity-history overview cards use `reviewee_activity_stats` for lifetime totals; the visible history list stays limited to the newest 50 detailed terminal `game_sessions`.
- Activity-history review streaks are aggregate stats on `reviewee_activity_stats`; keep `completed_sessions` in the database even though the current reviewee history UI shows review streak instead.
- PAES question sets use `game_type = 'PAES'` with a null difficulty, and PAES Series area and subject immutability is enforced by both the admin interface and subject-management server actions.
- Seed data is maintained in `supabase/seed.sql` and applied through the local Supabase workflow. The seed includes the predefined PAES Series area and its subjects.
- `PAES Series` remains the canonical database area name; only its subject-area card title on the reviewee flash-card page is shortened to `PAES`.
- ABE Trivia calendar pagination counts all remaining current-month date cards plus the first next-month date card, including dates without trivia, with four date slots per page and a month divider before the next-month card.
- ABE Trivia keeps the existing unique `publish_date` database constraint as the authoritative one-trivia-per-day safeguard; the calendar rework requires no schema change.
- Reviewee trivia uses the existing row-level security policy together with an explicit Asia/Manila current-date query; the shared MCQ Quiz and Flash Cards card requires no schema change.
- Reviewee MCQ Quiz and Flash Cards initial data must each use one page-specific server-action request so today's trivia is resolved before the completed page UI appears; `TodaysTriviaCard` remains controlled and must not start an independent mount fetch.
- Reviewee Flash Cards must handle deck and trivia failures independently inside the coordinated initial request, and later deck retries, trivia retries, and Asia/Manila date-rollover refreshes must reload only their respective data.
- Supabase email templates are maintained as the active committed HTML files in `supabase/templates/` and referenced by the local Supabase configuration; Git history is the source of version tracking, so update the applicable template in place rather than creating timestamped template archives.
- MCQ and flash-card timer configuration is stored in the RLS-protected `quiz_timer_configurations` table. Configure the three standard game types by difficulty, and PAES and Flash Cards with a null difficulty; gameplay snapshots the configured value into each new `game_sessions` record. The identity `id` column is the primary key required for direct Supabase table-editor updates.
- Resending a pending reviewee invitation uses a Supabase recovery link only after the original invitation has verified the Auth email but account setup remains incomplete; delivery uses Resend with the same invitation wording and design, while unverified users continue through Supabase's normal invitation delivery.
- Modals use their natural content height until they reach the available viewport height, then scroll internally; retain a small, visually pleasing inset above and below the modal rather than making it edge-to-edge.
