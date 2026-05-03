-- Create word_families and lessons that are missing, then add words
-- Run this after the other expansion migrations

-- ── Ensure -ack family and lesson exist ──────────────────────────────────
INSERT INTO word_families (id, pattern, sound, rule)
VALUES ('f1000000-0000-4000-8000-000000000201', '-ack', '/æk/', 'Short a followed by ck, as in back and pack.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (id, word_family_id, title, level)
VALUES ('f2000000-0000-4000-8000-000000000201', 'f1000000-0000-4000-8000-000000000201', 'The -ack family', 1)
ON CONFLICT (id) DO NOTHING;

-- ── Ensure -ick family and lesson exist ──────────────────────────────────
INSERT INTO word_families (id, pattern, sound, rule)
VALUES ('f1000000-0000-4000-8000-000000000202', '-ick', '/ɪk/', 'Short i followed by ck, as in pick and stick.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (id, word_family_id, title, level)
VALUES ('f2000000-0000-4000-8000-000000000202', 'f1000000-0000-4000-8000-000000000202', 'The -ick family', 1)
ON CONFLICT (id) DO NOTHING;

-- ── Ensure -uck family and lesson exist ──────────────────────────────────
INSERT INTO word_families (id, pattern, sound, rule)
VALUES ('f1000000-0000-4000-8000-000000000204', '-uck', '/ʌk/', 'Short u followed by ck, as in duck and luck.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (id, word_family_id, title, level)
VALUES ('f2000000-0000-4000-8000-000000000204', 'f1000000-0000-4000-8000-000000000204', 'The -uck family', 1)
ON CONFLICT (id) DO NOTHING;

-- ── Ensure -ace family and lesson exist ──────────────────────────────────
INSERT INTO word_families (id, pattern, sound, rule)
VALUES ('f1000000-0000-4000-8000-000000000205', '-ace', '/eɪs/', 'The a_e pattern says long A, as in face and race.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (id, word_family_id, title, level)
VALUES ('f2000000-0000-4000-8000-000000000205', 'f1000000-0000-4000-8000-000000000205', 'The -ace family', 2)
ON CONFLICT (id) DO NOTHING;

-- ── Ensure -ice family and lesson exist ──────────────────────────────────
INSERT INTO word_families (id, pattern, sound, rule)
VALUES ('f1000000-0000-4000-8000-000000000206', '-ice', '/aɪs/', 'The i_e pattern says long I, as in ice and mice.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (id, word_family_id, title, level)
VALUES ('f2000000-0000-4000-8000-000000000206', 'f1000000-0000-4000-8000-000000000206', 'The -ice family', 2)
ON CONFLICT (id) DO NOTHING;

-- ── Ensure -ope family and lesson exist ──────────────────────────────────
INSERT INTO word_families (id, pattern, sound, rule)
VALUES ('f1000000-0000-4000-8000-000000000207', '-ope', '/oʊp/', 'The o_e pattern says long O, as in hope and rope.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (id, word_family_id, title, level)
VALUES ('f2000000-0000-4000-8000-000000000207', 'f1000000-0000-4000-8000-000000000207', 'The -ope family', 2)
ON CONFLICT (id) DO NOTHING;

-- ── Ensure -eam family and lesson exist ──────────────────────────────────
INSERT INTO word_families (id, pattern, sound, rule)
VALUES ('f1000000-0000-4000-8000-000000000208', '-eam', '/iːm/', 'The ea vowel team says long E, as in team and dream.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (id, word_family_id, title, level)
VALUES ('f2000000-0000-4000-8000-000000000208', 'f1000000-0000-4000-8000-000000000208', 'The -eam family', 2)
ON CONFLICT (id) DO NOTHING;

-- ── Ensure -ail family and lesson exist ──────────────────────────────────
INSERT INTO word_families (id, pattern, sound, rule)
VALUES ('f1000000-0000-4000-8000-000000000209', '-ail', '/eɪl/', 'The ai spelling says long A before l, as in mail and tail.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (id, word_family_id, title, level)
VALUES ('f2000000-0000-4000-8000-000000000209', 'f1000000-0000-4000-8000-000000000209', 'The -ail family', 2)
ON CONFLICT (id) DO NOTHING;

-- ── Ensure -een family and lesson exist ──────────────────────────────────
INSERT INTO word_families (id, pattern, sound, rule)
VALUES ('f1000000-0000-4000-8000-000000000210', '-een', '/iːn/', 'The ee vowel team says long E before n, as in green and queen.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (id, word_family_id, title, level)
VALUES ('f2000000-0000-4000-8000-000000000210', 'f1000000-0000-4000-8000-000000000210', 'The -een family', 2)
ON CONFLICT (id) DO NOTHING;
