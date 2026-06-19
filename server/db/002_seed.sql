INSERT INTO blogs (
  title,
  slug,
  excerpt,
  content,
  cover_image_url,
  image_urls,
  published,
  posted_at,
  view_count,
  created_at
)
VALUES
  (
    'คู่มือเริ่มต้นเขียนบล็อกท่องเที่ยวไทย',
    'thai-travel-blog-guide',
    'วิธีวางโครงเรื่อง เลือกรูป และเล่าเสน่ห์ของสถานที่ไทยให้น่าอ่าน',
    'การเขียนบล็อกท่องเที่ยวที่ดีเริ่มจากประสบการณ์จริง เลือกประเด็นที่ชัดเจน แล้วเล่าให้ผู้อ่านเห็นภาพทั้งเส้นทาง อาหาร ผู้คน และบรรยากาศในพื้นที่',
    'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80'
    ],
    true,
    NOW() - INTERVAL '12 days',
    128,
    NOW() - INTERVAL '12 days'
  ),
  (
    'กาแฟยามเช้ากับชุมชนเมืองเก่า',
    'morning-coffee-old-town',
    'บันทึกคาเฟ่เล็ก ๆ ในย่านเมืองเก่าที่เหมาะกับการเริ่มวันช้า ๆ',
    'กลิ่นกาแฟคั่วอ่อน เสียงถ้วยกระทบจาน และบทสนทนาของคนในชุมชนทำให้คาเฟ่แห่งนี้เป็นมากกว่าร้านเครื่องดื่ม แต่เป็นพื้นที่พบปะที่อบอุ่น',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80'],
    true,
    NOW() - INTERVAL '11 days',
    94,
    NOW() - INTERVAL '11 days'
  ),
  (
    'จัดโต๊ะทำงานให้โฟกัสได้นานขึ้น',
    'focused-workspace-setup',
    'แนวคิดง่าย ๆ สำหรับโต๊ะทำงานที่สะอาด สงบ และไม่รบกวนสมาธิ',
    'โต๊ะทำงานที่ดีไม่จำเป็นต้องมีของเยอะ เพียงจัดแสงให้เหมาะ วางของที่ใช้บ่อยให้อยู่ใกล้มือ และเว้นพื้นที่ว่างให้ความคิดได้หายใจ',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80'],
    true,
    NOW() - INTERVAL '10 days',
    73,
    NOW() - INTERVAL '10 days'
  ),
  (
    'ตลาดเช้าริมน้ำและอาหารพื้นบ้าน',
    'riverside-morning-market',
    'สำรวจตลาดเช้าที่เต็มไปด้วยอาหารไทย กลิ่นสมุนไพร และรอยยิ้มของแม่ค้า',
    'ตลาดริมน้ำเป็นภาพจำของวิถีชีวิตไทยที่ยังมีชีวิตชีวา ทั้งข้าวแกง ขนมไทย ผลไม้ตามฤดูกาล และเรือขายอาหารที่แล่นผ่านอย่างคุ้นเคย',
    'https://images.unsplash.com/photo-1552550018-5253c1b171e1?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1552550018-5253c1b171e1?auto=format&fit=crop&w=1200&q=80'],
    true,
    NOW() - INTERVAL '9 days',
    82,
    NOW() - INTERVAL '9 days'
  ),
  (
    'อ่านหนังสือในวันที่ฝนตก',
    'rainy-day-reading',
    'รายการหนังสือและบรรยากาศเงียบ ๆ สำหรับวันฝนพรำ',
    'วันที่ฝนตกเหมาะกับการอ่านเรื่องสั้น บันทึกความทรงจำ หรือหนังสือที่เปิดพื้นที่ให้คิดช้า ๆ เสียงฝนช่วยให้เราจดจ่อกับหน้ากระดาษมากขึ้น',
    'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1200&q=80'],
    true,
    NOW() - INTERVAL '8 days',
    61,
    NOW() - INTERVAL '8 days'
  ),
  (
    'เส้นทางจักรยานในสวนกลางเมือง',
    'city-park-cycling-route',
    'แนะนำเส้นทางปั่นจักรยานสั้น ๆ สำหรับคนเมืองที่อยากขยับร่างกาย',
    'สวนกลางเมืองให้พื้นที่สีเขียวสำหรับออกกำลังกายโดยไม่ต้องเดินทางไกล เส้นทางที่ปลอดภัยและมีจุดพักช่วยให้มือใหม่เริ่มต้นได้ง่าย',
    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80'],
    true,
    NOW() - INTERVAL '7 days',
    57,
    NOW() - INTERVAL '7 days'
  ),
  (
    'อาหารเหนือรสละมุนที่ควรลอง',
    'northern-thai-food-to-try',
    'จากข้าวซอยถึงน้ำพริกหนุ่ม เมนูเมืองเหนือที่เล่าเรื่องภูมิภาคผ่านรสชาติ',
    'อาหารเหนือมีความนุ่มนวลจากสมุนไพรและเครื่องแกงที่ไม่จัดเกินไป แต่ยังมีกลิ่นเฉพาะตัว เมนูแต่ละจานสะท้อนอากาศ ภูมิประเทศ และวัฒนธรรมการกินร่วมกัน',
    'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?auto=format&fit=crop&w=1200&q=80'],
    true,
    NOW() - INTERVAL '6 days',
    106,
    NOW() - INTERVAL '6 days'
  ),
  (
    'บันทึกจากเวิร์กช็อปถ่ายภาพมือถือ',
    'mobile-photography-workshop-notes',
    'เทคนิคแสง องค์ประกอบภาพ และการเล่าเรื่องด้วยกล้องมือถือ',
    'กล้องมือถือทำให้ทุกคนเริ่มถ่ายภาพได้ทันที สิ่งสำคัญคือการมองหาแสงธรรมชาติ จัดองค์ประกอบให้เรียบง่าย และรอจังหวะที่ภาพมีชีวิต',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80'],
    true,
    NOW() - INTERVAL '5 days',
    49,
    NOW() - INTERVAL '5 days'
  ),
  (
    'สวนสมุนไพรเล็ก ๆ หลังบ้าน',
    'small-herb-garden',
    'ปลูกกะเพรา โหระพา และสะระแหน่ในพื้นที่จำกัดสำหรับครัวไทย',
    'สมุนไพรไทยหลายชนิดปลูกง่ายในกระถาง ขอเพียงมีแดดพอประมาณ ดินระบายน้ำดี และหมั่นตัดยอดเพื่อให้ต้นแตกกิ่งใหม่',
    'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80'],
    true,
    NOW() - INTERVAL '4 days',
    68,
    NOW() - INTERVAL '4 days'
  ),
  (
    'แนวคิดบทความเรื่องชุมชนสร้างสรรค์',
    'creative-community-draft',
    'ร่างบทความเกี่ยวกับพื้นที่สร้างสรรค์ในชุมชนที่กำลังรวบรวมข้อมูลเพิ่มเติม',
    'บทความฉบับร่างนี้จะสำรวจว่าพื้นที่สร้างสรรค์ช่วยให้คนรุ่นใหม่กลับมาเชื่อมโยงกับชุมชนเดิมผ่านงานศิลปะ อาหาร และกิจกรรมสาธารณะได้อย่างไร',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80'],
    false,
    NOW() - INTERVAL '3 days',
    0,
    NOW() - INTERVAL '3 days'
  ),
  (
    'รีวิวที่พักริมทะเลแบบครอบครัว',
    'family-seaside-stay-review',
    'ร่างรีวิวที่พักติดทะเลสำหรับครอบครัว มีพื้นที่เด็กและอาหารเช้า',
    'กำลังตรวจสอบรายละเอียดบริการ ห้องพัก และภาพประกอบก่อนเผยแพร่ เพื่อให้ข้อมูลครบถ้วนและเป็นธรรมกับผู้อ่านที่วางแผนเดินทางพร้อมครอบครัว',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'],
    false,
    NOW() - INTERVAL '2 days',
    0,
    NOW() - INTERVAL '2 days'
  ),
  (
    'เดินเล่นย่านศิลปะวันเสาร์',
    'saturday-art-district-walk',
    'แกลเลอรีเล็ก ๆ ร้านหนังสือ และผนังเมืองที่เต็มไปด้วยงานศิลป์',
    'การเดินในย่านศิลปะช่วยให้เห็นเมืองในจังหวะที่ละเอียดขึ้น ทั้งป้ายเก่า งานกราฟฟิตี ร้านอิสระ และผู้คนที่ใช้พื้นที่ร่วมกันอย่างสร้างสรรค์',
    'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80'],
    true,
    NOW() - INTERVAL '1 day',
    117,
    NOW() - INTERVAL '1 day'
  );

INSERT INTO comments (blog_id, sender_name, message, status, created_at)
SELECT id, 'มะลิ', 'อ่านแล้วอยากลองเขียนบล็อกท่องเที่ยวของตัวเองบ้างค่ะ', 'approved', NOW() - INTERVAL '10 days'
FROM blogs
WHERE slug = 'thai-travel-blog-guide';

INSERT INTO comments (blog_id, sender_name, message, status, created_at)
SELECT id, 'นิรันดร์', 'ขอพิกัดร้านกาแฟเพิ่มเติมได้ไหมครับ', 'pending', NOW() - INTERVAL '9 days'
FROM blogs
WHERE slug = 'morning-coffee-old-town';

INSERT INTO comments (blog_id, sender_name, message, status, created_at)
SELECT id, 'สมชาย', 'เนื้อหานี้ไม่ตรงกับประสบการณ์ของผมเลย', 'rejected', NOW() - INTERVAL '8 days'
FROM blogs
WHERE slug = 'riverside-morning-market';

INSERT INTO comments (blog_id, sender_name, message, status, created_at)
SELECT id, 'ลินา', 'ชอบไอเดียจัดโต๊ะมากค่ะ จะลองปรับตาม', 'approved', NOW() - INTERVAL '7 days'
FROM blogs
WHERE slug = 'focused-workspace-setup';

INSERT INTO comments (blog_id, sender_name, message, status, created_at)
SELECT id, 'กานต์', 'ภาพประกอบสวยและอ่านง่ายมากครับ', 'approved', NOW() - INTERVAL '2 days'
FROM blogs
WHERE slug = 'saturday-art-district-walk';
