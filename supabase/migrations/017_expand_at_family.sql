-- Expand the -at word family with additional words
-- Adds: vat, brat, gnat, slat, drat
-- (word_family_id: f1000000-0000-4000-8000-000000000104)
-- Already in DB: cat, bat, sat, rat, mat, hat, fat, pat, flat, chat, that, spat, scat, splat

INSERT INTO words (id, word_family_id, text, consonant, pattern, definition, phoneme, audio_url, slow_audio_url)
SELECT * FROM (VALUES
  ('1e05ea43-a801-4064-9be5-f5c9c4b1c572'::uuid, 'f1000000-0000-4000-8000-000000000104'::uuid, 'vat',    'v',  'at', 'a large container for liquids',           '/væt/', '', ''),
  ('e09cd170-3814-4c0f-a2b7-d4ad95638d93'::uuid, 'f1000000-0000-4000-8000-000000000104'::uuid, 'brat',   'br', 'at', 'a badly behaved child',                   '/bræt/', '', ''),
  ('03f35b0b-dda3-46a2-b337-1077998421a4'::uuid, 'f1000000-0000-4000-8000-000000000104'::uuid, 'gnat',   'gn', 'at', 'a small flying insect that bites',        '/næt/', '', ''),
  ('63a0d553-a19d-44eb-8af5-c3fd9a57bedd'::uuid, 'f1000000-0000-4000-8000-000000000104'::uuid, 'slat',   'sl', 'at', 'a thin strip of wood or material',        '/slæt/', '', ''),
  ('3d8bf964-072c-410d-afd4-11303569cc91'::uuid, 'f1000000-0000-4000-8000-000000000104'::uuid, 'drat',   'dr', 'at', 'a mild expression of annoyance',          '/dræt/', '', '')
) AS v(id, word_family_id, text, consonant, pattern, definition, phoneme, audio_url, slow_audio_url)
WHERE NOT EXISTS (SELECT 1 FROM words w WHERE w.text = v.text AND w.word_family_id = v.word_family_id);
