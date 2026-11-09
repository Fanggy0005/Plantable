import { defineMessages } from "@/lib/i18n/config"

export const profileMessages = defineMessages({
  th: {
    eyebrow: "บัญชีของฉัน",
    fallbackName: "เกษตรกร Plantable",
    verified: "ยืนยันแล้ว",
    logout: "ออกจากระบบ",
    stats: {
      plots: "แปลงในบัญชี",
      memberSince: "สมาชิกตั้งแต่",
      recently: "เมื่อเร็วๆ นี้",
      viewHistory: "ดูประวัติทั้งหมด",
    },
    edit: {
      title: "ข้อมูลส่วนตัว",
      description: "ชื่อนี้จะแสดงในเมนูและรายงานผลวิเคราะห์",
      label: "ชื่อที่แสดง",
      placeholder: "ระบุชื่อของคุณ",
      email: "อีเมล",
      emailHint: "อีเมลใช้สำหรับเข้าสู่ระบบ ไม่สามารถแก้ไขได้",
      save: "บันทึกการเปลี่ยนแปลง",
      saving: "กำลังบันทึก...",
      saved: "อัปเดตชื่อเรียบร้อยแล้ว",
      failed: "ไม่สามารถอัปเดตข้อมูลได้",
    },
  },
  en: {
    eyebrow: "My account",
    fallbackName: "Plantable farmer",
    verified: "Verified",
    logout: "Sign out",
    stats: {
      plots: "Plots in your account",
      memberSince: "Member since",
      recently: "Recently",
      viewHistory: "View full history",
    },
    edit: {
      title: "Personal details",
      description: "This name appears in the menu and on analysis reports.",
      label: "Display name",
      placeholder: "Your name",
      email: "Email",
      emailHint: "Your email is used to sign in and can't be changed.",
      save: "Save changes",
      saving: "Saving...",
      saved: "Name updated",
      failed: "Couldn't update your details",
    },
  },
})
