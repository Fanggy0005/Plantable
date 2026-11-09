// Crop catalog entries (names, descriptions, images). Requirements are in requirements.ts.

export interface CropInfo {
  name: string
  nameTh: string
  scientificName: string
  category: string
  description: string
  imageUrl: string
}

export const CROPS: CropInfo[] = [
  {
    name: "Rice",
    nameTh: "ข้าว",
    scientificName: "Oryza sativa",
    category: "Grain",
    description: "พืชเศรษฐกิจหลักของไทย ต้องการน้ำสม่ำเสมอ เหมาะสำหรับพื้นที่ลุ่มและดินเหนียวที่อุ้มน้ำได้ดี",
    imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Corn",
    nameTh: "ข้าวโพด",
    scientificName: "Zea mays",
    category: "Grain",
    description: "ต้องการธาตุอาหารสูงโดยเฉพาะไนโตรเจน ชอบดินร่วนซุย มีการระบายน้ำและการถ่ายเทอากาศดี",
    imageUrl: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Cassava",
    nameTh: "มันสำปะหลัง",
    scientificName: "Manihot esculenta",
    category: "Cash Crop",
    description: "พืชหัวทนแล้ง เจริญเติบโตได้ดีในดินร่วนปนทราย ไม่ชอบน้ำขัง ต้องการโพแทสเซียมในการสะสมแป้ง",
    imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Sugarcane",
    nameTh: "อ้อย",
    scientificName: "Saccharum officinarum",
    category: "Cash Crop",
    description: "พืชอุตสาหกรรมน้ำตาล ต้องการแสงแดดจัด ดินร่วนปนทราย ต้องการโพแทสเซียมสูงเพื่อสร้างน้ำตาล",
    imageUrl: "https://images.unsplash.com/photo-1590400568582-e44e2b36480f?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Rubber",
    nameTh: "ยางพารา",
    scientificName: "Hevea brasiliensis",
    category: "Cash Crop",
    description: "ไม้ยืนต้นเศรษฐกิจ ชอบดินลึกที่มีความเป็นกรดอ่อน น้ำไม่ท่วมขัง ทนฝนชุกในภาคใต้และตะวันออก",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Durian",
    nameTh: "ทุเรียน",
    scientificName: "Durio zibethinus",
    category: "Fruit",
    description: "ราชาแห่งผลไม้ ต้องการดินร่วนปนทรายที่ระบายน้ำดีมาก ห้ามน้ำขังเด็ดขาด มีสารอินทรีย์สูง",
    imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Mango",
    nameTh: "มะม่วง",
    scientificName: "Mangifera indica",
    category: "Fruit",
    description: "ปรับตัวได้ดีในหลายสภาพดิน ทนแล้งได้เมื่อต้นโต ต้องการช่วงแห้งแล้งสั้นๆ เพื่อกระตุ้นการออกดอก",
    imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Pineapple",
    nameTh: "สับปะรด",
    scientificName: "Ananas comosus",
    category: "Fruit",
    description: "ชอบดินเป็นกรดปานกลาง ทนแล้ง เหมาะกับดินร่วนปนทรายหรือดินลูกรังที่ระบายน้ำดีเลิศ",
    imageUrl: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Tomato",
    nameTh: "มะเขือเทศ",
    scientificName: "Solanum lycopersicum",
    category: "Vegetable",
    description: "ต้องการฟอสฟอรัสสูงเพื่อสร้างดอกและผล ชอบดินร่วนโปร่ง แสงแดดเต็มวัน ไม่ทนน้ำท่วมขัง",
    imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Longan",
    nameTh: "ลำไย",
    scientificName: "Dimocarpus longan",
    category: "Fruit",
    description: "พืชเศรษฐกิจสำคัญภาคเหนือ ชอบดินร่วนปนทราย ระบายน้ำได้ดี และต้องการอากาศเย็นเพื่อพักตัวก่อนออกดอก",
    imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Chili",
    nameTh: "พริก",
    scientificName: "Capsicum annuum",
    category: "Vegetable",
    description: "พืชผักสวนครัวและเศรษฐกิจ ชอบดินร่วนระบายน้ำดี ปุ๋ยอินทรีย์สูง ไวต่อโรครากเน่าหากดินแฉะเกินไป",
    imageUrl: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Soybean",
    nameTh: "ถั่วเหลือง",
    scientificName: "Glycine max",
    category: "Grain",
    description: "พืชตระกูลถั่วที่ช่วยตรึงไนโตรเจนลงสู่ดิน เหมาะสำหรับปลูกสลับบำรุงดิน ต้องการฟอสฟอรัสและโพแทสเซียมดี",
    imageUrl: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80",
  },
]
