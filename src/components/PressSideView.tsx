import { useMemo, useRef, useState, useEffect } from "react";
import { usePressStore } from "../store/usePressStore";
import { PLATE_ARM_M } from "../utils/simulationEngine";

type DragTarget =
  | "stone-weight"
  | "stone-position"
  | "leverEnd"
  | "plate-left"
  | "plate-right"
  | "fruit-height"
  | null;

interface DragInfo {
  startX: number;
  startY: number;
  startValue: number;
  startValue2?: number;
}

export default function PressSideView() {
  const { params, simulationState, setParam } = usePressStore();
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);
  const [dragInfo, setDragInfo] = useState<DragInfo | null>(null);
  const [showFruitPanel, setShowFruitPanel] = useState(false);

  const {
    leverLength,
    stoneWeight,
    plateDiameter,
    fulcrumPosition,
    fruitWeight,
    moistureContent,
  } = params;
  const { compressionRatio, currentJuice, currentPressure, status } =
    simulationState;

  const viewW = 640;
  const viewH = 560;
  const groundY = viewH - 80;
  const frameX = 80;
  const frameRightX = viewW - 80;
  const frameWidth = frameRightX - frameX;

  const pivotY = 110;
  const pivotX = frameX + 20;

  const maxLeverPx = 460;
  const pxPerMeter = maxLeverPx / 8;

  const leverEndX = pivotX + leverLength * pxPerMeter;
  const stonePointX = pivotX + leverLength * fulcrumPosition * pxPerMeter;
  const pressPointX = pivotX + PLATE_ARM_M * pxPerMeter;

  const plungerWidth = Math.max(
    40,
    Math.min(frameWidth - 30, plateDiameter * pxPerMeter * 1.6)
  );
  const plungerX = pressPointX - plungerWidth / 2;

  const maxAngle = status === "idle" ? 0 : 6 + compressionRatio * 12;
  const angleRad = (maxAngle * Math.PI) / 180;

  function rotatePoint(
    x: number,
    y: number,
    cx: number,
    cy: number,
    angle: number
  ) {
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

  const initialFruitHeight = Math.min(
    160,
    Math.max(50, 60 + fruitWeight * 1.8)
  );
  const fruitHeight = initialFruitHeight * (1 - compressionRatio);
  const fruitTopY = groundY - fruitHeight - 30;

  const plungerTopY = pressPoint.y + 10;
  const plungerBottomY = fruitTopY;

  const stoneSize = 22 + Math.min(36, stoneWeight * 0.18);
  const juiceDropActive =
    status === "running" && currentPressure >= 50 && currentJuice > 0;

  const juiceLevel = useMemo(() => {
    const theoretical = fruitWeight * 1000 * (moistureContent / 100);
    return theoretical > 0 ? Math.min(1, currentJuice / theoretical) : 0;
  }, [currentJuice, fruitWeight, moistureContent]);

  const pressureColor =
    currentPressure < 50
      ? "#A0522D"
      : currentPressure < 200
      ? "#DAA520"
      : currentPressure < 500
      ? "#556B2F"
      : "#8B0000";

  function getSvgCoord(clientX: number, clientY: number) {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = viewW / rect.width;
    const scaleY = viewH / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function handleMouseDown(target: DragTarget, e: React.MouseEvent) {
    if (status === "running") return;
    e.preventDefault();
    e.stopPropagation();
    const { x, y } = getSvgCoord(e.clientX, e.clientY);
    setDragTarget(target);

    let startValue = 0;
    let startValue2: number | undefined;

    if (target === "stone-weight") startValue = stoneWeight;
    else if (target === "stone-position") startValue = fulcrumPosition;
    else if (target === "leverEnd") startValue = leverLength;
    else if (target === "plate-left" || target === "plate-right")
      startValue = plateDiameter;
    else if (target === "fruit-height") {
      startValue = fruitWeight;
      startValue2 = moistureContent;
    }

    setDragInfo({ startX: x, startY: y, startValue, startValue2 });
  }

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      if (!dragTarget || !dragInfo || !svgRef.current) return;
      const { x, y } = getSvgCoord(e.clientX, e.clientY);
      const dx = x - dragInfo.startX;
      const dy = y - dragInfo.startY;

      if (dragTarget === "stone-weight") {
        const newWeight = Math.max(
          5,
          Math.min(500, Math.round((dragInfo.startValue - dy * 0.9) / 5) * 5)
        );
        if (newWeight !== stoneWeight) {
          setParam("stoneWeight", newWeight);
        }
      } else if (dragTarget === "stone-position") {
        const minPos = Math.max(0.3, 0.8 / leverLength);
        const rawPos = dragInfo.startValue + dx / (leverLength * pxPerMeter);
        const newPos = Math.max(
          minPos,
          Math.min(0.95, Math.round(rawPos * 100) / 100)
        );
        if (newPos !== fulcrumPosition) {
          setParam("fulcrumPosition", newPos);
        }
      } else if (dragTarget === "leverEnd") {
        const newLength = Math.max(
          1.0,
          Math.min(8, dragInfo.startValue + dx / pxPerMeter)
        );
        const rounded = Math.round(newLength * 10) / 10;
        if (rounded !== leverLength) {
          setParam("leverLength", rounded);
        }
      } else if (dragTarget === "plate-left" || dragTarget === "plate-right") {
        const factor = dragTarget === "plate-right" ? 1 : -1;
        const delta = (factor * dx * 2) / (pxPerMeter * 1.6);
        const newDiameter = Math.max(
          0.2,
          Math.min(1.2, Math.round((dragInfo.startValue + delta) * 100) / 100)
        );
        if (newDiameter !== plateDiameter) {
          setParam("plateDiameter", newDiameter);
        }
      } else if (dragTarget === "fruit-height") {
        const newWeight = Math.max(
          1,
          Math.min(200, Math.round(dragInfo.startValue - dy * 0.6))
        );
        if (newWeight !== fruitWeight) {
          setParam("fruitWeight", newWeight);
        }
      }
    }

    function handleUp() {
      setDragTarget(null);
      setDragInfo(null);
    }

    if (dragTarget) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [
    dragTarget,
    dragInfo,
    stoneWeight,
    leverLength,
    fulcrumPosition,
    plateDiameter,
    fruitWeight,
    setParam,
  ]);

  const cursorStyle = status === "running" ? "default" : "grab";
  const draggingStyle = dragTarget ? "grabbing" : cursorStyle;

  const canInteract = status !== "running";

  return (
    <div className="vintage-card p-4 w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display text-xl font-bold text-wood-700 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-rust-500" />
          压榨机侧视图
        </h2>
        <span className="text-[10px] text-slate-500 italic leading-tight text-right">
          {canInteract
            ? "💡 拖杆尾改长度 · 拖石头右/左改挂点 · 上下拖石头改重量 · 拖压盘边缘改尺寸 · 拖果料改重量"
            : "模拟运行中..."}
        </span>
      </div>
      <div
        className="flex-1 relative rounded-md overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, #E8D9BE 0%, #F5EFE3 60%, #D4B98C 100%)",
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${viewW} ${viewH}`}
          className="w-full h-full select-none"
          preserveAspectRatio="xMidYMid meet"
          style={{ cursor: "default" }}
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
              <stop offset="0%" stopColor="#6B6B6B" />
              <stop offset="50%" stopColor="#4A4A4A" />
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
            <pattern
              id="grainPattern"
              patternUnits="userSpaceOnUse"
              width="6"
              height="20"
            >
              <rect width="6" height="20" fill="#7B3A10" />
              <line
                x1="1"
                y1="0"
                x2="1"
                y2="20"
                stroke="#6B3410"
                strokeWidth="1"
                opacity="0.6"
              />
              <line
                x1="3.5"
                y1="0"
                x2="3.5"
                y2="20"
                stroke="#8B4513"
                strokeWidth="0.8"
                opacity="0.5"
              />
              <line
                x1="5"
                y1="0"
                x2="5"
                y2="20"
                stroke="#5A2A08"
                strokeWidth="1"
                opacity="0.4"
              />
            </pattern>
            <pattern
              id="stonePattern"
              patternUnits="userSpaceOnUse"
              width="8"
              height="8"
            >
              <rect width="8" height="8" fill="#5C5C5C" />
              <circle cx="2" cy="2" r="0.8" fill="#4A4A4A" />
              <circle cx="6" cy="5" r="0.6" fill="#7A7A7A" />
              <circle cx="4" cy="6" r="0.5" fill="#3A3A3A" />
            </pattern>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
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

          <rect
            x={0}
            y={groundY}
            width={viewW}
            height={viewH - groundY}
            fill="url(#woodFrame)"
          />
          <rect
            x={0}
            y={groundY}
            width={viewW}
            height={6}
            fill="#4A240B"
            opacity="0.5"
          />

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

          <circle
            cx={pivotX}
            cy={pivotY}
            r={11}
            fill="#2A2A2A"
            stroke="#1A1A1A"
            strokeWidth="2"
          />
          <circle cx={pivotX} cy={pivotY} r={4.5} fill="#5C5C5C" />

          <line
            x1={pivotX}
            y1={pivotY}
            x2={leverEnd.x}
            y2={leverEnd.y}
            stroke="url(#grainPattern)"
            strokeWidth="17"
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

          <g
            onMouseDown={(e) => handleMouseDown("leverEnd", e)}
            style={{ cursor: canInteract ? draggingStyle : "default" }}
          >
            <circle
              cx={leverEnd.x}
              cy={leverEnd.y}
              r="12"
              fill="#8B4513"
              stroke="#4A240B"
              strokeWidth="2"
              opacity={dragTarget === "leverEnd" ? 1 : 0}
              filter="url(#glow)"
            />
            <circle
              cx={leverEnd.x}
              cy={leverEnd.y}
              r="7"
              fill="#D4B98C"
              stroke="#8B4513"
              strokeWidth="1.5"
              opacity={canInteract ? 0.9 : 0}
            />
            {canInteract && (
              <text
                x={leverEnd.x + 14}
                y={leverEnd.y + 4}
                fill="#6B3410"
                fontSize="10"
                fontFamily="Source Serif Pro, serif"
                fontWeight="600"
              >
                拖改长度
              </text>
            )}
          </g>

          <line
            x1={pivotX}
            y1={pivotY - 32}
            x2={pivotX}
            y2={pivotY + 32}
            stroke="#A0522D"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.5"
          />
          <text
            x={pivotX - 4}
            y={pivotY - 38}
            fill="#A0522D"
            fontSize="10.5"
            fontFamily="Source Serif Pro, serif"
          >
            支点
          </text>

          <circle
            cx={pressPoint.x}
            cy={pressPoint.y}
            r={7.5}
            fill="#2A2A2A"
            stroke="#1A1A1A"
            strokeWidth="1.5"
          />
          <line
            x1={pressPoint.x}
            y1={pressPoint.y + 7.5}
            x2={pressPoint.x}
            y2={plungerTopY}
            stroke="#5C5C5C"
            strokeWidth="5"
          />
          <line
            x1={pressPoint.x - 2}
            y1={pressPoint.y + 7.5}
            x2={pressPoint.x - 2}
            y2={plungerTopY}
            stroke="#7A7A7A"
            strokeWidth="1"
          />

          <line
            x1={pressPointX}
            y1={pivotY + 24}
            x2={pressPointX}
            y2={pivotY + 36}
            stroke="#556B2F"
            strokeWidth="1"
            strokeDasharray="2 2"
            opacity="0.6"
          />
          <text
            x={pressPointX - 8}
            y={pivotY + 46}
            fill="#556B2F"
            fontSize="9"
            fontFamily="Source Serif Pro, serif"
          >
            压点 {PLATE_ARM_M}m
          </text>

          <rect
            x={plungerX}
            y={plungerTopY}
            width={plungerWidth}
            height={Math.max(5, plungerBottomY - plungerTopY)}
            fill="url(#plungerGrad)"
            stroke="#1A1A1A"
            strokeWidth="1.5"
            rx="4"
          />
          <rect
            x={plungerX}
            y={plungerTopY}
            width={plungerWidth}
            height={9}
            fill="#8A8A8A"
            opacity="0.45"
            rx="4"
          />

          {canInteract && (
            <>
              <g
                onMouseDown={(e) => handleMouseDown("plate-left", e)}
                style={{ cursor: "ew-resize" }}
              >
                <rect
                  x={plungerX - 3}
                  y={plungerTopY + 12}
                  width={6}
                  height={Math.max(16, plungerBottomY - plungerTopY - 20)}
                  fill="#DAA520"
                  opacity={dragTarget === "plate-left" ? 0.8 : 0.3}
                  rx="2"
                />
                <line
                  x1={plungerX}
                  y1={plungerTopY + 16}
                  x2={plungerX}
                  y2={plungerBottomY - 8}
                  stroke="#8B6508"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                  opacity="0.6"
                />
              </g>
              <g
                onMouseDown={(e) => handleMouseDown("plate-right", e)}
                style={{ cursor: "ew-resize" }}
              >
                <rect
                  x={plungerX + plungerWidth - 3}
                  y={plungerTopY + 12}
                  width={6}
                  height={Math.max(16, plungerBottomY - plungerTopY - 20)}
                  fill="#DAA520"
                  opacity={dragTarget === "plate-right" ? 0.8 : 0.3}
                  rx="2"
                />
                <line
                  x1={plungerX + plungerWidth}
                  y1={plungerTopY + 16}
                  x2={plungerX + plungerWidth}
                  y2={plungerBottomY - 8}
                  stroke="#8B6508"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                  opacity="0.6"
                />
              </g>
            </>
          )}

          <text
            x={pressPoint.x}
            y={plungerTopY - 4}
            fill="#6B3410"
            fontSize="9"
            textAnchor="middle"
            fontFamily="Source Serif Pro, serif"
            fontWeight="600"
          >
            Ø {plateDiameter.toFixed(2)}m
          </text>

          <rect
            x={frameX + 6}
            y={groundY - 30 - initialFruitHeight}
            width={frameWidth - 12}
            height={initialFruitHeight + 30}
            fill="#F5EFE3"
            stroke="#8B4513"
            strokeWidth="2"
            opacity="0.12"
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
            opacity="0.55"
          />

          {fruitHeight > 2 && (
            <g
              onMouseDown={(e) => handleMouseDown("fruit-height", e)}
              style={{
                cursor: canInteract ? "ns-resize" : "default",
              }}
              onDoubleClick={() => canInteract && setShowFruitPanel((v) => !v)}
            >
              <rect
                x={frameX + 10}
                y={fruitTopY}
                width={frameWidth - 20}
                height={fruitHeight}
                fill="url(#fruitGrad)"
                rx="2"
              />
              {canInteract && (
                <rect
                  x={frameX + 10}
                  y={fruitTopY}
                  width={frameWidth - 20}
                  height={6}
                  fill="#DAA520"
                  opacity={dragTarget === "fruit-height" ? 0.9 : 0.35}
                  rx="2"
                />
              )}
            </g>
          )}

          {fruitHeight > 10 &&
            Array.from({ length: 12 }).map((_, i) => {
              const cx =
                frameX + 20 + ((i * 31) % (frameWidth - 50));
              const cy =
                fruitTopY +
                14 +
                ((i * 19) % Math.max(10, fruitHeight - 24));
              const r = 4 + (i % 3) * 2;
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="#3F5020"
                  opacity="0.4"
                  pointerEvents="none"
                />
              );
            })}

          {canInteract && fruitHeight > 2 && (
            <text
              x={frameX + frameWidth / 2}
              y={fruitTopY - 6}
              fill="#6B3410"
              fontSize="9"
              textAnchor="middle"
              fontFamily="Source Serif Pro, serif"
              fontWeight="600"
            >
              {fruitWeight}kg · {moistureContent}%含水
              {dragTarget !== "fruit-height" && " · 拖上/下改重量，双击改含水"}
            </text>
          )}

          {showFruitPanel && canInteract && (
            <g>
              <rect
                x={frameX + 10}
                y={groundY - 30 - initialFruitHeight - 66}
                width={frameWidth - 20}
                height={56}
                fill="#F5EFE3"
                stroke="#8B4513"
                strokeWidth="1.5"
                rx="4"
              />
              <text
                x={frameX + 20}
                y={groundY - 30 - initialFruitHeight - 46}
                fill="#4A240B"
                fontSize="10"
                fontFamily="Source Serif Pro, serif"
                fontWeight="600"
              >
                果料含水率：
              </text>
              <foreignObject
                x={frameX + 100}
                y={groundY - 30 - initialFruitHeight - 58}
                width={frameWidth - 140}
                height={20}
              >
                <div style={{ width: "100%", padding: "2px 4px" }}>
                  <input
                    type="range"
                    min={20}
                    max={95}
                    step={1}
                    value={moistureContent}
                    onChange={(e) =>
                      setParam(
                        "moistureContent",
                        parseFloat(e.target.value)
                      )
                    }
                    style={{
                      width: "100%",
                      accentColor: "#556B2F",
                    }}
                  />
                </div>
              </foreignObject>
              <text
                x={frameX + frameWidth - 20}
                y={groundY - 30 - initialFruitHeight - 46}
                fill="#556B2F"
                fontSize="11"
                textAnchor="end"
                fontFamily="Cinzel, serif"
                fontWeight="700"
              >
                {moistureContent}%
              </text>
              <text
                x={frameX + frameWidth / 2}
                y={groundY - 30 - initialFruitHeight - 20}
                fill="#8B4513"
                fontSize="9"
                textAnchor="middle"
                fontFamily="Source Serif Pro, serif"
                fontStyle="italic"
              >
                拖动滑块调整含水率，再次双击果料关闭
              </text>
            </g>
          )}

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
                cx={frameX + 60 + i * 55}
                cy={groundY - 32}
                r="3.5"
                fill="#DAA520"
                opacity="0.85"
                style={{
                  animation: `drip 1.4s ease-in ${i * 0.45}s infinite`,
                  transformOrigin: `${frameX + 60 + i * 55}px ${
                    groundY - 32
                  }px`,
                }}
              />
            ))}

          <g style={{ cursor: canInteract ? draggingStyle : "default" }}>
            <line
              x1={stonePoint.x}
              y1={stonePoint.y}
              x2={stonePoint.x}
              y2={stonePoint.y + 6}
              stroke="#2A2A2A"
              strokeWidth="2"
            />
            {canInteract && (
              <g
                onMouseDown={(e) => handleMouseDown("stone-position", e)}
                style={{ cursor: "ew-resize" }}
              >
                <circle
                  cx={stonePoint.x}
                  cy={stonePoint.y + 2}
                  r={8}
                  fill="#DAA520"
                  opacity={dragTarget === "stone-position" ? 0.7 : 0.15}
                />
              </g>
            )}
            <g
              onMouseDown={(e) => handleMouseDown("stone-weight", e)}
              style={{ cursor: canInteract ? draggingStyle : "default" }}
            >
              <rect
                x={stonePoint.x - stoneSize / 2 - 3}
                y={stonePoint.y + 3}
                width={stoneSize + 6}
                height={stoneSize * 0.8 + 6}
                fill="#8B4513"
                opacity={dragTarget === "stone-weight" ? 0.25 : 0}
                rx="6"
              />
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
                width={stoneSize * 0.32}
                height={4}
                fill="#7A7A7A"
                opacity="0.5"
                rx="2"
              />
            </g>
            {canInteract && (
              <text
                x={stonePoint.x}
                y={stonePoint.y + stoneSize * 0.8 + 22}
                fill="#4A240B"
                fontSize="10"
                textAnchor="middle"
                fontFamily="Source Serif Pro, serif"
                fontWeight="600"
              >
                {stoneWeight}kg · {(fulcrumPosition * 100).toFixed(0)}%
              </text>
            )}
            {canInteract && dragTarget === null && (
              <text
                x={stonePoint.x}
                y={stonePoint.y + stoneSize * 0.8 + 34}
                fill="#8B4513"
                fontSize="8.5"
                textAnchor="middle"
                fontFamily="Source Serif Pro, serif"
                fontStyle="italic"
              >
                上下拖改重量 · 左右拖改挂点
              </text>
            )}
          </g>

          <g transform={`translate(${viewW - 160}, 14)`}>
            <rect
              x={0}
              y={0}
              width={144}
              height={82}
              fill="#F5EFE3"
              stroke="#8B4513"
              strokeWidth="1.5"
              rx="4"
              opacity="0.95"
            />
            <text
              x={10}
              y={19}
              fill="#4A240B"
              fontSize="11"
              fontFamily="Source Serif Pro, serif"
              fontWeight="600"
            >
              当前压力
            </text>
            <text
              x={10}
              y={42}
              fill={pressureColor}
              fontSize="20"
              fontFamily="Cinzel, serif"
              fontWeight="700"
            >
              {currentPressure.toFixed(1)} kPa
            </text>
            <text
              x={10}
              y={58}
              fill="#556B2F"
              fontSize="10.5"
              fontFamily="Source Serif Pro, serif"
            >
              出汁 {currentJuice.toFixed(0)} mL
            </text>
            <text
              x={10}
              y={73}
              fill="#6B3410"
              fontSize="10.5"
              fontFamily="Source Serif Pro, serif"
            >
              压缩 {(compressionRatio * 100).toFixed(0)}%
            </text>
          </g>

          <text
            x={frameX + 14}
            y={viewH - 8}
            fill="#4A240B"
            fontSize="10"
            fontFamily="Source Serif Pro, serif"
          >
            杠杆 {leverLength.toFixed(1)}m · 挂点{" "}
            {(fulcrumPosition * 100).toFixed(0)}% · 压盘 Ø
            {plateDiameter.toFixed(2)}m · 果料 {fruitWeight}kg /{" "}
            {moistureContent}%
          </text>
        </svg>
      </div>
    </div>
  );
}
