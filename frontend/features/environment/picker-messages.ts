import { defineMessages } from "@/lib/i18n/config"

export const pickerMessages = defineMessages({
  th: {
    province: "จังหวัดที่เพาะปลูก",
    provinceHint: "ใช้แสดงสภาพอากาศของแปลง",
    regions: {
      north: "ภาคเหนือ",
      northeast: "ภาคตะวันออกเฉียงเหนือ",
      central: "ภาคกลาง",
      east: "ภาคตะวันออก",
      south: "ภาคใต้",
      west: "ภาคตะวันตก",
    },
    provinces: {
      nakhon_ratchasima: "นครราชสีมา",
      khon_kaen: "ขอนแก่น",
      chiang_mai: "เชียงใหม่",
      nan: "น่าน",
      suphan_buri: "สุพรรณบุรี",
      ayutthaya: "พระนครศรีอยุธยา",
      rayong: "ระยอง",
      chanthaburi: "จันทบุรี",
      surat_thani: "สุราษฎร์ธานี",
      songkhla: "สงขลา",
      kanchanaburi: "กาญจนบุรี",
    } as Record<string, string>,
  },
  en: {
    province: "Growing province",
    provinceHint: "Used to show the weather for your plot",
    regions: {
      north: "North",
      northeast: "Northeast",
      central: "Central",
      east: "East",
      south: "South",
      west: "West",
    },
    provinces: {
      nakhon_ratchasima: "Nakhon Ratchasima",
      khon_kaen: "Khon Kaen",
      chiang_mai: "Chiang Mai",
      nan: "Nan",
      suphan_buri: "Suphan Buri",
      ayutthaya: "Phra Nakhon Si Ayutthaya",
      rayong: "Rayong",
      chanthaburi: "Chanthaburi",
      surat_thani: "Surat Thani",
      songkhla: "Songkhla",
      kanchanaburi: "Kanchanaburi",
    } as Record<string, string>,
  },
})
