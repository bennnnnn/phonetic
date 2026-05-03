-- Expand the -ake word family with additional words
-- Adds: ache, fake, rake, drake, break, intake, mistake, retake, remake, outbreak, earthquake, keepsake
-- (word_family_id: f1000000-0000-4000-8000-000000000001)

INSERT INTO words (id, word_family_id, text, consonant, pattern, definition, phoneme, audio_url, slow_audio_url)
SELECT * FROM (VALUES
  ('ca876a7f-64f0-4be0-8bc6-d53083172afc'::uuid, 'f1000000-0000-4000-8000-000000000001'::uuid, 'ache',   'a',   'ke',   'a dull continuous pain',                 '/eɪk/', '', ''),
  ('18009285-cebf-42dd-9a5a-79b4e0b5d458'::uuid, 'f1000000-0000-4000-8000-000000000001'::uuid, 'fake',   'f',   'ake',  'not real; false',                         '/feɪk/', '', ''),
  ('271438ee-ff38-463a-9518-315d73951387'::uuid, 'f1000000-0000-4000-8000-000000000001'::uuid, 'rake',   'r',   'ake',  'a garden tool with teeth; to gather',     '/reɪk/', '', ''),
  ('f024d689-875d-47a5-8fa3-609f2e23fcac'::uuid, 'f1000000-0000-4000-8000-000000000001'::uuid, 'drake',  'dr',  'ake',  'a male duck',                             '/dreɪk/', '', ''),
  ('e64d6755-f17f-44c7-a5c5-0baacf4182c0'::uuid, 'f1000000-0000-4000-8000-000000000001'::uuid, 'break',  'br',  'eak',  'to separate into pieces',                 '/breɪk/', '', ''),
  ('6ae1931a-caea-4d45-9047-edc25384cc1e'::uuid, 'f1000000-0000-4000-8000-000000000001'::uuid, 'intake',   'int',   'ake', 'the amount taken in',                      '/ˈɪnteɪk/', '', ''),
  ('0a6a6e49-8fbd-4556-97b4-8e6619a0b9f9'::uuid, 'f1000000-0000-4000-8000-000000000001'::uuid, 'mistake',  'mist',  'ake', 'something done wrong; an error',           '/mɪˈsteɪk/', '', ''),
  ('64436aef-41e7-4c6f-9083-3416af611810'::uuid, 'f1000000-0000-4000-8000-000000000001'::uuid, 'retake',   'ret',   'ake', 'to take again',                            '/ˌriːˈteɪk/', '', ''),
  ('bcedbbc6-9a54-420a-a0fe-4ed0e4a1ee53'::uuid, 'f1000000-0000-4000-8000-000000000001'::uuid, 'remake',   'rem',   'ake', 'to make again or differently',             '/ˌriːˈmeɪk/', '', ''),
  ('909a0e29-5106-45b9-bf03-82956ab46815'::uuid, 'f1000000-0000-4000-8000-000000000001'::uuid, 'outbreak', 'outbr','eak',  'a sudden start of something bad',          '/ˈaʊtbreɪk/', '', ''),
  ('42ecf475-15db-4365-baa1-027de2623c50'::uuid, 'f1000000-0000-4000-8000-000000000001'::uuid, 'earthquake','earth','quake','a shaking of the ground',                   '/ˈɜːrθkweɪk/', '', ''),
  ('d82eb9ac-2c18-42ac-9d25-8bfe7a23cd11'::uuid, 'f1000000-0000-4000-8000-000000000001'::uuid, 'keepsake', 'keeps','ake',  'a small item kept in memory of someone',   '/ˈkiːpseɪk/', '', '')
) AS v(id, word_family_id, text, consonant, pattern, definition, phoneme, audio_url, slow_audio_url)
WHERE NOT EXISTS (SELECT 1 FROM words w WHERE w.text = v.text AND w.word_family_id = v.word_family_id);
