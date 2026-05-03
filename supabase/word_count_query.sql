-- Show word count per word family pattern
-- This helps verify which families have how many words

SELECT 
  wf.pattern,
  COUNT(w.id) AS word_count
FROM word_families wf
LEFT JOIN words w ON w.word_family_id = wf.id
GROUP BY wf.pattern
ORDER BY wf.pattern;
