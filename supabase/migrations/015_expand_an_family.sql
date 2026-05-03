-- Expand the -an word family with additional words
-- Adds: ban, flan, began, human, woman, urban, organ
-- (word_family_id: f1000000-0000-4000-8000-000000000105)
-- Already in DB: man, can, pan, fan, ran, tan, van, plan, bran, clan, scan, than, span, swan

INSERT INTO words (id, word_family_id, text, consonant, pattern, definition, phoneme, audio_url, slow_audio_url)
SELECT * FROM (VALUES
  ('b7e3a1f2-4c8d-4a2b-9e1f-6d5c8b7a3e2f'::uuid, 'f1000000-0000-4000-8000-000000000105'::uuid, 'ban',   'b',  'an', 'to forbid or prohibit',                  '/bæn/', '', ''),
  ('c8f4b2a3-5d9e-4b3c-0f2a-7e6d9c8b4f3a'::uuid, 'f1000000-0000-4000-8000-000000000105'::uuid, 'flan',  'fl', 'an', 'a baked dessert with a caramel top',    '/flæn/', '', ''),
  ('d9a5c3b4-6e0f-4c4d-1a3b-8f7e0d9c5a4b'::uuid, 'f1000000-0000-4000-8000-000000000105'::uuid, 'began', 'beg','an', 'past tense of begin',                    '/bɪˈɡæn/', '', ''),
  ('e0b6d4c5-7f1a-4d5e-2b4c-9a8f1e0d6b5c'::uuid, 'f1000000-0000-4000-8000-000000000105'::uuid, 'human', 'hum','an', 'a person',                                '/ˈhjuːmən/', '', ''),
  ('f1c7e5d6-8a2b-4e6f-3c5d-0b9a2f1e7c6d'::uuid, 'f1000000-0000-4000-8000-000000000105'::uuid, 'woman', 'wom','an', 'an adult female person',                 '/ˈwʊmən/', '', ''),
  ('a2d8f6e7-9b3c-4f7a-4d6e-1c0b3a2f8d7e'::uuid, 'f1000000-0000-4000-8000-000000000105'::uuid, 'urban', 'urb','an', 'relating to a city',                     '/ˈɜːrbən/', '', ''),
  ('b3e9a7f8-0c4d-4a8b-5e7f-2d1c4b3a9e8f'::uuid, 'f1000000-0000-4000-8000-000000000105'::uuid, 'organ', 'org','an', 'a part of the body with a function',    '/ˈɔːrɡən/', '', '')
) AS v(id, word_family_id, text, consonant, pattern, definition, phoneme, audio_url, slow_audio_url)
WHERE NOT EXISTS (SELECT 1 FROM words w WHERE w.text = v.text AND w.word_family_id = v.word_family_id);
