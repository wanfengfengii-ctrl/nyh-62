import { useMemo } from "react";
import { usePressStore } from "../store/usePressStore";

export default function PressSideView() {
  const { params, simulationState } = usePressStore();

  const { leverLength, stoneWeight } = params;
  const { compressionRatio, currentJuice, currentPressure, status } =
    simulationState;

  const viewW = 640;
  const viewH = 520;

  const groundY = viewH - 60;
  const frameX = 120;
  const frameRightX = viewW - 120;
  const frameWidth = frameRightX - frameX;

  const pivotY = 110;
  const pivotX = frameX + 30;

  const maxLeverPx = 380;
  const leverScale = Math.min(1, maxLeverPx / (leverLength * 120));
  const leverEndX = pivotX + leverLength * 120 * leverScale;

  const pressPointX = pivotX + leverLength * 120 * 0.3 * leverScale;
  const stonePointX = pivotX + leverLength * 120 * 0.8 * leverScale;

  const maxAngle = status === "idle" ? 0 : 8 + compressionRatio * 14;
  const angleRad = (maxAngle * Math.PI) / 180;

  function rotatePoint(x: number, y: number, cx: number, cy: number, angle: number) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = x - cx;
    const dy = y - cy;
    return {
      x: cx + dx * cos - dy * sin,
      y: cy + dx * sin + dy * cos,
    };
  }

  const leverEnd = rotatePoint(leverEndX, pivotY, pivotX, pivotY, angleRad);
  const pressPoint = rotatePoint(pressPointX, pivotY, pivotX, pivotY, angleRad);
  const stonePoint = rotatePoint(stonePointX, pivotY, pivotX, pivotY, angleRad);

  const initialFruitHeight = 140;
  const fruitHeight = initialFruitHeight * (1 - compressionRatio);
  const fruitTopY = groundY - fruitHeight - 30;

  const plungerTopY = pressPoint.y + 10;
  const plungerBottomY = fruitTopY;
  const plungerX = pressPoint.x - 55;
  const plungerW = 110;

  const stoneSize = 24 + Math.min(40, stoneWeight * 0.3);
  const juiceDropActive =
    status === "running" && currentPressure >= 50 && currentJuice > 0;

  const juiceLevel = useMemo(() => {
    const theoretical = params.fruitWeight * 1000 * (params.moistureContent / 100);
    return theoretical > 0 ? Math.min(1, currentJuice / theoretical) : 0;
  }, [currentJuice, params.fruitWeight, params.moistureContent]);

  const pressureColor =
    currentPressure < 50
      ? "#A0522D"
      : currentPressure < 200
      ? "#DAA520"
      : "#556B2F";

  return (
    <div className="vintage-card p-4 w-full h-full flex flex-col">
      <h2 className="font-display text-xl font-bold text-wood-700 mb-2 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-rust-500" />
        压榨机侧视图
      </h2>
      <div className="flex-1 relative rounded-md overflow-hidden" style={{ background: "linear-gradient(180deg, #E8D9BE 0%, #F5EFE3 60%, #D4B98C 100%)" }}>
        <svg
          viewBox={`0 0 ${viewW} ${viewH}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="woodFrame" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6B3410" />
              <stop offset="30%" stopColor="#8B4513" />
              <stop offset="60%" stopColor="#7B3A10" />
              <stop offset="100%" stopColor="#4A240B" />
            </linearGradient>
            <linearGradient id="woodGrainVert" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B4513" />
              <stop offset="50%" stopColor="#6B3410" />
              <stop offset="100%" stopColor="#4A240B" />
            </linearGradient>
            <linearGradient id="stoneGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7A7A7A" />
              <stop offset="40%" stopColor="#5C5C5C" />
              <stop offset="100%" stopColor="#2A2A2A" />
            </linearGradient>
            <linearGradient id="plungerGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5C5C5C" />
              <stop offset="50%" stopColor="#3D3D3D" />
              <stop offset="100%" stopColor="#2A2A2A" />
            </linearGradient>
            <linearGradient id="fruitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8BA543" />
              <stop offset="40%" stopColor="#556B2F" />
              <stop offset="80%" stopColor="#3F5020" />
              <stop offset="100%" stopColor="#2D3A15" />
            </linearGradient>
            <linearGradient id="juiceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E5B84A" />
              <stop offset="50%" stopColor="#DAA520" />
              <stop offset="100%" stopColor="#8B6508" />
            </linearGradient>
            <pattern id="grainPattern" patternUnits="userSpaceOnUse" width="6" height="20">
              <rect width="6" height="20" fill="#7B3A10" />
              <line x1="1" y1="0" x2="1" y2="20" stroke="#6B3410" strokeWidth="1" opacity="0.6" />
              <line x1="3.5" y1="0" x2="3.5" y2="20" stroke="#8B4513" strokeWidth="0.8" opacity="0.5" />
              <line x1="5" y1="0" x2="5" y2="20" stroke="#5A2A08" strokeWidth="1" opacity="0.4" />
            </pattern>
            <pattern id="stonePattern" patternUnits="userSpaceOnUse" width="8" height="8">
              <rect width="8" height="8" fill="#5C5C5C" />
              <circle cx="2" cy="2" r="0.8" fill="#4A4A4A" />
              <circle cx="6" cy="5" r="0.6" fill="#7A7A7A" />
              <circle cx="4" cy="6" r="0.5" fill="#3A3A3A" />
            </pattern>
          </defs>

          <rect
            x={10}
            y={10}
            width={viewW - 20}
            height={viewH - 20}
            fill="none"
            stroke="#8B4513"
            strokeWidth="3"
            rx="4"
            opacity="0.4"
          />

          <rect x={0} y={groundY} width={viewW} height={viewH - groundY} fill="url(#woodFrame)" />
          <rect x={0} y={groundY} width={viewW} height={6} fill="#4A240B" opacity="0.5" />

          <rect
            x={frameX - 16}
            y={60}
            width={20}
            height={groundY - 60}
            fill="url(#woodGrainVert)"
            stroke="#4A240B"
            strokeWidth="1"
          />
          <rect
            x={frameRightX - 4}
            y={60}
            width={20}
            height={groundY - 60}
            fill="url(#woodGrainVert)"
            stroke="#4A240B"
            strokeWidth="1"
          />
          <rect
            x={frameX - 16}
            y={52}
            width={frameRightX - frameX + 36}
            height={16}
            fill="url(#woodFrame)"
            stroke="#4A240B"
            strokeWidth="1"
          />

          <circle cx={pivotX} cy={pivotY} r={10} fill="#2A2A2A" stroke="#1A1A1A" strokeWidth="2" />
          <circle cx={pivotX} cy={pivotY} r={4} fill="#5C5C5C" />

          <line
            x1={pivotX}
            y1={pivotY}
            x2={leverEnd.x}
            y2={leverEnd.y}
            stroke="url(#grainPattern)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <line
            x1={pivotX}
            y1={pivotY}
            x2={leverEnd.x}
            y2={leverEnd.y}
            stroke="#4A240B"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />

          <circle cx={pressPoint.x} cy={pressPoint.y} r={7} fill="#2A2A2A" stroke="#1A1A1A" strokeWidth="1.5" />
          <line
            x1={pressPoint.x}
            y1={pressPoint.y + 7}
            x2={pressPoint.x}
            y2={plungerTopY}
            stroke="#5C5C5C"
            strokeWidth="4"
          />
          <line
            x1={pressPoint.x - 2}
            y1={pressPoint.y + 7}
            x2={pressPoint.x - 2}
            y2={plungerTopY}
            stroke="#7A7A7A"
            strokeWidth="1"
          />

          <rect
            x={plungerX}
            y={plungerTopY}
            width={plungerW}
            height={Math.max(4, plungerBottomY - plungerTopY)}
            fill="url(#plungerGrad)"
            stroke="#1A1A1A"
            strokeWidth="1.5"
            rx="3"
          />
          <rect
            x={plungerX}
            y={plungerTopY}
            width={plungerW}
            height={8}
            fill="#7A7A7A"
            opacity="0.5"
            rx="3"
          />

          <rect
            x={frameX + 6}
            y={groundY - 30 - initialFruitHeight}
            width={frameWidth - 12}
            height={initialFruitHeight + 30}
            fill="#F5EFE3"
            stroke="#8B4513"
            strokeWidth="2"
            opacity="0.15"
            strokeDasharray="4 3"
          />

          <rect
            x={frameX + 6}
            y={groundY - 30 - initialFruitHeight}
            width={frameWidth - 12}
            height={initialFruitHeight + 30}
            fill="none"
            stroke="#8B4513"
            strokeWidth="2"
            opacity="0.6"
          />

          {fruitHeight > 2 && (
            <rect
              x={frameX + 10}
              y={fruitTopY}
              width={frameWidth - 20}
              height={fruitHeight}
              fill="url(#fruitGrad)"
              rx="2"
            />
          )}

          {fruitHeight > 10 &&
            Array.from({ length: 12 }).map((_, i) => {
              const cx = frameX + 18 + ((i * 29) % (frameWidth - 40));
              const cy = fruitTopY + 12 + ((i * 17) % Math.max(8, fruitHeight - 20));
              const r = 4 + (i % 3) * 2;
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="#3F5020"
                  opacity="0.45"
                />
              );
            })}

          <rect
            x={frameX + 10}
            y={groundY - 30}
            width={frameWidth - 20}
            height={30}
            fill="url(#woodGrainVert)"
            stroke="#4A240B"
            strokeWidth="1"
          />
          {Array.from({ length: 14 }).map((_, i) => (
            <line
              key={`slot-${i}`}
              x1={frameX + 14 + i * 14}
              y1={groundY - 30}
              x2={frameX + 14 + i * 14}
              y2={groundY - 2}
              stroke="#4A240B"
              strokeWidth="1.5"
              opacity="0.6"
            />
          ))}

          <rect
            x={frameX + 8}
            y={groundY + 2}
            width={frameWidth - 16}
            height={18}
            fill="url(#juiceGrad)"
            opacity={0.2 + juiceLevel * 0.7}
            rx="2"
          />
          <rect
            x={frameX + 8}
            y={groundY + 2 + 18 * (1 - juiceLevel)}
            width={frameWidth - 16}
            height={18 * juiceLevel}
            fill="url(#juiceGrad)"
            rx="2"
          />

          {juiceDropActive &&
            Array.from({ length: 3 }).map((_, i) => (
              <circle
                key={`drip-${i}`}
                cx={frameX + 50 + i * 50}
                cy={groundY - 32}
                r="3.5"
                fill="#DAA520"
                opacity="0.85"
                style={{
                  animation: `drip 1.4s ease-in ${i * 0.45}s infinite`,
                  transformOrigin: `${frameX + 50 + i * 50}px ${groundY - 32}px`,
                }}
              />
            ))}

          <rect
            x={stonePoint.x - stoneSize / 2}
            y={stonePoint.y + 6}
            width={stoneSize}
            height={stoneSize * 0.8}
            fill="url(#stonePattern)"
            stroke="#1A1A1A"
            strokeWidth="1.5"
            rx="4"
          />
          <rect
            x={stonePoint.x - stoneSize / 2 + 3}
            y={stonePoint.y + 9}
            width={stoneSize * 0.35}
            height={4}
            fill="#7A7A7A"
            opacity="0.5"
            rx="2"
          />

          <line
            x1={pivotX}
            y1={pivotY - 30}
            x2={pivotX}
            y2={pivotY + 30}
            stroke="#A0522D"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.6"
          />
          <text x={pivotX - 4} y={pivotY - 36} fill="#A0522D" fontSize="11" fontFamily="Source Serif Pro, serif">
            支点
          </text>

          <text x={stonePoint.x - 12} y={stonePoint.y + stoneSize * 0.8 + 22} fill="#4A240B" fontSize="11" fontFamily="Source Serif Pro, serif" fontWeight="600">
            压石 {stoneWeight}kg
          </text>

          <g transform={`translate(${viewW - 150}, 20)`}>
            <rect x={0} y={0} width={130} height={58} fill="#F5EFE3" stroke="#8B4513" strokeWidth="1.5" rx="4" opacity="0.95" />
            <text x={10} y={20} fill="#4A240B" fontSize="11" fontFamily="Source Serif Pro, serif">
              当前压力
            </text>
            <text x={10} y={42} fill={pressureColor} fontSize="18" fontFamily="Cinzel, serif" fontWeight="700">
              {currentPressure.toFixed(1)} kPa
            </text>
            <text x={10} y={54} fill="#556B2F" fontSize="10" fontFamily="Source Serif Pro, serif">
              出汁 {currentJuice.toFixed(0)} mL
            </text>
          </g>

          <text x={frameX + 14} y={groundY + 54} fill="#4A240B" fontSize="10" fontFamily="Source Serif Pro, serif">
            杠杆长度: {leverLength}m · 压缩比: {(compressionRatio * 100).toFixed(0)}%
          </text>
        </svg>
      </div>
    </div>
  );
}
