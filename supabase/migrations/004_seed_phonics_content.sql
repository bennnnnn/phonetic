-- Sample word families, words, and lessons for PhonicsFlow home / lesson flows.
-- Idempotent: fixed UUIDs + ON CONFLICT DO NOTHING.

-- Word families
INSERT INTO word_families (id, pattern, sound, rule) VALUES
  ('f1000000-0000-4000-8000-000000000001', '-ake', '/eɪk/', 'The vowel a often says its name (long A) in the a_e pattern, like in cake and bake.'),
  ('f1000000-0000-4000-8000-000000000002', '-ight', '/aɪt/', 'The letter group igh usually spells the long I sound, as in light and night.'),
  ('f1000000-0000-4000-8000-000000000003', '-ip', '/ɪp/', 'Short i followed by p keeps a crisp /ɪ/ vowel, as in sip and tip.'),
  ('f1000000-0000-4000-8000-000000000004', '-oat', '/oʊt/', 'The vowel team oa often says /oʊ/, as in boat and coat.'),
  ('f1000000-0000-4000-8000-000000000005', '-ain', '/eɪn/', 'The ai spelling often says long A before n, as in rain and train.')
ON CONFLICT (id) DO NOTHING;

-- Lessons (one per family; levels match unlock ladder on home)
INSERT INTO lessons (id, word_family_id, title, level) VALUES
  ('f2000000-0000-4000-8000-000000000001', 'f1000000-0000-4000-8000-000000000001', 'The -ake family', 1),
  ('f2000000-0000-4000-8000-000000000002', 'f1000000-0000-4000-8000-000000000002', 'The -ight family', 1),
  ('f2000000-0000-4000-8000-000000000003', 'f1000000-0000-4000-8000-000000000003', 'The -ip family', 2),
  ('f2000000-0000-4000-8000-000000000004', 'f1000000-0000-4000-8000-000000000004', 'The -oat family', 2),
  ('f2000000-0000-4000-8000-000000000005', 'f1000000-0000-4000-8000-000000000005', 'The -ain family', 3)
ON CONFLICT (id) DO NOTHING;

-- Words (audio URLs empty until you generate assets)
INSERT INTO words (id, word_family_id, text, consonant, pattern, definition, phoneme, audio_url, slow_audio_url) VALUES
  ('f3000000-0000-4000-8000-000000000001', 'f1000000-0000-4000-8000-000000000001', 'bake', 'b', 'ake', 'to cook in an oven', '/beɪk/', '', ''),
  ('f3000000-0000-4000-8000-000000000002', 'f1000000-0000-4000-8000-000000000001', 'cake', 'c', 'ake', 'a sweet dessert', '/keɪk/', '', ''),
  ('f3000000-0000-4000-8000-000000000003', 'f1000000-0000-4000-8000-000000000001', 'lake', 'l', 'ake', 'a body of water', '/leɪk/', '', ''),
  ('f3000000-0000-4000-8000-000000000004', 'f1000000-0000-4000-8000-000000000001', 'take', 't', 'ake', 'to grab or carry away', '/teɪk/', '', ''),
  ('f3000000-0000-4000-8000-000000000005', 'f1000000-0000-4000-8000-000000000002', 'light', 'l', 'ight', 'brightness; not heavy', '/laɪt/', '', ''),
  ('f3000000-0000-4000-8000-000000000006', 'f1000000-0000-4000-8000-000000000002', 'night', 'n', 'ight', 'the dark time of day', '/naɪt/', '', ''),
  ('f3000000-0000-4000-8000-000000000007', 'f1000000-0000-4000-8000-000000000002', 'sight', 's', 'ight', 'something you see', '/saɪt/', '', ''),
  ('f3000000-0000-4000-8000-000000000008', 'f1000000-0000-4000-8000-000000000002', 'fight', 'f', 'ight', 'a battle or struggle', '/faɪt/', '', ''),
  ('f3000000-0000-4000-8000-000000000009', 'f1000000-0000-4000-8000-000000000003', 'dip', 'd', 'ip', 'to lower briefly into liquid', '/dɪp/', '', ''),
  ('f3000000-0000-4000-8000-00000000000a', 'f1000000-0000-4000-8000-000000000003', 'sip', 's', 'ip', 'to drink a little at a time', '/sɪp/', '', ''),
  ('f3000000-0000-4000-8000-00000000000b', 'f1000000-0000-4000-8000-000000000003', 'tip', 't', 'ip', 'the end point; a small gift of money', '/tɪp/', '', ''),
  ('f3000000-0000-4000-8000-00000000000c', 'f1000000-0000-4000-8000-000000000003', 'zip', 'z', 'ip', 'a fastener; to move quickly', '/zɪp/', '', ''),
  ('f3000000-0000-4000-8000-00000000000d', 'f1000000-0000-4000-8000-000000000004', 'boat', 'b', 'oat', 'a small ship', '/boʊt/', '', ''),
  ('f3000000-0000-4000-8000-00000000000e', 'f1000000-0000-4000-8000-000000000004', 'coat', 'c', 'oat', 'something you wear outside', '/koʊt/', '', ''),
  ('f3000000-0000-4000-8000-00000000000f', 'f1000000-0000-4000-8000-000000000004', 'goat', 'g', 'oat', 'a farm animal', '/ɡoʊt/', '', ''),
  ('f3000000-0000-4000-8000-000000000010', 'f1000000-0000-4000-8000-000000000004', 'float', 'fl', 'oat', 'to rest on top of liquid', '/floʊt/', '', ''),
  ('f3000000-0000-4000-8000-000000000011', 'f1000000-0000-4000-8000-000000000005', 'rain', 'r', 'ain', 'water falling from clouds', '/reɪn/', '', ''),
  ('f3000000-0000-4000-8000-000000000012', 'f1000000-0000-4000-8000-000000000005', 'pain', 'p', 'ain', 'hurt you feel', '/peɪn/', '', ''),
  ('f3000000-0000-4000-8000-000000000013', 'f1000000-0000-4000-8000-000000000005', 'train', 'tr', 'ain', 'linked cars on rails; to teach', '/treɪn/', '', ''),
  ('f3000000-0000-4000-8000-000000000014', 'f1000000-0000-4000-8000-000000000005', 'plain', 'pl', 'ain', 'simple; a wide flat area', '/pleɪn/', '', '')
ON CONFLICT (id) DO NOTHING;
