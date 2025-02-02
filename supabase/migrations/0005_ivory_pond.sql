/*
  # Voice Interaction Schema

  1. New Tables
    - `voice_profiles` - Store voice settings and preferences
    - `voice_interactions` - Track voice communication history
    - `voice_transcripts` - Store transcribed audio content
    - `voice_feedback` - Store user feedback on voice interactions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access

  3. Changes
    - Add indexes for performance optimization
    - Add functions for metrics calculation
*/

-- Create voice profiles table
CREATE TABLE IF NOT EXISTS public.voice_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  voice_id text NOT NULL,
  settings jsonb NOT NULL DEFAULT '{
    "stability": 0.5,
    "similarity": 0.75,
    "style": 0.5,
    "use_diarization": false
  }'::jsonb,
  preferences jsonb NOT NULL DEFAULT '{
    "language": "en",
    "speed": 1.0,
    "pitch": 1.0
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create voice interactions table
CREATE TABLE IF NOT EXISTS public.voice_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  type text NOT NULL CHECK (type IN ('inbound', 'outbound', 'automated')),
  status text NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  duration integer,
  metrics jsonb,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create voice transcripts table
CREATE TABLE IF NOT EXISTS public.voice_transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id uuid REFERENCES voice_interactions(id),
  direction text NOT NULL CHECK (direction IN ('input', 'output')),
  content text NOT NULL,
  language text NOT NULL,
  confidence numeric(4,3),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create voice feedback table
CREATE TABLE IF NOT EXISTS public.voice_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id uuid REFERENCES voice_interactions(id),
  user_id uuid REFERENCES auth.users(id),
  rating integer CHECK (rating BETWEEN 1 AND 5),
  feedback_type text NOT NULL CHECK (feedback_type IN ('quality', 'accuracy', 'latency')),
  comments text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_voice_profiles_user_id ON voice_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_interactions_user_id ON voice_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_transcripts_interaction_id ON voice_transcripts(interaction_id);
CREATE INDEX IF NOT EXISTS idx_voice_feedback_interaction_id ON voice_feedback(interaction_id);

-- Enable RLS
ALTER TABLE voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_feedback ENABLE ROW LEVEL SECURITY;

-- Create metrics calculation function
CREATE OR REPLACE FUNCTION get_voice_interaction_metrics(
  user_id_param uuid,
  lookback_minutes integer DEFAULT 60
)
RETURNS TABLE (
  total_interactions bigint,
  average_duration numeric,
  success_rate numeric,
  average_confidence numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH metrics AS (
    SELECT
      COUNT(*) as total,
      AVG(duration) as avg_duration,
      COUNT(*) FILTER (WHERE status = 'completed') as completed,
      AVG((metrics->>'confidence')::numeric) as avg_confidence
    FROM voice_interactions
    WHERE
      user_id = user_id_param
      AND created_at >= NOW() - (lookback_minutes || ' minutes')::interval
  )
  SELECT
    total as total_interactions,
    avg_duration as average_duration,
    (completed::numeric / total::numeric) as success_rate,
    avg_confidence as average_confidence
  FROM metrics;
END;
$$;

-- Create RLS policies
DO $$ 
BEGIN
    -- Create policies for voice profiles
    CREATE POLICY "Users can manage their own voice profiles"
      ON voice_profiles FOR ALL
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());

    -- Create policies for voice interactions
    CREATE POLICY "Users can view their own voice interactions"
      ON voice_interactions FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());

    -- Create policies for voice transcripts
    CREATE POLICY "Users can view transcripts of their interactions"
      ON voice_transcripts FOR SELECT
      TO authenticated
      USING (
        interaction_id IN (
          SELECT id FROM voice_interactions WHERE user_id = auth.uid()
        )
      );

    -- Create policies for voice feedback
    CREATE POLICY "Users can manage their own feedback"
      ON voice_feedback FOR ALL
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
END
$$;