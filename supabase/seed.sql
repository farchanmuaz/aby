-- ─────────────────────────────────────────────────────────────────────────
-- arabiyya — seed data (from v2/data.js)
-- Run AFTER schema.sql and rls.sql
-- ─────────────────────────────────────────────────────────────────────────

-- Jilids
insert into jilids (id, name, level, unit_count, accent, locked, resume_unit, resume_progress) values
  ('jilid-1', 'الجزء الأوّل',   'مبتدئ',  8, '#292929', false, 3,    0.40),
  ('jilid-2', 'الجزء الثاني',   'متوسّط', 8, '#0bA5EC', false, null, null),
  ('jilid-3', 'الجزء الثالث',   'متقدّم', 8, '#222222', false, null, null),
  ('jilid-4', 'الجزء الرابع',   'قريباً', 0, '#cccccc', true,  null, null),
  ('jilid-5', 'الجزء الخامس',   'قريباً', 0, '#cccccc', true,  null, null),
  ('jilid-6', 'الجزء السّادس',  'قريباً', 0, '#cccccc', true,  null, null)
on conflict (id) do nothing;

-- Units for Jilid 1
insert into units (id, jilid_id, num, title, sub, status, words, progress) values
  ('j1-u1', 'jilid-1', 1, 'التّعارُف',       'السّلام والتّحيّة وأسماء البلدان', 'done',    18, 1.0),
  ('j1-u2', 'jilid-1', 2, 'العائلة',         'الأب والأمّ والإخوة والأخوات',     'done',    21, 1.0),
  ('j1-u3', 'jilid-1', 3, 'السّكَن',          'البيت وشوارع المدينة',             'current', 23, 0.40),
  ('j1-u4', 'jilid-1', 4, 'الحياة اليوميّة', 'الصّباح والظّهر والمساء',          'todo',    25, 0),
  ('j1-u5', 'jilid-1', 5, 'الدّراسة',        'الكتب والقلم والفصل الدّراسي',     'todo',    19, 0),
  ('j1-u6', 'jilid-1', 6, 'العمل',           'المهن والوظائف',                   'todo',    22, 0),
  ('j1-u7', 'jilid-1', 7, 'التّسوّق',         'الأسواق والأسعار',                 'todo',    24, 0),
  ('j1-u8', 'jilid-1', 8, 'السّفر',           'المطار والقطار والفنادق',          'todo',    20, 0)
on conflict (id) do nothing;

-- Materi for Jilid 1, Unit 3
insert into materi (id, jilid_id, unit_num, type, text, title, caption, lines, sort_order) values
  ('m-j1u3-1', 'jilid-1', 3, 'heading',   'الدّرس الثّالث · السّكَن', null, null, null, 1),
  ('m-j1u3-2', 'jilid-1', 3, 'paragraph', 'يتعرّف الطّالب في هذا الدّرس على المفردات المتعلّقة بالبيت والشّارع، ويتعلّم كيف يصف منزله، ويسأل غيره عن مكان السّكن.', null, null, null, 2),
  ('m-j1u3-3', 'jilid-1', 3, 'image',     null, null, 'حيٌّ صغير قرب الجامعة', null, 3),
  ('m-j1u3-4', 'jilid-1', 3, 'dialog',    null, 'حِوار · في شارع الجامعة', null,
    '[{"speaker":"أحمد","text":"السّلامُ عليكُم، أينَ تسكُن يا أخي؟"},{"speaker":"خالد","text":"وعليكم السّلام، أسكُنُ في شارع الجامعة، في منزلٍ صغير."},{"speaker":"أحمد","text":"هل المنزل قريبٌ من المسجد؟"},{"speaker":"خالد","text":"نعم، المسجدُ على بُعدِ خمسِ دقائق فقط."},{"speaker":"أحمد","text":"كم غرفةً في منزلك؟"},{"speaker":"خالد","text":"ثلاث غرف ومطبخٌ وحمّام، ومع منَ تسكُن أنت؟"},{"speaker":"أحمد","text":"أسكُنُ مع أُسرتي — أبي وأمّي وأخي."}]',
    4),
  ('m-j1u3-5', 'jilid-1', 3, 'note',      '«شارع الجامعة» مضافٌ ومضافٌ إليه. الياءُ المكسورةُ قبلَه ليست علامةَ تثنيةٍ بل علامةُ جرٍّ.', null, null, null, 5),
  ('m-j1u3-6', 'jilid-1', 3, 'paragraph', 'لاحظ كيف يستخدم خالد كلمة «صغير» لوصف منزله. الصّفة في العربيّة تتبع الموصوفَ في التّعريف والتّنكير والجنس والعدد والإعراب.', null, null, null, 6)
on conflict (id) do nothing;

-- Kamus for Jilid 1, Unit 3
insert into kamus (id, jilid_id, unit_num, kalimah, sharh, jam, mufrad, muradif, didh, mithal, tashrif, has_img) values
  ('k-j1u3-1',  'jilid-1', 3, 'شارِع',  'طريقٌ واسعٌ في المدينة يمشي فيه النّاس والسّيّارات.',                                              'شوارع',   null, null,     null,    'أسكُنُ في شارع الجامعة.',         null,                                                         true),
  ('k-j1u3-2',  'jilid-1', 3, 'مَنزِل', 'بيتٌ يسكُنُهُ الإنسان، يحوي غُرفاً ومطبخاً وحمّاماً.',                                             'منازل',   null, 'بيت',    null,    'منزلُهُ صغيرٌ وجميل.',           null,                                                         true),
  ('k-j1u3-3',  'jilid-1', 3, 'قريب',   'غيرُ بعيد، على مسافةٍ قليلة.',                                                                      null,      null, null,     'بعيد',  'المسجدُ قريبٌ من البيت.',        null,                                                         false),
  ('k-j1u3-4',  'jilid-1', 3, 'سَكَنَ',  'أقامَ في مكانٍ مّا واستقرَّ فيه.',                                                                 null,      null, 'أقامَ',  'رحلَ',  'سَكَنَ في المدينة مُنذُ سنتين.', '{"madhi":"سَكَنَ","mudhari":"يسكُنُ","masdar":"السُّكنى"}', false),
  ('k-j1u3-5',  'jilid-1', 3, 'مَسجِد', 'مكانُ الصّلاةِ عند المسلمين، فيه محرابٌ ومنبر.',                                                   'مساجد',   null, null,     null,    'يذهبُ المسلمونَ إلى المسجد.',   null,                                                         true),
  ('k-j1u3-6',  'jilid-1', 3, 'دَقيقة', 'جزءٌ من السّاعة، ستّون ثانية.',                                                                     'دقائق',   null, null,     null,    'انتظرتُهُ خمس دقائق.',          null,                                                         false),
  ('k-j1u3-7',  'jilid-1', 3, 'غُرفة',  'حُجرةٌ داخل المنزل لها بابٌ وجدرانٌ ونوافذ.',                                                      'غُرَف',   null, 'حُجرة',  null,    'غُرفتي صغيرةٌ ولكنّها مُريحة.', null,                                                         true),
  ('k-j1u3-8',  'jilid-1', 3, 'مَطبَخ', 'مكانٌ في البيت يُطبخُ فيه الطّعام.',                                                                'مطابخ',   null, null,     null,    'أمّي في المطبخ.',                null,                                                         true),
  ('k-j1u3-9',  'jilid-1', 3, 'حَمّام', 'مكانُ الاستحمامِ والوضوء في البيت.',                                                                'حمّامات', null, null,     null,    'الحمّامُ نظيف.',                 null,                                                         false),
  ('k-j1u3-10', 'jilid-1', 3, 'أُسرة',  'مجموعةُ أفرادٍ تجمعُهم صلةُ القرابة، عادةً الأب والأمّ والأبناء.', 'أُسَر', null, 'عائلة',  null, 'تعيشُ أُسرتي في الرّياض.',       null,                                                         false)
on conflict (id) do nothing;

-- Initial activity log
insert into activity (type, who, what, color) values
  ('edit',  'admin', 'حِوار في الدّرس ٣ — السّكَن',     '#d97757'),
  ('add',   'admin', 'كلمة جديدة: مَنزِل',               '#15803d'),
  ('image', 'admin', 'صورة إلى الدّرس ٢ — العائلة',      '#0bA5EC'),
  ('edit',  'admin', 'تصحيح ملاحظة نحويّة في «الحياة»', '#d97757'),
  ('add',   'admin', 'دَرس جديد: السّفر (مسوّدة)',        '#15803d');
