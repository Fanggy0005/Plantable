import { defineMessages } from "@/lib/i18n/config"

export const favoriteMessages = defineMessages({
  th: {
    add: "เพิ่มในรายการโปรด",
    remove: "นำออกจากรายการโปรด",
    added: "บันทึกในรายการโปรดแล้ว",
    removed: "นำออกจากรายการโปรดแล้ว",
    failed: "ไม่สามารถอัปเดตรายการโปรดได้",
    loginTitle: "เข้าสู่ระบบเพื่อบันทึกพืชที่ชอบ",
    loginAction: "เข้าสู่ระบบ",
  },
  en: {
    add: "Save to favorites",
    remove: "Remove from favorites",
    added: "Saved to favorites",
    removed: "Removed from favorites",
    failed: "Couldn't update favorites",
    loginTitle: "Sign in to save crops you like",
    loginAction: "Sign in",
  },
})
