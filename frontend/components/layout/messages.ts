import { defineMessages } from "@/lib/i18n/config"

export const layoutMessages = defineMessages({
  th: {
    nav: {
      analyze: "วิเคราะห์ดิน",
      crops: "ฐานข้อมูลพืช",
      history: "ประวัติการตรวจ",
    },
    account: {
      login: "เข้าสู่ระบบ",
      register: "สมัครสมาชิก",
      profile: "โปรไฟล์ของฉัน",
      history: "ประวัติการตรวจดิน",
      logout: "ออกจากระบบ",
      loggedOut: "ออกจากระบบแล้ว",
      guest: "ผู้เยี่ยมชม",
    },
    menu: "เมนู",
    openMenu: "เปิดเมนู",
    language: "ภาษา",
    footer: {
      about:
        "แปลงค่าวิเคราะห์ดิน N-P-K และ pH ให้เป็นคำแนะนำพืชและแผนปรับปรุงดิน ตามเกณฑ์ปฐพีวิทยามาตรฐาน",
      servicesTitle: "บริการ",
      services: {
        analyze: "วิเคราะห์ผลตรวจดิน",
        crops: "ฐานข้อมูลความต้องการของพืช",
        history: "ประวัติการตรวจดิน",
      },
      methodTitle: "หลักการประเมิน",
      method:
        "คะแนนความเหมาะสม 0–100 คำนวณจากไนโตรเจน 30% ฟอสฟอรัส 20% โพแทสเซียม 20% และ pH 30% เทียบกับช่วงที่เหมาะสมของพืชแต่ละชนิด",
      rights: "สงวนลิขสิทธิ์",
    },
  },
  en: {
    nav: {
      analyze: "Analyze",
      crops: "Crops",
      history: "History",
    },
    account: {
      login: "Sign in",
      register: "Sign up",
      profile: "My profile",
      history: "Test history",
      logout: "Sign out",
      loggedOut: "Signed out",
      guest: "Guest",
    },
    menu: "Menu",
    openMenu: "Open menu",
    language: "Language",
    footer: {
      about:
        "Turn N-P-K and pH soil test results into crop recommendations and soil improvement plans, based on standard agronomy criteria.",
      servicesTitle: "Services",
      services: {
        analyze: "Soil test analysis",
        crops: "Crop requirement database",
        history: "Test history",
      },
      methodTitle: "How scoring works",
      method:
        "The 0–100 suitability score weighs nitrogen 30%, phosphorus 20%, potassium 20% and pH 30% against each crop's optimal range.",
      rights: "All rights reserved",
    },
  },
})
