import { recommend } from "./services/recommendation"

const result = recommend({
  nitrogen: 120,
  phosphorus: 45,
  potassium: 45,
  ph: 6.0,
})

console.log("Top 3 plants:")
result.rankings.slice(0, 3).forEach((r, i) => {
  console.log(`${i + 1}. ${r.nameTh} (${r.name}) — score: ${r.score}`)
  console.log(`   reasons: ${r.reasons.join(", ")}`)
})
