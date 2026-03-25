<script setup>
// Hero chart: scale 4–10 mmol/L over y=10–110 (100px)
// yPos(v) = 10 + (10-v)/6*100
// 10→y10, 9→y27, 8→y43, 7→y60, 5.5→y85, 4→y110
const heroBgPath = `M 0,60 C 30,54 55,30 82,18 C 102,8 122,11 148,28
  C 168,40 188,54 218,64 C 252,74 282,80 322,83
  C 358,84 378,85 400,85`

const heroAreaPath = `M 0,120 L 0,60 C 30,54 55,30 82,18 C 102,8 122,11 148,28
  C 168,40 188,54 218,64 C 252,74 282,80 322,83
  C 358,84 378,85 400,85 L 400,120 Z`
</script>

<template>
    <div class="chart-wrap">
        <div class="chart-area">
            <!-- viewBox 0 0 400 120 — scale: 4 mmol/L=y110, 10 mmol/L=y10 -->
            <svg viewBox="0 0 400 120" preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg" class="chart-svg">
                <defs>
                    <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#34d399" stop-opacity="0.18"/>
                        <stop offset="100%" stop-color="#34d399" stop-opacity="0"/>
                    </linearGradient>
                    <clipPath id="chart-clip">
                        <rect x="0" y="0" width="400" height="120" class="clip-rect"/>
                    </clipPath>
                </defs>

                <!-- Grid lines fade in -->
                <line class="grid-line grid-line-1" x1="0" x2="400" y1="10" y2="10"
                    stroke="#f87171" stroke-width="0.6" opacity="0"/>
                <line class="grid-line grid-line-2" x1="0" x2="400" y1="85" y2="85"
                    stroke="#34d399" stroke-width="0.6" stroke-dasharray="5,4" opacity="0"/>
                <line class="grid-line grid-line-3" x1="0" x2="400" y1="110" y2="110"
                    stroke="#fbbf24" stroke-width="0.6" opacity="0"/>

                <!-- Target band -->
                <rect class="target-band" x="0" y="52" width="400" height="50"
                    fill="rgba(52,211,153,0.055)" opacity="0"/>

                <!-- Y-axis labels -->
                <text class="chart-label chart-label-1" x="3" y="9" font-size="7"
                    fill="#f87171" dominant-baseline="hanging" opacity="0">10</text>
                <text class="chart-label chart-label-2" x="3" y="79" font-size="7"
                    fill="#34d399" opacity="0">mål 5.5</text>
                <text class="chart-label chart-label-3" x="3" y="110" font-size="7"
                    fill="#fbbf24" opacity="0">4</text>

                <!-- Area fill (clipped + fades in after line draws) -->
                <path class="chart-area-fill" :d="heroAreaPath" fill="url(#heroGrad)" opacity="0"/>

                <!-- BG line draws in left → right -->
                <path class="chart-line" :d="heroBgPath" fill="none" stroke="#34d399"
                    stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>

                <!-- Current value dot (appears last) -->
                <circle class="chart-dot-ring" cx="400" cy="85" r="8" fill="#34d399" opacity="0"/>
                <circle class="chart-dot" cx="400" cy="85" r="4" fill="#34d399" opacity="0"/>
            </svg>

            <div class="chart-value">
                <span class="chart-val-num">5.5</span>
                <span class="chart-val-unit">mmol/L</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.chart-wrap {
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid #1e293b;
    border-radius: 16px;
    padding: 20px;
    backdrop-filter: blur(8px);
    animation: chart-appear 0.5s ease-out 0.1s both;
}

.chart-area {
    position: relative;
}

.chart-svg {
    width: 100%;
    height: 140px;
    display: block;
}

/* ── Grid lines ── */
.grid-line-1 { animation: fade-to 0.4s ease-out 0.25s both; --target-opacity: 0.25; }
.grid-line-2 { animation: fade-to 0.4s ease-out 0.35s both; --target-opacity: 0.45; }
.grid-line-3 { animation: fade-to 0.4s ease-out 0.45s both; --target-opacity: 0.20; }

.target-band  { animation: fade-to 0.5s ease-out 0.4s both; --target-opacity: 1; }

/* ── Labels ── */
.chart-label-1 { animation: fade-to 0.4s ease-out 0.3s both; --target-opacity: 0.55; }
.chart-label-2 { animation: fade-to 0.4s ease-out 0.4s both; --target-opacity: 0.7; }
.chart-label-3 { animation: fade-to 0.4s ease-out 0.5s both; --target-opacity: 0.5; }

/* ── BG line draw ── */
.chart-line {
    stroke-dasharray: 700;
    stroke-dashoffset: 700;
    animation: draw-line 1.1s cubic-bezier(0.4, 0, 0.2, 1) 0.5s forwards;
}

/* ── Area fill ── */
.chart-area-fill { animation: fade-to 0.6s ease-out 1.2s both; --target-opacity: 1; }

/* ── Dot ── */
.chart-dot {
    animation: dot-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) 1.5s both;
}
.chart-dot-ring {
    animation: ring-pulse 0.5s ease-out 1.6s both;
    --target-opacity: 0.15;
}

/* ── Chart container ── */
.chart-value {
    position: absolute;
    top: 8px;
    right: 0;
    display: flex;
    align-items: baseline;
    gap: 3px;
    animation: fade-to 0.4s ease-out 1.5s both;
    --target-opacity: 1;
    opacity: 0;
}

.chart-val-num {
    font-size: 18px;
    font-weight: 700;
    color: #34d399;
    font-family: var(--font-mono);
}

.chart-val-unit {
    font-size: 11px;
    color: #475569;
}

/* ── Keyframes ── */
@keyframes chart-appear {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
}

@keyframes draw-line {
    to { stroke-dashoffset: 0; }
}

@keyframes fade-to {
    from { opacity: 0; }
    to   { opacity: var(--target-opacity, 1); }
}

@keyframes dot-pop {
    from { opacity: 0; transform: scale(0); transform-origin: 400px 85px; }
    to   { opacity: 1; transform: scale(1); transform-origin: 400px 85px; }
}

@keyframes ring-pulse {
    from { opacity: 0; transform: scale(0.4); transform-origin: 400px 85px; }
    to   { opacity: 0.15; transform: scale(1); transform-origin: 400px 85px; }
}
</style>
