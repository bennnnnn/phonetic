-- Expand remaining phonics word families to ~20 words each
-- Idempotent — safe to re-run

-- ── -eal (id 101) — currently 12 words, adding 5 ─────────────────────────
-- Already: deal, meal, seal, peal, feal, veal, real, heal, steal, squeal, appeal, reveal
INSERT INTO words (id, word_family_id, text, consonant, pattern, definition, phoneme, audio_url, slow_audio_url)
SELECT * FROM (VALUES
  ('558b53b2-2b56-4fe2-a9fa-cf159a709803'::uuid, 'f1000000-0000-4000-8000-000000000101'::uuid, 'conceal','conc','eal', 'to hide or keep secret',                 '/kənˈsiːl/', '', ''),
  ('630aaf94-5cf3-4434-8f66-458dbcc283e0'::uuid, 'f1000000-0000-4000-8000-000000000101'::uuid, 'zeal',   'z',  'eal', 'great energy or enthusiasm',             '/ziːl/', '', ''),
  ('c329cbe6-67f7-4a61-a006-6fb68444ec49'::uuid, 'f1000000-0000-4000-8000-000000000101'::uuid, 'congeal','cong','eal', 'to change from liquid to solid',         '/kənˈdʒiːl/', '', '')
) AS v(id, word_family_id, text, consonant, pattern, definition, phoneme, audio_url, slow_audio_url)
WHERE NOT EXISTS (SELECT 1 FROM words w WHERE w.text = v.text AND w.word_family_id = v.word_family_id);

-- ── -et (id 102) — currently 14 words, adding 4 ──────────────────────────
-- Already: get, set, met, vet, wet, pet, net, jet, let, yet, bet, fret, reset, regret
INSERT INTO words (id, word_family_id, text, consonant, pattern, definition, phoneme, audio_url, slow_audio_url)
SELECT * FROM (VALUES
  ('c9db8d61-1896-4096-b098-e3113617dd31'::uuid, 'f1000000-0000-4000-8000-000000000102'::uuid, 'threat', 'thr','eat', 'a statement of intent to harm',          '/θrɛt/', '', ''),
  ('f60c1f45-2049-453a-8874-b92954e24349'::uuid, 'f1000000-0000-4000-8000-000000000102'::uuid, 'trek',   'tr', 'ek',  'a long difficult journey',               '/trɛk/', '', ''),
  ('377582c4-d8cd-4e07-bad5-d6632bcdf26f'::uuid, 'f1000000-0000-4000-8000-000000000102'::uuid, 'sweat',  'sw', 'eat', 'liquid from skin; to work hard',         '/swɛt/', '', ''),
  ('873d1a07-355c-4e55-9cb7-c0b0067ae8db'::uuid, 'f1000000-0000-4000-8000-000000000102'::uuid, 'chef',   'ch', 'ef',  'a professional cook',                     '/ʃɛf/', '', '')
) AS v(id, word_family_id, text, consonant, pattern, definition, phoneme, audio_url, slow_audio_url)
WHERE NOT EXISTS (SELECT 1 FROM words w WHERE w.text = v.text AND w.word_family_id = v.word_family_id);

-- ── -ell (id 106) — currently 12 words, adding 4 ─────────────────────────
-- Already: bell, sell, tell, well, fell, yell, spell, smell, dwell, shell, swell
INSERT INTO words (id, word_family_id, text, consonant, pattern, definition, phoneme, audio_url, slow_audio_url)
SELECT * FROM (VALUES
  ('b638ff98-36fd-4e55-8307-62ee67ac001f'::uuid, 'f1000000-0000-4000-8000-000000000106'::uuid, 'cell',   'c',  'ell', 'a small room; basic unit of life',       '/sɛl/', '', ''),
  ('284424cf-ab85-4c50-a784-98f715d7d9a7'::uuid, 'f1000000-0000-4000-8000-000000000106'::uuid, 'jell',   'j',  'ell', 'to set or become firm',                  '/dʒɛl/', '', ''),
  ('7d29a7db-91cb-4fed-9ce1-a3b8c29e8dff'::uuid, 'f1000000-0000-4000-8000-000000000106'::uuid, 'kneel',  'kn', 'eel', 'to rest on the knees',                   '/niːl/', '', ''),
  ('d4325072-d63c-4e31-ba5a-64f7fc88181c'::uuid, 'f1000000-0000-4000-8000-000000000106'::uuid, 'pellets','pell','ets', 'small hard balls or pieces',             '/ˈpɛlɪts/', '', '')
) AS v(id, word_family_id, text, consonant, pattern, definition, phoneme, audio_url, slow_audio_url)
WHERE NOT EXISTS (SELECT 1 FROM words w WHERE w.text = v.text AND w.word_family_id = v.word_family_id);

-- ── -ock (id 107) — currently 13 words, adding 5 ─────────────────────────
-- Already: lock, rock, sock, dock, clock, block, knock, shock, stock, flock, crock, smock, pock
INSERT INTO words (id, word_family_id, text, consonant, pattern, definition, phoneme, audio_url, slow_audio_url)
SELECT * FROM (VALUES
  ('84fdab31-b8f2-4063-9c80-88c51765e305'::uuid, 'f1000000-0000-4000-8000-000000000107'::uuid, 'mock',   'm',  'ock', 'to make fun of',                         '/mɒk/', '', ''),
  ('3f2d1551-33d9-4807-94a5-f35f6a36e1dd'::uuid, 'f1000000-0000-4000-8000-000000000107'::uuid, 'hock',   'h',  'ock', 'to pawn; a joint of an animal leg',       '/hɒk/', '', ''),
  ('89cad98b-05bf-4fd2-a06d-0be688c2875b'::uuid, 'f1000000-0000-4000-8000-000000000107'::uuid, 'frock',  'fr', 'ock', 'a dress or gown',                         '/frɒk/', '', ''),
  ('bd7b2921-9f5d-4d76-b163-bad65df7d6d7'::uuid, 'f1000000-0000-4000-8000-000000000107'::uuid, 'bollard','boll','ard', 'a short post used for traffic control',  '/ˈbɒlərd/', '', '')
) AS v(id, word_family_id, text, consonant, pattern, definition, phoneme, audio_url, slow_audio_url)
WHERE NOT EXISTS (SELECT 1 FROM words w WHERE w.text = v.text AND w.word_family_id = v.word_family_id);

-- ── -ug (id 108) — currently 13 words, adding 4 ──────────────────────────
-- Already: bug, rug, hug, mug, jug, plug, slug, tug, dug, shrug, snug, thug, chug
INSERT INTO words (id, word_family_id, text, consonant, pattern, definition, phoneme, audio_url, slow_audio_url)
SELECT * FROM (VALUES
  ('8596e4d5-0a84-4089-8383-998f6a55df18'::uuid, 'f1000000-0000-4000-8000-000000000108'::uuid, 'smug',   'sm', 'ug', 'self-satisfied; too pleased with oneself','/smʌg/', '', ''),
  ('9e9ab590-ac70-4277-8df5-5944b3a68719'::uuid, 'f1000000-0000-4000-8000-000000000108'::uuid, 'drug',   'dr', 'ug', 'a substance used as medicine or illegally','/drʌg/', '', ''),
  ('b1fce072-a868-4ce5-b6fd-5413a2b33a01'::uuid, 'f1000000-0000-4000-8000-000000000108'::uuid, 'pug',    'p',  'ug', 'a small dog with a wrinkled face',        '/pʌg/', '', ''),
  ('7134cf40-c008-4307-b3f9-12524a448e93'::uuid, 'f1000000-0000-4000-8000-000000000108'::uuid, 'lug',    'l',  'ug', 'to carry or drag something heavy',        '/lʌg/', '', '')
) AS v(id, word_family_id, text, consonant, pattern, definition, phoneme, audio_url, slow_audio_url)
WHERE NOT EXISTS (SELECT 1 FROM words w WHERE w.text = v.text AND w.word_family_id = v.word_family_id);

-- ── -un (id 109) — currently 9 words, adding 6 ───────────────────────────
-- Already: fun, run, sun, bun, gun, nun, spun, stun, shun
INSERT INTO words (id, word_family_id, text, consonant, pattern, definition, phoneme, audio_url, slow_audio_url)
SELECT * FROM (VALUES
  ('b64ed9c0-63c0-43e3-964d-6e641fb22087'::uuid, 'f1000000-0000-4000-8000-000000000109'::uuid, 'hun',    'h',  'un', 'a member of a nomadic group (informal)', '/hʌn/', '', ''),
  ('abd6bb99-14d0-47fe-9e17-8d730a41d6f9'::uuid, 'f1000000-0000-4000-8000-000000000109'::uuid, 'punt',   'p',  'unt', 'to kick a ball before it hits the ground','/pʌnt/', '', ''),
  ('41c5ab24-42de-4dcd-953b-81de1545fb7a'::uuid, 'f1000000-0000-4000-8000-000000000109'::uuid, 'bunk',   'b',  'unk', 'a narrow bed; to run away',              '/bʌŋk/', '', ''),
  ('6afe98cf-996c-4e91-8600-22eafd19feae'::uuid, 'f1000000-0000-4000-8000-000000000109'::uuid, 'dunk',   'd',  'unk', 'to dip into liquid',                      '/dʌŋk/', '', ''),
  ('62a62398-eb5e-4577-a6e3-1786c93e0f48'::uuid, 'f1000000-0000-4000-8000-000000000109'::uuid, 'junk',   'j',  'unk', 'old or unwanted items',                   '/dʒʌŋk/', '', ''),
  ('483af9bb-5045-42ba-bfcb-a8ae3bc39894'::uuid, 'f1000000-0000-4000-8000-000000000109'::uuid, 'trunk',  'tr', 'unk', 'the main stem of a tree; car storage',   '/trʌŋk/', '', '')
) AS v(id, word_family_id, text, consonant, pattern, definition, phoneme, audio_url, slow_audio_url)
WHERE NOT EXISTS (SELECT 1 FROM words w WHERE w.text = v.text AND w.word_family_id = v.word_family_id);

-- ── -op (id 110) — currently 12 words, adding 5 ──────────────────────────
-- Already: top, hop, mop, pop, stop, drop, shop, crop, flop, plop, sloop, swoop
INSERT INTO words (id, word_family_id, text, consonant, pattern, definition, phoneme, audio_url, slow_audio_url)
SELECT * FROM (VALUES
  ('c90a884e-ca4c-4f61-b43c-b18d3fe8379d'::uuid, 'f1000000-0000-4000-8000-000000000110'::uuid, 'bop',    'b',  'op', 'a style of jazz; to hit lightly',         '/bɒp/', '', ''),
  ('9d73b541-1afe-4cf6-8a3c-26f330ad32d2'::uuid, 'f1000000-0000-4000-8000-000000000110'::uuid, 'cop',    'c',  'op', 'a police officer (informal)',             '/kɒp/', '', ''),
  ('8815bba3-529b-49ca-bfed-48f900bafb68'::uuid, 'f1000000-0000-4000-8000-000000000110'::uuid, 'chop',   'ch', 'op', 'to cut into pieces',                      '/tʃɒp/', '', ''),
  ('0a142852-60ce-434a-8b30-3b7edd0dbd6c'::uuid, 'f1000000-0000-4000-8000-000000000110'::uuid, 'prop',   'pr', 'op', 'a support; a theater object',             '/prɒp/', '', ''),
  ('f2c8ab37-b165-463b-9e56-84a7739f3b38'::uuid, 'f1000000-0000-4000-8000-000000000110'::uuid, 'sop',    's',  'op', 'to soak up liquid; a piece of food',      '/sɒp/', '', '')
) AS v(id, word_family_id, text, consonant, pattern, definition, phoneme, audio_url, slow_audio_url)
WHERE NOT EXISTS (SELECT 1 FROM words w WHERE w.text = v.text AND w.word_family_id = v.word_family_id);
