/*
 * CineMatch
 * Copyright (C) 2025 <Make a Wish team>
 * Authors: see AUTHORS.md
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed WITHOUT ANY WARRANTY.
 * See the GNU General Public License for more details.
 *
 * If not, see <https://www.gnu.org/licenses/>.
 */package com.example.CineMatch.Config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

@Configuration
public class DbInitConfig {

    @Bean
    CommandLineRunner initUserPreferencesRls(DataSource dataSource) {
        return args -> {
            try (Connection conn = dataSource.getConnection();
                 Statement st = conn.createStatement()) {


                st.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";");

                // profile table
                // 1) Table
                st.execute("""
  CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid not null,
    username text null,
    email text null,
    avatar_url text null,
    constraint profiles_pkey primary key (id),
    constraint profiles_id_fkey
      foreign key (id) references auth.users (id) on delete cascade
  ) TABLESPACE pg_default;
""");

// 2) Enable RLS (idempotent)
                st.execute("ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;");

// 3) Policies (create only if missing)

// SELECT: public can view
                ensurePolicy(st, "public", "profiles", "Public profiles are viewable by everyone.", """
  CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles
  FOR SELECT
  TO public
  USING (true);
""");

// INSERT: public can insert only own profile
                ensurePolicy(st, "public", "profiles", "Users can insert their own profile.", """
  CREATE POLICY "Users can insert their own profile."
  ON public.profiles
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);
""");

// UPDATE: public can update own profile (note: your JSON has no with_check)
                ensurePolicy(st, "public", "profiles", "Users can update own profile.", """
  CREATE POLICY "Users can update own profile."
  ON public.profiles
  FOR UPDATE
  TO public
  USING (auth.uid() = id);
""");
                // user preferences table
                st.execute("""
          CREATE TABLE IF NOT EXISTS public.user_preferences (
            user_id uuid not null,
            genres integer[] null,
            genre_affinity jsonb not null default '[]'::jsonb,
            constraint user_preferences_pkey primary key (user_id),
            constraint user_preferences_user_id_fkey
              foreign key (user_id) references auth.users (id) on delete cascade
          ) TABLESPACE pg_default;
        """);
                st.execute("""
  ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS genres integer[];
""");

                // Enable RLS (idempotent)
                st.execute("ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;");

// 1) DELETE
                ensurePolicy(st, "public", "user_preferences", "Users can delete their preferences", """
  CREATE POLICY "Users can delete their preferences"
  ON public.user_preferences
  FOR DELETE
  TO public
  USING (auth.uid() = user_id);
""");

// 2) INSERT
                ensurePolicy(st, "public", "user_preferences", "Users can insert their preferences", """
  CREATE POLICY "Users can insert their preferences"
  ON public.user_preferences
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);
""");

// 3) UPDATE (policy name: Users can update their own preferences)
                ensurePolicy(st, "public", "user_preferences", "Users can update their own preferences", """
  CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences
  FOR UPDATE
  TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
""");

// 4) UPDATE (policy name: Users can update their preferences)
                ensurePolicy(st, "public", "user_preferences", "Users can update their preferences", """
  CREATE POLICY "Users can update their preferences"
  ON public.user_preferences
  FOR UPDATE
  TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
""");

// 5) SELECT
                ensurePolicy(st, "public", "user_preferences", "Users can view their preferences", """
  CREATE POLICY "Users can view their preferences"
  ON public.user_preferences
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);
""");


                //user favorites table
                st.execute("""
  CREATE TABLE IF NOT EXISTS public.user_favorites (
    id uuid not null default extensions.uuid_generate_v4(),
    user_id uuid not null,
    tmdb_id integer not null,
    title text not null,
    genres text[] not null,
    media_type text not null,
    added_at timestamptz null default now(),
    constraint user_favorites_pkey primary key (id),
    constraint user_favorites_user_id_tmdb_id_media_type_key unique (user_id, tmdb_id, media_type),
    constraint user_favorites_user_id_fkey
      foreign key (user_id) references auth.users (id) on delete cascade,
    constraint user_favorites_media_type_check
      check (media_type = any (array['movie'::text, 'tv'::text]))
  ) TABLESPACE pg_default;
""");

// Enable RLS (idempotent)
                st.execute("ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;");

// 1) Users can add their own favorites (INSERT to public, WITH CHECK auth.uid() = user_id)
                ensurePolicy(st, "public", "user_favorites", "Users can add their own favorites", """
  CREATE POLICY "Users can add their own favorites"
  ON public.user_favorites
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);
""");

// 2) Users can delete their own favorites (DELETE to public, USING auth.uid() = user_id)
                ensurePolicy(st, "public", "user_favorites", "Users can delete their own favorites", """
  CREATE POLICY "Users can delete their own favorites"
  ON public.user_favorites
  FOR DELETE
  TO public
  USING (auth.uid() = user_id);
""");

// 3) Users can view their favorites (SELECT to public, USING auth.uid() = user_id)
                ensurePolicy(st, "public", "user_favorites", "Users can view their favorites", """
  CREATE POLICY "Users can view their favorites"
  ON public.user_favorites
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);
""");

                //stories table
                // Inside your CommandLineRunner, after you have Statement st:

                st.execute("""
  CREATE TABLE IF NOT EXISTS public.stories (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null,
    media_url text not null,
    media_type text null,
    created_at timestamptz null default now(),
    constraint stories_pkey primary key (id),
    constraint stories_user_fkey
      foreign key (user_id) references auth.users (id) on delete cascade,
    constraint stories_user_id_fkey
      foreign key (user_id) references public.profiles (id) on delete cascade,
    constraint stories_media_type_check
      check (media_type = any (array['image'::text, 'video'::text]))
  ) TABLESPACE pg_default;
""");

/// Enable RLS (idempotent)
                st.execute("ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;");

// 1) Authenticated users can insert stories
                ensurePolicy(st, "public", "stories", "Authenticated users can insert stories", """
  CREATE POLICY "Authenticated users can insert stories"
  ON public.stories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
""");

// 2) Create story (TO public)
                ensurePolicy(st, "public", "stories", "Create story", """
  CREATE POLICY "Create story"
  ON public.stories
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);
""");

// 3) Delete own story (TO public)
                ensurePolicy(st, "public", "stories", "Delete own story", """
  CREATE POLICY "Delete own story"
  ON public.stories
  FOR DELETE
  TO public
  USING (auth.uid() = user_id);
""");

// 4) Public stories are viewable by everyone (TO public)
                ensurePolicy(st, "public", "stories", "Public stories are viewable by everyone", """
  CREATE POLICY "Public stories are viewable by everyone"
  ON public.stories
  FOR SELECT
  TO public
  USING (true);
""");

// 5) Read stories (TO public)
                ensurePolicy(st, "public", "stories", "Read stories", """
  CREATE POLICY "Read stories"
  ON public.stories
  FOR SELECT
  TO public
  USING (true);
""");

// 6) Users can delete their own stories (TO authenticated)
                ensurePolicy(st, "public", "stories", "Users can delete their own stories", """
  CREATE POLICY "Users can delete their own stories"
  ON public.stories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
""");

// 7) stories_insert_own (TO authenticated)
                ensurePolicy(st, "public", "stories", "stories_insert_own", """
  CREATE POLICY "stories_insert_own"
  ON public.stories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
""");

// 8) stories_select_authenticated (TO authenticated)
                ensurePolicy(st, "public", "stories", "stories_select_authenticated", """
  CREATE POLICY "stories_select_authenticated"
  ON public.stories
  FOR SELECT
  TO authenticated
  USING (true);
""");
                //public story_Views table
                st.execute("""
  CREATE TABLE IF NOT EXISTS public.story_views (
    id uuid not null default gen_random_uuid(),
    story_id uuid not null,
    user_id uuid not null,
    created_at timestamptz null default now(),
    constraint story_views_pkey primary key (id),
    constraint story_views_story_id_user_id_key unique (story_id, user_id),
    constraint story_views_story_id_fkey
      foreign key (story_id) references public.stories (id) on delete cascade,
    constraint story_views_user_id_fkey
      foreign key (user_id) references auth.users (id) on delete cascade
  ) TABLESPACE pg_default;
""");


                // reviews table
                st.execute("""
  CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid not null default gen_random_uuid(),
    content_id text not null,
    user_id uuid not null,
    content text not null,
    sentiment text null,
    created_at timestamptz not null default timezone('utc'::text, now()),
    sentiment_score double precision null,
    content_type text not null default 'movie'::text,
    genre_ids integer[] null,
    constraint reviews_pkey primary key (id),
    constraint fk_user foreign key (user_id) references auth.users (id) on delete cascade,
    constraint reviews_user_id_fkey foreign key (user_id) references auth.users (id),
    constraint reviews_content_type_check check (content_type = any (array['movie'::text, 'series'::text])),
    constraint reviews_sentiment_check check (
      sentiment = any (array['negative'::text, 'neutral'::text, 'positive'::text])
    )
  ) TABLESPACE pg_default;
""");

// Indexes (idempotent)
                st.execute("""
  CREATE INDEX IF NOT EXISTS idx_reviews_content
  ON public.reviews (content_id, content_type) TABLESPACE pg_default;
""");

                st.execute("""
  CREATE INDEX IF NOT EXISTS reviews_genre_ids_gin
  ON public.reviews USING gin (genre_ids) TABLESPACE pg_default;
""");

// Enable RLS (idempotent)
                // Enable RLS (idempotent)
                st.execute("ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;");

// 1) "Authenticated users can insert reviews" (INSERT to authenticated, WITH CHECK true)
                ensurePolicy(st, "public", "reviews", "Authenticated users can insert reviews", """
  CREATE POLICY "Authenticated users can insert reviews"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
""");

// 2) "Authenticated users can read reviews" (SELECT to authenticated, USING true)
                ensurePolicy(st, "public", "reviews", "Authenticated users can read reviews", """
  CREATE POLICY "Authenticated users can read reviews"
  ON public.reviews
  FOR SELECT
  TO authenticated
  USING (true);
""");

// 3) "Users can insert their own reviews" (INSERT to authenticated, WITH CHECK auth.uid() = user_id)
                ensurePolicy(st, "public", "reviews", "Users can insert their own reviews", """
  CREATE POLICY "Users can insert their own reviews"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
""");

                // ranked quiz attempts table
                // 1) Table
                st.execute("""
  CREATE TABLE IF NOT EXISTS public.ranked_quiz_attempts (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null,
    username text not null,
    total_questions integer not null,
    correct_answers integer not null,
    wrong_answers integer not null,
    time_taken_seconds integer not null,
    score integer not null,
    created_at timestamptz null default now(),
    constraint ranked_quiz_attempts_pkey primary key (id),
    constraint ranked_quiz_attempts_user_id_fkey
      foreign key (user_id) references auth.users (id) on delete cascade
  ) TABLESPACE pg_default;
""");

// 2) Indexes (idempotent)
                st.execute("""
  CREATE INDEX IF NOT EXISTS idx_ranked_quiz_user_id
  ON public.ranked_quiz_attempts (user_id) TABLESPACE pg_default;
""");

                st.execute("""
  CREATE INDEX IF NOT EXISTS idx_ranked_quiz_score
  ON public.ranked_quiz_attempts (score desc) TABLESPACE pg_default;
""");

// 3) Enable RLS (idempotent)
                st.execute("ALTER TABLE public.ranked_quiz_attempts ENABLE ROW LEVEL SECURITY;");

// 4) Policies (create only if missing)

// INSERT
                ensurePolicy(st, "public", "ranked_quiz_attempts", "Insert own ranked attempts", """
  CREATE POLICY "Insert own ranked attempts"
  ON public.ranked_quiz_attempts
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);
""");

// SELECT
                ensurePolicy(st, "public", "ranked_quiz_attempts", "Leaderboard is public", """
  CREATE POLICY "Leaderboard is public"
  ON public.ranked_quiz_attempts
  FOR SELECT
  TO public
  USING (true);
""");

// SELECT (explicit deny)
                ensurePolicy(st, "public", "ranked_quiz_attempts", "No direct select on ranked attempts", """
  CREATE POLICY "No direct select on ranked attempts"
  ON public.ranked_quiz_attempts
  FOR SELECT
  TO public
  USING (false);
""");

// INSERT (duplicate name/policy you have)
                ensurePolicy(st, "public", "ranked_quiz_attempts", "Users can insert their own ranked attempts", """
  CREATE POLICY "Users can insert their own ranked attempts"
  ON public.ranked_quiz_attempts
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);
""");
                // leaderboard table
                // Create leaderboard view (idempotent)
                st.execute("""
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_views
      WHERE schemaname = 'public'
        AND viewname = 'ranked_leaderboard_view'
    ) THEN
      EXECUTE $v$
        CREATE VIEW public.ranked_leaderboard_view AS
        SELECT
          a.user_id,
          u.raw_user_meta_data ->> 'name'::text AS username,
          COUNT(*) AS quizzes_taken,
          ROUND(AVG(a.time_taken_seconds)) AS avg_time_seconds,
          GREATEST(SUM(a.score), 0::bigint) AS total_score
        FROM public.ranked_quiz_attempts a
        JOIN auth.users u ON u.id = a.user_id
        GROUP BY
          a.user_id,
          (u.raw_user_meta_data ->> 'name'::text)
        ORDER BY
          (GREATEST(SUM(a.score), 0::bigint)) DESC
      $v$;
    END IF;
  END
  $$;
""");



                // media post table
                // 1) Table
                st.execute("""
  CREATE TABLE IF NOT EXISTS public.media_posts (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null,
    username text not null,
    user_img text null,
    media_url text not null,
    media_type text null default 'image'::text,
    caption text null,
    likes_count integer null default 0,
    comments_count integer null default 0,
    created_at timestamptz null default now(),
    movie_title text null,
    tmdb_id text null,
    tmdb_type text null,
    constraint media_posts_pkey primary key (id),
    constraint media_posts_user_id_fkey
      foreign key (user_id) references public.profiles (id) on delete cascade,
    constraint media_posts_media_type_check
      check (media_type = any (array['image'::text, 'video'::text]))
  ) TABLESPACE pg_default;
""");

// 2) Enable RLS
                st.execute("ALTER TABLE public.media_posts ENABLE ROW LEVEL SECURITY;");

// 3) Policies (create only if missing)

// INSERT: policy name says "Authenticated users...", but role is public with check on auth.role()
                ensurePolicy(st, "public", "media_posts", "Authenticated users can insert posts", """
  CREATE POLICY "Authenticated users can insert posts"
  ON public.media_posts
  FOR INSERT
  TO public
  WITH CHECK (auth.role() = 'authenticated'::text);
""");

// SELECT: public can view
                ensurePolicy(st, "public", "media_posts", "Public posts are viewable by everyone", """
  CREATE POLICY "Public posts are viewable by everyone"
  ON public.media_posts
  FOR SELECT
  TO public
  USING (true);
""");

// DELETE: authenticated can delete own
                ensurePolicy(st, "public", "media_posts", "Users can delete their own posts", """
  CREATE POLICY "Users can delete their own posts"
  ON public.media_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
""");

                // media likes table
                // 1) Table
                st.execute("""
  CREATE TABLE IF NOT EXISTS public.media_likes (
    id uuid not null default gen_random_uuid(),
    post_id uuid not null,
    user_id uuid not null,
    created_at timestamptz null default now(),
    constraint media_likes_pkey primary key (id),
    constraint media_likes_unique unique (post_id, user_id),
    constraint media_likes_post_fkey
      foreign key (post_id) references public.media_posts (id) on delete cascade,
    constraint media_likes_user_fkey
      foreign key (user_id) references auth.users (id) on delete cascade
  ) TABLESPACE pg_default;
""");

                st.execute("""
CREATE INDEX IF NOT EXISTS media_likes_post_id_idx
ON public.media_likes (post_id);
""");
                st.execute("""
CREATE OR REPLACE FUNCTION public.update_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_id uuid;
BEGIN
  v_post_id := COALESCE(NEW.post_id, OLD.post_id);

  UPDATE public.media_posts p
  SET likes_count = (
    SELECT COUNT(*)
    FROM public.media_likes ml
    WHERE ml.post_id = v_post_id
  )
  WHERE p.id = v_post_id;

  RETURN NULL;
END;
$$;
""");

// 2) Trigger (Postgres doesn't have CREATE TRIGGER IF NOT EXISTS, so use a DO block)
                st.execute("""
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'media_likes_count_trigger'
      AND n.nspname = 'public'
      AND c.relname = 'media_likes'
  ) THEN
    CREATE TRIGGER media_likes_count_trigger
    AFTER INSERT OR DELETE ON public.media_likes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_likes_count();
  END IF;
END
$$;
""");



// 3) Enable RLS (idempotent)
                st.execute("ALTER TABLE public.media_likes ENABLE ROW LEVEL SECURITY;");

// 4) Policies (create only if missing)

// INSERT
                ensurePolicy(st, "public", "media_likes", "Like post", """
  CREATE POLICY "Like post"
  ON public.media_likes
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);
""");

// SELECT
                ensurePolicy(st, "public", "media_likes", "Read likes", """
  CREATE POLICY "Read likes"
  ON public.media_likes
  FOR SELECT
  TO public
  USING (true);
""");

// DELETE
                ensurePolicy(st, "public", "media_likes", "Unlike post", """
  CREATE POLICY "Unlike post"
  ON public.media_likes
  FOR DELETE
  TO public
  USING (auth.uid() = user_id);
""");

                //media comments table
                // 1) Table
                st.execute("""
  CREATE TABLE IF NOT EXISTS public.media_comments (
    id uuid not null default gen_random_uuid(),
    post_id uuid not null,
    user_id uuid not null,
    username text null,
    user_img text null,
    comment_text text not null,
    created_at timestamptz null default now(),
    constraint media_comments_pkey primary key (id),
    constraint media_comments_post_id_fkey
      foreign key (post_id) references public.media_posts (id) on delete cascade,
    constraint media_comments_user_id_fkey
      foreign key (user_id) references public.profiles (id) on delete cascade
  ) TABLESPACE pg_default;
""");

                st.execute("""
CREATE INDEX IF NOT EXISTS media_comments_post_id_idx
ON public.media_comments (post_id);
""");

                st.execute("""
CREATE OR REPLACE FUNCTION public.update_comments_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_id uuid;
BEGIN
  v_post_id := COALESCE(NEW.post_id, OLD.post_id);

  UPDATE public.media_posts p
  SET comments_count = (
    SELECT COUNT(*)
    FROM public.media_comments mc
    WHERE mc.post_id = v_post_id
  )
  WHERE p.id = v_post_id;

  RETURN NULL;
END;
$$;
""");

// 2) Trigger (no CREATE TRIGGER IF NOT EXISTS, so DO block)
                st.execute("""
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'comments_count_trigger'
      AND n.nspname = 'public'
      AND c.relname = 'media_comments'
  ) THEN
    CREATE TRIGGER comments_count_trigger
    AFTER INSERT OR DELETE ON public.media_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_comments_count();
  END IF;
END
$$;
""");



// 3) Enable RLS
                st.execute("ALTER TABLE public.media_comments ENABLE ROW LEVEL SECURITY;");

// 4) Policies (create only if missing)

// INSERT (role public + check auth.role() = authenticated, as per your JSON)
                ensurePolicy(st, "public", "media_comments", "Authenticated users can insert comments", """
  CREATE POLICY "Authenticated users can insert comments"
  ON public.media_comments
  FOR INSERT
  TO public
  WITH CHECK (auth.role() = 'authenticated'::text);
""");

// SELECT (public)
                ensurePolicy(st, "public", "media_comments", "Public comments are viewable by everyone", """
  CREATE POLICY "Public comments are viewable by everyone"
  ON public.media_comments
  FOR SELECT
  TO public
  USING (true);
""");

// DELETE (authenticated, own)
                ensurePolicy(st, "public", "media_comments", "Users can delete their own comments", """
  CREATE POLICY "Users can delete their own comments"
  ON public.media_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
""");

// UPDATE (authenticated, own) — includes WITH CHECK as per your JSON
                ensurePolicy(st, "public", "media_comments", "Users can update their own comments", """
  CREATE POLICY "Users can update their own comments"
  ON public.media_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
""");
                //conversation table:
                // 1) Table
                st.execute("""
  CREATE TABLE IF NOT EXISTS public.conversations (
    id bigserial not null,
    user1_id uuid not null,
    user2_id uuid not null,
    created_at timestamptz null default now(),
    constraint conversations_pkey primary key (id),
    constraint conversations_user1_id_user2_id_key unique (user1_id, user2_id)
  ) TABLESPACE pg_default;
""");

// 2) Enable RLS
                st.execute("ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;");

// 3) Policies (create only if missing)

// INSERT
                ensurePolicy(st, "public", "conversations", "insert conversations if participant", """
  CREATE POLICY "insert conversations if participant"
  ON public.conversations
  FOR INSERT
  TO authenticated
  WITH CHECK ((user1_id = auth.uid()) OR (user2_id = auth.uid()));
""");

// SELECT
                ensurePolicy(st, "public", "conversations", "read own conversations", """
  CREATE POLICY "read own conversations"
  ON public.conversations
  FOR SELECT
  TO authenticated
  USING ((user1_id = auth.uid()) OR (user2_id = auth.uid()));
""");

                //messages table:
// 1) Table
                st.execute("""
  CREATE TABLE IF NOT EXISTS public.messages (
    id bigserial not null,
    conversation_id bigint not null,
    sender_id uuid not null,
    body text not null,
    created_at timestamptz null default now(),
    constraint messages_pkey primary key (id),
    constraint messages_conversation_id_fkey
      foreign key (conversation_id) references public.conversations (id) on delete cascade
  ) TABLESPACE pg_default;
""");

// 2) Enable RLS
                st.execute("ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;");

// 3) Policies (create only if missing)

// INSERT: only if sender is auth user AND user is participant in conversation
                ensurePolicy(st, "public", "messages", "insert message if participant", """
  CREATE POLICY "insert message if participant"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (sender_id = auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );
""");

// SELECT: only if user is participant in conversation
                ensurePolicy(st, "public", "messages", "read messages if participant", """
  CREATE POLICY "read messages if participant"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );
""");

                //profile_photos table:
                // 1) Table
                st.execute("""
  CREATE TABLE IF NOT EXISTS public.profile_photos (
    id bigserial not null,
    user_id uuid not null,
    url text not null,
    sort_order integer not null default 0,
    created_at timestamptz null default now(),
    constraint profile_photos_pkey primary key (id),
    constraint profile_photos_user_fk
      foreign key (user_id) references auth.users (id) on delete cascade
  ) TABLESPACE pg_default;
""");

// 2) Index (idempotent)
                st.execute("""
  CREATE INDEX IF NOT EXISTS profile_photos_user_id_idx
  ON public.profile_photos (user_id) TABLESPACE pg_default;
""");

// 3) Enable RLS
                st.execute("ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;");

// 4) Policies (create only if missing)

// DELETE own
                ensurePolicy(st, "public", "profile_photos", "profile_photos delete own", """
  CREATE POLICY "profile_photos delete own"
  ON public.profile_photos
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
""");

// INSERT own
                ensurePolicy(st, "public", "profile_photos", "profile_photos insert own", """
  CREATE POLICY "profile_photos insert own"
  ON public.profile_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
""");

// SELECT (true)
                ensurePolicy(st, "public", "profile_photos", "profile_photos selectable", """
  CREATE POLICY "profile_photos selectable"
  ON public.profile_photos
  FOR SELECT
  TO authenticated
  USING (true);
""");

// UPDATE own
                ensurePolicy(st, "public", "profile_photos", "profile_photos update own", """
  CREATE POLICY "profile_photos update own"
  ON public.profile_photos
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
""");

                // user_tinder_swipes table:
                // 1) Table
                st.execute("""
  CREATE TABLE IF NOT EXISTS public.user_tinder_swipes (
    id bigserial not null,
    swiper_id uuid not null,
    target_user_id uuid not null,
    action text not null,
    shared_tmdb_id integer null,
    shared_title text null,
    shared_media_type text null,
    created_at timestamptz null default now(),
    similarity real null,
    shared_genres jsonb null,
    constraint user_tinder_swipes_pkey primary key (id),
    constraint user_tinder_swipes_swiper_id_target_user_id_key unique (swiper_id, target_user_id),
    constraint user_tinder_swipes_action_check
      check (action = any (array['accept'::text, 'reject'::text]))
  ) TABLESPACE pg_default;
""");

// 2) Enable RLS
                st.execute("ALTER TABLE public.user_tinder_swipes ENABLE ROW LEVEL SECURITY;");

// 3) Policies (create only if missing)

// DELETE
                ensurePolicy(st, "public", "user_tinder_swipes", "delete own swipes", """
  CREATE POLICY "delete own swipes"
  ON public.user_tinder_swipes
  FOR DELETE
  TO public
  USING (swiper_id = auth.uid());
""");

// INSERT
                ensurePolicy(st, "public", "user_tinder_swipes", "insert own swipes", """
  CREATE POLICY "insert own swipes"
  ON public.user_tinder_swipes
  FOR INSERT
  TO public
  WITH CHECK (swiper_id = auth.uid());
""");

// SELECT (own swipes)
                ensurePolicy(st, "public", "user_tinder_swipes", "read own swipes", """
  CREATE POLICY "read own swipes"
  ON public.user_tinder_swipes
  FOR SELECT
  TO public
  USING (swiper_id = auth.uid());
""");

// SELECT (swipes targeting me)
                ensurePolicy(st, "public", "user_tinder_swipes", "read swipes targeting me", """
  CREATE POLICY "read swipes targeting me"
  ON public.user_tinder_swipes
  FOR SELECT
  TO public
  USING (target_user_id = auth.uid());
""");

// UPDATE
                ensurePolicy(st, "public", "user_tinder_swipes", "update own swipes", """
  CREATE POLICY "update own swipes"
  ON public.user_tinder_swipes
  FOR UPDATE
  TO public
  USING (swiper_id = auth.uid())
  WITH CHECK (swiper_id = auth.uid());
""");

                // user swipes table:
                // 1) Table
                st.execute("""
  CREATE TABLE IF NOT EXISTS public.user_matches (
    id bigserial not null,
    user_id uuid not null,
    matched_user_id uuid not null,
    shared_tmdb_id integer null,
    shared_title text null,
    shared_media_type text null,
    created_at timestamptz null default now(),
    similarity real null,
    shared_genres jsonb null,
    conversation_id bigint null,
    constraint user_matches_pkey primary key (id),
    constraint user_matches_user_id_matched_user_id_key unique (user_id, matched_user_id)
  ) TABLESPACE pg_default;
""");

// 2) Enable RLS
                st.execute("ALTER TABLE public.user_matches ENABLE ROW LEVEL SECURITY;");

// 3) Policies

// DELETE
                ensurePolicy(st, "public", "user_matches", "delete own matches", """
  CREATE POLICY "delete own matches"
  ON public.user_matches
  FOR DELETE
  TO public
  USING (user_id = auth.uid());
""");

// INSERT
                ensurePolicy(st, "public", "user_matches", "insert own matches", """
  CREATE POLICY "insert own matches"
  ON public.user_matches
  FOR INSERT
  TO public
  WITH CHECK (user_id = auth.uid());
""");

// SELECT
                ensurePolicy(st, "public", "user_matches", "read own matches", """
  CREATE POLICY "read own matches"
  ON public.user_matches
  FOR SELECT
  TO public
  USING (user_id = auth.uid());
""");





            }
        };
    }

    /**
     * Postgres/Supabase: CREATE POLICY has no IF NOT EXISTS,
     * so we check pg_policies and create only if missing.
     */
    private static void ensurePolicy(Statement st,
                                     String schema,
                                     String table,
                                     String policyName,
                                     String createPolicySql) throws SQLException {

        // Escape single quotes so we can put the CREATE POLICY inside EXECUTE '...'
        String sqlEscaped = createPolicySql.replace("'", "''");

        st.execute("""
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_policies
          WHERE schemaname = '%s'
            AND tablename  = '%s'
            AND policyname = '%s'
        ) THEN
          EXECUTE '%s';
        END IF;
      END
      $$;
      """.formatted(schema, table, policyName, sqlEscaped));
    }
}
