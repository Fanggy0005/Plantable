export interface PlantRequirement {
  id: string
  name: string
  nameTh: string
  nitrogen: { min: number; max: number; optimal: number }
  phosphorus: { min: number; max: number; optimal: number }
  potassium: { min: number; max: number; optimal: number }
  ph: { min: number; max: number; optimal: number }
  description: string
}

export const plants: PlantRequirement[] = [
  {
    id: "rice",
    name: "Rice",
    nameTh: "ข้าว",
    nitrogen:   { min: 80,  max: 160, optimal: 120 },
    phosphorus: { min: 30,  max: 60,  optimal: 45  },
    potassium:  { min: 30,  max: 60,  optimal: 45  },
    ph:         { min: 5.5, max: 7.0, optimal: 6.0 },
    description: "ต้องการน้ำมาก เหมาะกับดินเหนียวที่กักเก็บน้ำได้ดี",
  },
  {
    id: "corn",
    name: "Corn",
    nameTh: "ข้าวโพด",
    nitrogen:   { min: 100, max: 200, optimal: 150 },
    phosphorus: { min: 40,  max: 80,  optimal: 60  },
    potassium:  { min: 50,  max: 100, optimal: 75  },
    ph:         { min: 5.8, max: 7.0, optimal: 6.5 },
    description: "ต้องการไนโตรเจนสูง เหมาะกับดินร่วนที่ระบายน้ำดี",
  },
  {
    id: "cassava",
    name: "Cassava",
    nameTh: "มันสำปะหลัง",
    nitrogen:   { min: 40,  max: 100, optimal: 70  },
    phosphorus: { min: 20,  max: 50,  optimal: 35  },
    potassium:  { min: 60,  max: 120, optimal: 90  },
    ph:         { min: 5.0, max: 7.0, optimal: 6.0 },
    description: "ทนแล้งสูง เหมาะกับดินทรายที่ระบายน้ำดีเยี่ยม",
  },
  {
    id: "sugarcane",
    name: "Sugarcane",
    nameTh: "อ้อย",
    nitrogen:   { min: 100, max: 180, optimal: 140 },
    phosphorus: { min: 30,  max: 60,  optimal: 45  },
    potassium:  { min: 80,  max: 150, optimal: 115 },
    ph:         { min: 6.0, max: 7.5, optimal: 6.5 },
    description: "ต้องการโพแทสเซียมสูง เหมาะกับดินร่วนปนทราย",
  },
  {
    id: "rubber",
    name: "Rubber",
    nameTh: "ยางพารา",
    nitrogen:   { min: 60,  max: 120, optimal: 90  },
    phosphorus: { min: 20,  max: 50,  optimal: 35  },
    potassium:  { min: 40,  max: 80,  optimal: 60  },
    ph:         { min: 4.5, max: 6.0, optimal: 5.5 },
    description: "ชอบดินเป็นกรดอ่อน เหมาะกับภาคใต้และภาคตะวันออก",
  },
  {
    id: "durian",
    name: "Durian",
    nameTh: "ทุเรียน",
    nitrogen:   { min: 80,  max: 150, optimal: 115 },
    phosphorus: { min: 40,  max: 80,  optimal: 60  },
    potassium:  { min: 60,  max: 120, optimal: 90  },
    ph:         { min: 5.5, max: 6.5, optimal: 6.0 },
    description: "ต้องการการระบายน้ำดีมาก รากเน่าง่ายถ้าดินแฉะ",
  },
  {
    id: "mango",
    name: "Mango",
    nameTh: "มะม่วง",
    nitrogen:   { min: 60,  max: 120, optimal: 90  },
    phosphorus: { min: 30,  max: 60,  optimal: 45  },
    potassium:  { min: 50,  max: 100, optimal: 75  },
    ph:         { min: 5.5, max: 7.5, optimal: 6.5 },
    description: "ปรับตัวได้หลายสภาพดิน ทนแล้งได้ดีเมื่อโตแล้ว",
  },
  {
    id: "pineapple",
    name: "Pineapple",
    nameTh: "สับปะรด",
    nitrogen:   { min: 60,  max: 120, optimal: 90  },
    phosphorus: { min: 20,  max: 50,  optimal: 35  },
    potassium:  { min: 80,  max: 150, optimal: 115 },
    ph:         { min: 4.5, max: 6.0, optimal: 5.0 },
    description: "ชอบดินเป็นกรด ทนแล้ง เหมาะกับดินทรายระบายน้ำดี",
  },
  {
    id: "tomato",
    name: "Tomato",
    nameTh: "มะเขือเทศ",
    nitrogen:   { min: 80,  max: 150, optimal: 115 },
    phosphorus: { min: 50,  max: 100, optimal: 75  },
    potassium:  { min: 80,  max: 150, optimal: 115 },
    ph:         { min: 6.0, max: 7.0, optimal: 6.5 },
    description: "ต้องการฟอสฟอรัสสูงช่วงออกดอก เหมาะกับดินร่วนที่อุดมสมบูรณ์",
  },
  {
    id: "longan",
    name: "Longan",
    nameTh: "ลำไย",
    nitrogen:   { min: 60,  max: 120, optimal: 90  },
    phosphorus: { min: 30,  max: 60,  optimal: 45  },
    potassium:  { min: 60,  max: 120, optimal: 90  },
    ph:         { min: 5.5, max: 6.5, optimal: 6.0 },
    description: "เหมาะกับภาคเหนือ ต้องการอากาศเย็นเพื่อออกดอก",
  },
]
