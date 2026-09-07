"use client"

interface NPKRadarChartProps {
  soil: {
    nitrogen: number
    phosphorus: number
    potassium: number
    ph: number
  }
  breakdown?: {
    nitrogen: number
    phosphorus: number
    potassium: number
    ph: number
  }
  cropName?: string
  size?: number
}

export function NPKRadarChart({
  soil,
  breakdown,
  cropName,
  size = 280,
}: NPKRadarChartProps) {
  const center = size / 2
  const maxRadius = (size / 2) - 45

  // 4 axes: 0=Top(N), 1=Right(P), 2=Bottom(K), 3=Left(pH)
  const axes = [
    { label: "N (ไนโตรเจน)", value: soil.nitrogen, unit: "mg/kg", score: breakdown?.nitrogen ?? 100 },
    { label: "P (ฟอสฟอรัส)", value: soil.phosphorus, unit: "mg/kg", score: breakdown?.phosphorus ?? 100 },
    { label: "K (โพแทสเซียม)", value: soil.potassium, unit: "mg/kg", score: breakdown?.potassium ?? 100 },
    { label: "pH (กรด-ด่าง)", value: soil.ph, unit: "", score: breakdown?.ph ?? 100 },
  ]

  // Convert (radius, angleIndex) to (x, y) coordinates
  const getCoordinates = (radius: number, index: number) => {
    // 0: top (-90 deg), 1: right (0 deg), 2: bottom (90 deg), 3: left (180 deg)
    const angle = (Math.PI / 2) * index - Math.PI / 2
    const x = center + radius * Math.cos(angle)
    const y = center + radius * Math.sin(angle)
    return { x, y }
  }

  // Generate grid rings at 25%, 50%, 75%, 100%
  const gridLevels = [0.25, 0.5, 0.75, 1.0]

  // Soil match points based on nutrient score (0 - 100)
  const soilPoints = axes.map((axis, i) => {
    const fraction = Math.max(0.15, Math.min(1.0, axis.score / 100))
    return getCoordinates(maxRadius * fraction, i)
  })

  const soilPolygonPoints = soilPoints.map((p) => `${p.x},${p.y}`).join(" ")

  return (
    <div className="flex flex-col items-center bg-card rounded-2xl p-4 border border-border/60 shadow-xs">
      <div className="flex items-center justify-between w-full mb-1">
        <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
          เรดาร์ความสมดุลธาตุอาหาร (NPK & pH)
        </h4>
        {cropName && (
          <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
            เทียบกับ {cropName}
          </span>
        )}
      </div>

      <svg width={size} height={size} className="overflow-visible select-none">
        {/* Concentric grid webs */}
        {gridLevels.map((lvl) => {
          const ringPoints = [0, 1, 2, 3]
            .map((i) => getCoordinates(maxRadius * lvl, i))
            .map((p) => `${p.x},${p.y}`)
            .join(" ")

          return (
            <polygon
              key={lvl}
              points={ringPoints}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={lvl === 1 ? "1.5" : "1"}
              strokeDasharray={lvl === 1 ? "none" : "3,3"}
              className={lvl === 1 ? "text-emerald-300/80 dark:text-emerald-800/80" : "text-muted-foreground/20"}
            />
          )
        })}

        {/* Axis lines */}
        {[0, 1, 2, 3].map((i) => {
          const outer = getCoordinates(maxRadius, i)
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-muted-foreground/25"
            />
          )
        })}

        {/* 100% Ideal Target Boundary */}
        <polygon
          points={[0, 1, 2, 3]
            .map((i) => getCoordinates(maxRadius, i))
            .map((p) => `${p.x},${p.y}`)
            .join(" ")}
          fill="rgba(16, 185, 129, 0.04)"
          stroke="#059669"
          strokeWidth="1"
          strokeDasharray="4,4"
        />

        {/* Soil Measured Polygon */}
        <polygon
          points={soilPolygonPoints}
          fill="rgba(5, 150, 105, 0.3)"
          stroke="#059669"
          strokeWidth="2.5"
          className="transition-all duration-700 ease-out"
        />

        {/* Vertex dots */}
        {soilPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4.5"
            fill="#ffffff"
            stroke="#059669"
            strokeWidth="2.5"
            className="transition-all duration-700 ease-out"
          />
        ))}

        {/* Axis Labels */}
        {axes.map((axis, i) => {
          const labelDist = maxRadius + 24
          const pos = getCoordinates(labelDist, i)

          let textAnchor: "middle" | "start" | "end" = "middle"
          if (i === 1) textAnchor = "start"
          if (i === 3) textAnchor = "end"

          return (
            <g key={i} transform={`translate(${pos.x}, ${pos.y})`}>
              <text
                textAnchor={textAnchor}
                className="text-[11px] font-bold fill-foreground"
                dy={i === 0 ? "-6" : i === 2 ? "14" : "4"}
              >
                {axis.label}
              </text>
              <text
                textAnchor={textAnchor}
                className="text-[10px] font-medium fill-emerald-700 dark:fill-emerald-400"
                dy={i === 0 ? "8" : i === 2 ? "26" : "18"}
              >
                {axis.value} {axis.unit} ({axis.score}%)
              </text>
            </g>
          )
        })}
      </svg>

      <div className="flex items-center gap-4 text-[11px] text-muted-foreground mt-2">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-600"></span>
          ค่าดินจริงของคุณ
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 border border-dashed border-emerald-600 rounded-sm"></span>
          ระดับที่พืชต้องการ (100%)
        </span>
      </div>
    </div>
  )
}
