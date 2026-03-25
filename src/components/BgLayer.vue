<script setup>
// BG background curve (seamless loop — starts and ends at y=110, ~5.5 mmol/L)
// Scale: y=20 ≈ 10 mmol/L (high), y=110 ≈ 5.5 mmol/L (target), y=155 ≈ 4 mmol/L (low)
const bgPath = `M 0,110 C 60,108 100,88 150,62 C 190,42 210,32 248,36
  C 278,40 298,56 332,74 C 362,88 388,100 425,108
  C 455,114 480,118 515,120 C 545,122 568,118 605,110
  C 635,104 665,100 705,98 C 735,97 762,100 802,108
  C 832,115 862,120 904,118 C 934,115 962,106 1004,93
  C 1038,82 1062,73 1098,76 C 1128,79 1152,90 1188,100
  C 1218,108 1248,113 1285,112 C 1315,111 1345,110 1400,110`

const bgArea = `M 0,200 L 0,110 C 60,108 100,88 150,62 C 190,42 210,32 248,36
  C 278,40 298,56 332,74 C 362,88 388,100 425,108
  C 455,114 480,118 515,120 C 545,122 568,118 605,110
  C 635,104 665,100 705,98 C 735,97 762,100 802,108
  C 832,115 862,120 904,118 C 934,115 962,106 1004,93
  C 1038,82 1062,73 1098,76 C 1128,79 1152,90 1188,100
  C 1218,108 1248,113 1285,112 C 1315,111 1345,110 1400,110 L 1400,200 Z`
</script>

<template>
    <div class="bg-layer" aria-hidden="true">
        <div class="bg-grid"></div>
        <div class="bg-curve-wrap">
            <div class="bg-curve-scroll">
                <svg v-for="n in 2" :key="n" class="bg-svg"
                    viewBox="0 0 1400 200" preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient :id="`bgl${n}`" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="#34d399" stop-opacity="0.07"/>
                            <stop offset="100%" stop-color="#34d399" stop-opacity="0"/>
                        </linearGradient>
                    </defs>
                    <rect x="0" y="62" width="1400" height="76" fill="rgba(52,211,153,0.025)"/>
                    <path :d="bgArea" :fill="`url(#bgl${n})`"/>
                    <path :d="bgPath" fill="none" stroke="#34d399" stroke-width="1.5"
                        stroke-linejoin="round" stroke-linecap="round" opacity="0.18"/>
                </svg>
            </div>
        </div>
        <div class="bg-vignette"></div>
    </div>
</template>

<style scoped>
.bg-layer {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
}

.bg-grid {
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(56, 189, 248, 0.045) 1px, transparent 1px),
        linear-gradient(90deg, rgba(56, 189, 248, 0.045) 1px, transparent 1px);
    background-size: 44px 44px;
}

.bg-vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 75% 70% at 50% 35%, transparent 20%, #0f172a 80%);
}

.bg-curve-wrap {
    position: absolute;
    bottom: 12%;
    left: 0;
    right: 0;
    height: 200px;
    overflow: hidden;
}

.bg-curve-scroll {
    display: flex;
    width: 200%;
    height: 100%;
    animation: scroll-bg 30s linear infinite;
}

.bg-svg {
    width: 50%;
    height: 100%;
    flex-shrink: 0;
}

@keyframes scroll-bg {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
}
</style>
