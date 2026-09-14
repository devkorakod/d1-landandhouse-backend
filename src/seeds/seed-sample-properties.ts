import { Property, User, Media } from '../models/index.js';
import { logger } from '../config/logger.js';

/**
 * ภาพตัวอย่างจาก Unsplash (โหลดจาก CDN โดยตรง ไม่ได้อัปโหลดเข้าเซิร์ฟเวอร์เรา) —
 * ใช้เพื่อให้ demo ดูสมจริงเท่านั้น แอดมินสลับเป็นภาพจริงของทรัพย์แต่ละรายการได้ตลอดเวลา
 */
const IMG = (id: string, w = 1600) => `https://images.unsplash.com/photo-${id}?w=${w}&q=75&auto=format&fit=crop`;

const PHOTOS = {
  villaPoolWhite1: IMG('1600596542815-ffad4c1539a9'),      // วิลล่าขาวพร้อมสระ ชั้นดาดฟ้า
  villaPoolWhite2: IMG('1512917774080-9991f1c4c750'),      // วิลล่าขาวริมสระ ปาล์ม
  villaPoolWhite3: IMG('1580587771525-78b9dba3b914'),      // วิลล่า 2 โทนสี พร้อมสระ
  villaColonialPool: IMG('1564013799919-ab600027ffc6'),    // วิลล่าโคโลเนียล พร้อมสระ+ปาล์ม
  resortPoolDusk: IMG('1571003123894-1f0594d2b5d9'),       // สระรีสอร์ทริมทะเล ยามพลบค่ำ
  houseDuskModern: IMG('1600585154340-be6161a56a0c'),      // บ้านโมเดิร์นยามพลบค่ำ
  houseMinimalWhite: IMG('1523217582562-09d0def993a6'),    // บ้านมินิมอลสีขาว
  houseCabinCozy: IMG('1449844908441-8829872d2607'),       // บ้านสไตล์กระท่อมอบอุ่น
  condoTowerExterior: IMG('1580216643062-cf460548a66a'),   // อาคารคอนโดสูง
  livingBrightView: IMG('1560448204-e02f11c3d0e2'),        // ห้องนั่งเล่นสว่าง วิวเมือง
  livingKitchenWood: IMG('1600607687939-ce8a6c25118c'),    // ห้องนั่งเล่น+ครัว ผนังไม้
  livingLoftGallery: IMG('1600210492486-724fe5c67fb0'),    // ห้องนั่งเล่นลอฟท์ ผนังแกลเลอรี
  livingStaircaseDog: IMG('1600566753086-00f18fb6b3ea'),   // ห้องนั่งเล่น บันได
  livingGreenAccent: IMG('1554995207-c18c203602cb'),       // ห้องนั่งเล่น ผนังเขียว โซฟาหนัง
  livingWarmTraditional: IMG('1560185127-6ed189bf02f4'),   // ห้องนั่งเล่นอบอุ่น
  livingBohoPlants: IMG('1502672260266-1c1ef2d93688'),     // ห้องนั่งเล่นต้นไม้เยอะ
  apartRedChair: IMG('1522708323590-d24dbb6b0267'),        // อพาร์ตเมนต์เล็ก เก้าอี้แดง
  apartBlueSofa: IMG('1493809842364-78817add7ffb'),        // อพาร์ตเมนต์ โซฟาน้ำเงิน
  diningWindowView: IMG('1519643381401-22c77e60520e'),     // โต๊ะอาหารริมหน้าต่าง
  officeInterior: IMG('1497366216548-37526070297c'),       // ออฟฟิศ/ล็อบบี้โมเดิร์น
  landField: IMG('1500382017468-9049fed747ef'),            // ที่ดินเปล่า ทุ่งโล่ง
};

const SAMPLE = [
  {
    code: 'D1-2026-0001',
    slug: 'pool-villa-sukhumvit-49',
    title: { th: 'พูลวิลล่าหรู สุขุมวิท 49', en: 'Luxury Pool Villa, Sukhumvit 49' },
    description: {
      th: 'บ้านเดี่ยวสไตล์โมเดิร์นสามชั้น ออกแบบโดยคำนึงถึงความเป็นส่วนตัวสูงสุด กลางซอยสุขุมวิท 49 '
        + 'เดินทางเข้า BTS ทองหล่อเพียง 5 นาที ภายในตกแต่งครบครันด้วยเฟอร์นิเจอร์นำเข้า ห้องนั่งเล่นเพดานสูง '
        + 'เปิดรับแสงธรรมชาติ พร้อมสระว่ายน้ำระบบเกลือส่วนตัวและสวนแนวตั้งรอบบ้าน '
        + 'เหมาะสำหรับครอบครัวที่มองหาความหรูหราใจกลางเมือง',
      en: 'Modern three-storey pool villa off Sukhumvit 49, 5 minutes to BTS Thong Lo. Fully furnished with a private saltwater pool.',
    },
    highlights: [
      { th: 'สระว่ายน้ำระบบเกลือส่วนตัว', en: 'Private saltwater pool' },
      { th: 'ห้องนั่งเล่นเพดานสูง 6 เมตร', en: '6-metre ceiling living room' },
      { th: 'เดินถึง BTS ทองหล่อ 5 นาที', en: '5-minute walk to BTS Thong Lo' },
      { th: 'ที่จอดรถในบ้าน 4 คัน', en: 'Private parking for 4 cars' },
    ],
    propertyType: 'house', listingType: 'sale', status: 'published',
    price: { sale: 185_000_000, currency: 'THB', negotiable: true },
    area: { usableSqm: 480, landRai: 0, landNgan: 1, landWah: 50 },
    spec: { bedrooms: 5, bathrooms: 6, parking: 4, floors: 3, ownership: 'freehold', furnishing: 'fully', yearBuilt: 2021 },
    location: { address: { th: 'ซอยสุขุมวิท 49', en: 'Sukhumvit 49' }, zone: 'ทองหล่อ-เอกมัย', geo: { type: 'Point', coordinates: [100.5731, 13.7292] } },
    nearby: [{ type: 'bts', name: { th: 'BTS ทองหล่อ', en: 'BTS Thong Lo' }, distanceKm: 1.2, travelMinutes: 5 }],
    cover: PHOTOS.villaPoolWhite1, gallery: [PHOTOS.livingBrightView, PHOTOS.livingKitchenWood, PHOTOS.livingStaircaseDog],
    isFeatured: true, sortWeight: 10, publishedAt: new Date(),
  },
  {
    code: 'D1-2026-0002',
    slug: 'condo-sathorn-2bed',
    title: { th: 'คอนโดหรู สาทร 2 ห้องนอน วิวแม่น้ำเจ้าพระยา', en: 'Luxury Condo, Sathorn 2BR River View' },
    description: {
      th: 'ยูนิตมุมชั้น 32 ในตึกคอนโดระดับ Super Luxury ย่านสาทร วิวแม่น้ำเจ้าพระยาแบบพาโนรามาทั้งห้องนั่งเล่น '
        + 'และห้องนอนใหญ่ ตกแต่งสไตล์ Modern Loft ครบทุกชิ้น พร้อมเข้าอยู่ทันที '
        + 'ใกล้ BTS ช่องนนทรีและ BRT สาทร เดินทางเข้าสีลมได้ใน 10 นาที',
      en: 'Corner unit on the 32nd floor with panoramic Chao Phraya river views, fully furnished, near BTS Chong Nonsi.',
    },
    highlights: [
      { th: 'วิวแม่น้ำเจ้าพระยา 180 องศา', en: '180° river view' },
      { th: 'ตกแต่งครบพร้อมอยู่', en: 'Fully furnished' },
      { th: 'สระว่ายน้ำ+ฟิตเนสชั้น 40', en: 'Pool and gym on floor 40' },
      { th: 'ใกล้ BTS ช่องนนทรี', en: 'Near BTS Chong Nonsi' },
    ],
    propertyType: 'condo', listingType: 'sale_rent', status: 'published',
    price: { sale: 12_500_000, rentMonthly: 45_000, currency: 'THB' },
    area: { usableSqm: 78 },
    spec: { bedrooms: 2, bathrooms: 2, parking: 1, floorNo: 32, ownership: 'freehold', furnishing: 'fully', view: ['river'], yearBuilt: 2019 },
    location: { address: { th: 'ถนนสาทร', en: 'Sathorn Road' }, zone: 'สาทร-สีลม', geo: { type: 'Point', coordinates: [100.5299, 13.7195] } },
    cover: PHOTOS.condoTowerExterior, gallery: [PHOTOS.livingLoftGallery, PHOTOS.apartRedChair, PHOTOS.apartBlueSofa],
    isFeatured: true, sortWeight: 8, publishedAt: new Date(),
  },
  {
    code: 'D1-2026-0003',
    slug: 'land-bangtao-phuket',
    title: { th: 'ที่ดินเปล่า บางเทา ภูเก็ต ติดถนนใหญ่', en: 'Vacant Land, Bang Tao Phuket' },
    description: {
      th: 'ที่ดินผืนสวย เนื้อที่ 2 ไร่ ติดถนนสาธารณะกว้าง ห่างจากหาดบางเทาเพียง 800 เมตร ผังเมืองรองรับการพัฒนา '
        + 'เหมาะสำหรับสร้างพูลวิลล่าให้เช่าหรือรีสอร์ทขนาดเล็ก ถมดินพร้อมแล้ว ไฟฟ้าและน้ำประปาเข้าถึงที่ดิน '
        + 'โฉนดครุฑแดง พร้อมโอนทันที',
      en: '2-rai plot fronting a public road, 800m from Bang Tao beach. Ready for development, chanote title.',
    },
    highlights: [
      { th: 'ติดถนนสาธารณะกว้าง 12 เมตร', en: 'Fronts a 12m public road' },
      { th: 'ห่างหาดบางเทา 800 เมตร', en: '800m from Bang Tao beach' },
      { th: 'โฉนดครุฑแดง ถมดินพร้อม', en: 'Chanote title, land already filled' },
    ],
    propertyType: 'land', listingType: 'sale', status: 'published',
    price: { sale: 45_000_000, currency: 'THB', negotiable: true },
    area: { landRai: 2, landNgan: 0, landWah: 0 },
    spec: { ownership: 'freehold', titleDeedType: 'chanote' },
    location: { address: { th: 'บางเทา ถลาง ภูเก็ต', en: 'Bang Tao, Thalang, Phuket' }, zone: 'ภูเก็ต-บางเทา', geo: { type: 'Point', coordinates: [98.2963, 7.9963] } },
    cover: PHOTOS.landField, gallery: [],
    isFeatured: false, sortWeight: 5, publishedAt: new Date(),
  },
  {
    code: 'D1-2026-0004',
    slug: 'pool-villa-laguna-phuket',
    title: { th: 'พูลวิลล่าหรูริมกรีน ลากูน่า ภูเก็ต', en: 'Luxury Pool Villa by Laguna Golf, Phuket' },
    description: {
      th: 'วิลล่า 2 ชั้นสไตล์รีสอร์ท ในโครงการรั้วรอบขอบชิดใกล้สนามกอล์ฟลากูน่า ภูเก็ต บรรยากาศร่มรื่นด้วยต้นปาล์มรอบบ้าน '
        + 'สระว่ายน้ำส่วนตัวขนาด 8x4 เมตร ห้องนอนทุกห้องมองเห็นสวน เหมาะเป็นบ้านพักตากอากาศหรือปล่อยเช่านักท่องเที่ยวระยะยาว',
      en: 'Two-storey resort-style villa near Laguna Golf, Phuket, with a private pool and lush garden views.',
    },
    highlights: [
      { th: 'ใกล้สนามกอล์ฟลากูน่า', en: 'Near Laguna Golf Course' },
      { th: 'สระว่ายน้ำส่วนตัวสไตล์รีสอร์ท', en: 'Private resort-style pool' },
      { th: 'บริการดูแลสวน+สระจากนิติบุคคล', en: 'Garden and pool maintenance included' },
      { th: 'ปล่อยเช่าระยะยาวได้ผลตอบแทนดี', en: 'Strong long-term rental yield' },
    ],
    propertyType: 'villa', listingType: 'sale', status: 'published',
    price: { sale: 32_000_000, currency: 'THB', negotiable: true },
    area: { usableSqm: 320, landRai: 0, landNgan: 2, landWah: 50 },
    spec: { bedrooms: 4, bathrooms: 4, parking: 2, floors: 2, ownership: 'leasehold', leaseYearsRemaining: 28, furnishing: 'fully', view: ['garden', 'pool'], yearBuilt: 2020 },
    location: { address: { th: 'ถนนศรีสุนทร', en: 'Srisoonthorn Road' }, zone: 'ภูเก็ต-ลากูน่า', geo: { type: 'Point', coordinates: [98.2939, 7.9967] } },
    cover: PHOTOS.villaColonialPool, gallery: [PHOTOS.resortPoolDusk, PHOTOS.villaPoolWhite2],
    isFeatured: true, sortWeight: 9, publishedAt: new Date(),
  },
  {
    code: 'D1-2026-0005',
    slug: 'townhome-modern-ratchada',
    title: { th: 'ทาวน์โฮม 3 ชั้น สไตล์โมเดิร์น รัชดาภิเษก', en: 'Modern 3-Storey Townhome, Ratchadaphisek' },
    description: {
      th: 'ทาวน์โฮมหลังมุมในโครงการปิด ออกแบบพื้นที่ใช้สอยสูงแบบ Double Space ห้องนั่งเล่นเพดานสูงรับแสงธรรมชาติเต็มที่ '
        + 'ใกล้ MRT ศูนย์วัฒนธรรมและถนนรัชดาภิเษก เหมาะสำหรับคนทำงานที่ต้องการเดินทางเข้าเมืองสะดวก',
      en: 'Corner-unit townhome with double-height living room, near MRT Thailand Cultural Centre.',
    },
    highlights: [
      { th: 'หลังมุม พื้นที่ใช้สอยเพิ่มพิเศษ', en: 'Corner unit, extra usable space' },
      { th: 'ห้องนั่งเล่น Double Space เพดานสูง', en: 'Double-height living room' },
      { th: 'ใกล้ MRT ศูนย์วัฒนธรรม', en: 'Near MRT Cultural Centre' },
    ],
    propertyType: 'townhouse', listingType: 'sale', status: 'published',
    price: { sale: 8_900_000, currency: 'THB', negotiable: true },
    area: { usableSqm: 210, landRai: 0, landNgan: 0, landWah: 22 },
    spec: { bedrooms: 3, bathrooms: 4, parking: 2, floors: 3, ownership: 'freehold', furnishing: 'partial', yearBuilt: 2020 },
    location: { address: { th: 'ถนนรัชดาภิเษก', en: 'Ratchadaphisek Road' }, zone: 'รัชดาภิเษก-ห้วยขวาง', geo: { type: 'Point', coordinates: [100.5738, 13.7649] } },
    nearby: [{ type: 'mrt', name: { th: 'MRT ศูนย์วัฒนธรรม', en: 'MRT Cultural Centre' }, distanceKm: 1.5, travelMinutes: 6 }],
    cover: PHOTOS.houseDuskModern, gallery: [PHOTOS.livingKitchenWood, PHOTOS.livingGreenAccent],
    isFeatured: false, sortWeight: 6, publishedAt: new Date(),
  },
  {
    code: 'D1-2026-0006',
    slug: 'house-bangna-minimal',
    title: { th: 'บ้านเดี่ยวสไตล์มินิมอล บางนา', en: 'Minimalist Detached House, Bangna' },
    description: {
      th: 'บ้านเดี่ยว 2 ชั้นดีไซน์มินิมอล สีขาวสะอาดตา ในโครงการหมู่บ้านจัดสรรรั้วรอบขอบชิด ย่านบางนา-ตราด '
        + 'ใกล้ทางด่วนบูรพาวิถีและสนามบินสุวรรณภูมิ เหมาะสำหรับครอบครัวที่มองหาบ้านใหม่พร้อมสวนหน้าบ้านกว้างขวาง',
      en: 'Minimalist two-storey house in a gated village near Bangna, close to the expressway and airport.',
    },
    highlights: [
      { th: 'ดีไซน์มินิมอล ทันสมัย', en: 'Modern minimalist design' },
      { th: 'สวนหน้าบ้านกว้าง', en: 'Spacious front garden' },
      { th: 'ใกล้สนามบินสุวรรณภูมิ 15 นาที', en: '15 minutes to Suvarnabhumi Airport' },
    ],
    propertyType: 'house', listingType: 'sale', status: 'published',
    price: { sale: 6_200_000, currency: 'THB', negotiable: true },
    area: { usableSqm: 165, landRai: 0, landNgan: 0, landWah: 50 },
    spec: { bedrooms: 3, bathrooms: 3, parking: 2, floors: 2, ownership: 'freehold', furnishing: 'unfurnished', yearBuilt: 2023 },
    location: { address: { th: 'ถนนบางนา-ตราด', en: 'Bangna-Trad Road' }, zone: 'บางนา-ตราด', geo: { type: 'Point', coordinates: [100.6048, 13.6684] } },
    cover: PHOTOS.houseMinimalWhite, gallery: [PHOTOS.livingWarmTraditional, PHOTOS.livingBohoPlants],
    isFeatured: false, sortWeight: 4, publishedAt: new Date(),
  },
  {
    code: 'D1-2026-0007',
    slug: 'office-asoke-for-rent',
    title: { th: 'พื้นที่สำนักงานให้เช่า อโศก ตกแต่งพร้อมใช้งาน', en: 'Fitted Office Space for Rent, Asoke' },
    description: {
      th: 'พื้นที่สำนักงานตกแต่งสไตล์โมเดิร์นให้เช่า ในอาคารสำนักงานเกรดเอ ย่านอโศก ติด MRT สุขุมวิทและ BTS อโศก '
        + 'เดินเชื่อมได้โดยไม่ต้องออกแดด พื้นที่เปิดโล่งพร้อมห้องประชุมกระจกและครัวส่วนกลาง',
      en: 'Grade-A fitted office space in Asoke, skywalk-connected to BTS Asoke and MRT Sukhumvit.',
    },
    highlights: [
      { th: 'ตกแต่งพร้อมเข้าใช้งานทันที', en: 'Move-in ready fit-out' },
      { th: 'เชื่อมต่อ MRT/BTS อโศก', en: 'Connected to MRT/BTS Asoke' },
      { th: 'ห้องประชุมกระจก+ครัวส่วนกลาง', en: 'Glass meeting rooms + pantry' },
    ],
    propertyType: 'office', listingType: 'rent', status: 'published',
    price: { rentMonthly: 180_000, currency: 'THB' },
    area: { usableSqm: 300 },
    spec: { parking: 4, floorNo: 15, furnishing: 'fully', condition: 'excellent' },
    location: { address: { th: 'ถนนอโศกมนตรี', en: 'Asoke Montri Road' }, zone: 'อโศก-สุขุมวิท', geo: { type: 'Point', coordinates: [100.5608, 13.7367] } },
    cover: PHOTOS.officeInterior, gallery: [],
    isFeatured: false, sortWeight: 3, publishedAt: new Date(),
  },
  {
    code: 'D1-2026-0008',
    slug: 'condo-studio-ari-for-rent',
    title: { th: 'คอนโดสตูดิโอให้เช่า อารีย์ ตกแต่งครบ พร้อมอยู่', en: 'Studio Condo for Rent, Ari' },
    description: {
      th: 'คอนโดสตูดิโอขนาดกะทัดรัดในซอยอารีย์ ย่านที่เต็มไปด้วยคาเฟ่และร้านอาหาร เดินถึง BTS อารีย์ 400 เมตร '
        + 'ตกแต่งสไตล์ Cozy Modern พร้อมเฟอร์นิเจอร์และเครื่องใช้ไฟฟ้าครบ เหมาะสำหรับคนทำงานหรือฟรีแลนซ์',
      en: 'Compact studio in Ari, 400m from BTS Ari, fully furnished and move-in ready.',
    },
    highlights: [
      { th: 'เดิน BTS อารีย์ 400 เมตร', en: '400m walk to BTS Ari' },
      { th: 'ตกแต่งครบพร้อมเข้าอยู่', en: 'Fully furnished' },
      { th: 'ใกล้คาเฟ่และร้านอาหารเพียบ', en: 'Surrounded by cafes and restaurants' },
    ],
    propertyType: 'condo', listingType: 'rent', status: 'published',
    price: { rentMonthly: 16_500, currency: 'THB' },
    area: { usableSqm: 32 },
    spec: { bedrooms: 0, bathrooms: 1, parking: 0, floorNo: 18, furnishing: 'fully', view: ['city'] },
    location: { address: { th: 'ซอยอารีย์', en: 'Ari Soi' }, zone: 'อารีย์-พหลโยธิน', geo: { type: 'Point', coordinates: [100.5461, 13.7797] } },
    cover: PHOTOS.apartBlueSofa, gallery: [PHOTOS.diningWindowView],
    isFeatured: false, sortWeight: 2, publishedAt: new Date(),
  },
  {
    code: 'D1-2026-0009',
    slug: 'beachfront-villa-huahin',
    title: { th: 'พูลวิลล่าริมชายหาด หัวหิน วิวทะเลกว้าง', en: 'Beachfront Pool Villa, Hua Hin' },
    description: {
      th: 'วิลล่าดีไซน์โมเดิร์นทรอปิคอล ห่างจากชายหาดหัวหินเพียง 300 เมตร บรรยากาศเงียบสงบเหมาะกับวันหยุดพักผ่อน '
        + 'สระว่ายน้ำส่วนตัวเชื่อมต่อกับระเบียงไม้ขนาดใหญ่ มองเห็นวิวทะเลจากชั้นสอง เหมาะทั้งอยู่อาศัยเองและปล่อยเช่านักท่องเที่ยว',
      en: 'Modern tropical villa 300m from Hua Hin beach with a private pool and sea view from the upper floor.',
    },
    highlights: [
      { th: 'ห่างชายหาดหัวหิน 300 เมตร', en: '300m from Hua Hin beach' },
      { th: 'สระว่ายน้ำส่วนตัวเชื่อมระเบียงไม้', en: 'Private pool with wooden deck' },
      { th: 'วิวทะเลจากชั้น 2', en: 'Sea view from the second floor' },
    ],
    propertyType: 'villa', listingType: 'sale', status: 'published',
    price: { sale: 28_500_000, currency: 'THB', negotiable: true },
    area: { usableSqm: 260, landRai: 0, landNgan: 1, landWah: 0 },
    spec: { bedrooms: 4, bathrooms: 4, parking: 2, floors: 2, ownership: 'freehold', furnishing: 'fully', view: ['sea'], yearBuilt: 2022 },
    location: { address: { th: 'ถนนเพชรเกษม', en: 'Phetkasem Road' }, zone: 'หัวหิน-ชะอำ', geo: { type: 'Point', coordinates: [99.9576, 12.5683] } },
    cover: PHOTOS.villaPoolWhite3, gallery: [PHOTOS.resortPoolDusk, PHOTOS.livingBrightView],
    isFeatured: true, sortWeight: 7, publishedAt: new Date(),
  },
];

async function mediaFor(key: string, url: string, altTh: string) {
  const filename = `seed-${key}`;
  const existing = await Media.findOne({ filename });
  if (existing) return existing;
  return Media.create({
    filename, type: 'image', url,
    variants: { thumb: url, medium: url, large: url, original: url },
    alt: { th: altTh }, folder: 'seed',
  });
}

function mediaRef(media: any, sortOrder = 0) {
  return { mediaId: media._id, url: media.url, variants: media.variants, alt: media.alt, sortOrder };
}

export async function seedSampleProperties() {
  const agent = await User.findOne({ role: 'owner' }).lean();
  let upserted = 0;

  for (const p of SAMPLE) {
    const { cover, gallery, ...rest } = p;
    const coverMedia = await mediaFor(`${p.code}-cover`, cover, rest.title.th);
    const galleryMedia = await Promise.all(
      gallery.map((url, i) => mediaFor(`${p.code}-g${i}`, url, `${rest.title.th} ${i + 1}`)),
    );

    await Property.findOneAndUpdate(
      { code: p.code },
      {
        $set: {
          ...rest,
          agentId: agent?._id,
          coverImage: mediaRef(coverMedia),
          gallery: galleryMedia.map((m, i) => mediaRef(m, i)),
          // ระบบลบแบบ soft delete — ถ้า code นี้เคยถูกลบไว้ (เช่นทรัพย์ทดสอบเก่า) ต้อง
          // "คืนชีพ" กลับมาด้วย ไม่งั้น upsert จะเขียนทับข้อมูลถูกต้องแต่ deletedAt ยังติดอยู่
          // ทำให้ทรัพย์หายไปจากทุก query แบบเงียบๆ (เจอบั๊กนี้จริงตอน seed 2 รายการ)
          deletedAt: null, deletedBy: null,
        },
      },
      { upsert: true },
    );
    upserted++;
  }
  logger.info({ upserted }, '🏠 Seed ทรัพย์ตัวอย่าง');
}

export { PHOTOS as SAMPLE_PHOTOS, mediaFor, mediaRef };
