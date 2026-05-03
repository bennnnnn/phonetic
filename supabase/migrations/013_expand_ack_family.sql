-- Expand the -ack word family with additional words
-- Adds: wack, slack, attack, hijack, feedback, payback, comeback, rollback, drawback
-- (word_family_id: f1000000-0000-4000-8000-000000000201)

INSERT INTO words (id, word_family_id, text, consonant, pattern, definition, phoneme, audio_url, slow_audio_url)
SELECT * FROM (VALUES
  ('0b7388ae-96d3-45c5-982e-4abd9365f423'::uuid, 'f1000000-0000-4000-8000-000000000201'::uuid, 'wack',   'w',  'ack', 'funny or eccentric; of poor quality',     '/wæk/', '', ''),
  ('4e581dee-e6bd-4b40-bd26-d14aa9e743b3'::uuid, 'f1000000-0000-4000-8000-000000000201'::uuid, 'slack',  'sl', 'ack', 'loose; not tight; to slow down',          '/slæk/', '', ''),
  ('36a9873f-3fa9-4264-9471-99925d343ca1'::uuid, 'f1000000-0000-4000-8000-000000000201'::uuid, 'attack',  'att',  'ack', 'to try to hurt or damage',              '/əˈtæk/', '', ''),
  ('446ad727-5fe6-4311-9fac-c3354a049071'::uuid, 'f1000000-0000-4000-8000-000000000201'::uuid, 'hijack',  'hij',  'ack', 'to take control of a vehicle by force', '/ˈhaɪdʒæk/', '', ''),
  ('2ff6afce-e647-4c45-b54f-faa4f91e6de0'::uuid, 'f1000000-0000-4000-8000-000000000201'::uuid, 'feedback','feedb','ack', 'info about how well something is done', '/ˈfiːdbæk/', '', ''),
  ('d56d3454-4a65-4a66-96ee-9165678ec758'::uuid, 'f1000000-0000-4000-8000-000000000201'::uuid, 'payback', 'payb', 'ack', 'revenge; return of money owed',          '/ˈpeɪbæk/', '', ''),
  ('e9250642-31ef-4d54-aab5-9749d493140d'::uuid, 'f1000000-0000-4000-8000-000000000201'::uuid, 'comeback','comeb','ack', 'a return to popularity; a witty reply',  '/ˈkʌmbæk/', '', ''),
  ('a6c7ddac-9b1f-4831-af28-295ed123637a'::uuid, 'f1000000-0000-4000-8000-000000000201'::uuid, 'rollback','rollb','ack', 'a return to a previous state',           '/ˈroʊlbæk/', '', ''),
  ('d6353163-60e4-4d94-ba95-8e2ab1a33533'::uuid, 'f1000000-0000-4000-8000-000000000201'::uuid, 'drawback','drawb','ack', 'a disadvantage or problem',              '/ˈdrɔːbæk/', '', '')
) AS v(id, word_family_id, text, consonant, pattern, definition, phoneme, audio_url, slow_audio_url)
WHERE NOT EXISTS (SELECT 1 FROM words w WHERE w.text = v.text AND w.word_family_id = v.word_family_id);
