-- Expand the -ap word family with additional words
-- Adds: sap, zap, crap, flap, chap, kidnap
-- (word_family_id: f1000000-0000-4000-8000-000000000103)
-- Already in DB: cap, gap, lap, map, nap, tap, rap, clap, snap, trap, wrap, scrap, strap, slap

INSERT INTO words (id, word_family_id, text, consonant, pattern, definition, phoneme, audio_url, slow_audio_url)
SELECT * FROM (VALUES
  ('73f30b9f-b393-442a-adf5-4cac2150fffa'::uuid, 'f1000000-0000-4000-8000-000000000103'::uuid, 'sap',    's',  'ap', 'the liquid in plants; to drain energy',  '/sæp/', '', ''),
  ('6378c7a0-65f0-4191-bada-fce60d0dca35'::uuid, 'f1000000-0000-4000-8000-000000000103'::uuid, 'zap',    'z',  'ap', 'to destroy or move quickly',             '/zæp/', '', ''),
  ('fe29707a-f8ea-4257-b60c-a06873a126c8'::uuid, 'f1000000-0000-4000-8000-000000000103'::uuid, 'crap',   'cr', 'ap', 'something of poor quality; nonsense',   '/kræp/', '', ''),
  ('5cc937b2-f423-4277-adef-1503897997d1'::uuid, 'f1000000-0000-4000-8000-000000000103'::uuid, 'flap',   'fl', 'ap', 'to move up and down; a piece of material','/flæp/', '', ''),
  ('999c619e-892a-41eb-8143-3b5b01fb9af8'::uuid, 'f1000000-0000-4000-8000-000000000103'::uuid, 'chap',   'ch', 'ap', 'a man or boy; cracked lips',            '/tʃæp/', '', ''),
  ('a3c36eef-a143-4726-b504-53cf6ae14ea1'::uuid, 'f1000000-0000-4000-8000-000000000103'::uuid, 'kidnap', 'kidn','ap', 'to take someone by force',               '/ˈkɪdnæp/', '', '')
) AS v(id, word_family_id, text, consonant, pattern, definition, phoneme, audio_url, slow_audio_url)
WHERE NOT EXISTS (SELECT 1 FROM words w WHERE w.text = v.text AND w.word_family_id = v.word_family_id);
