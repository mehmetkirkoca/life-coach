<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'
import type { ChartConfiguration } from 'chart.js'
import { LIFE_AREAS } from '../stores/coaching'
import type { LifeArea } from '../stores/coaching'

Chart.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

const props = defineProps<{
  ratings: Record<LifeArea, { current: number; target: number }>
}>()

const { t } = useI18n()
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

function getAreaLabels() {
  return LIFE_AREAS.map(area => t(`assessment.areas.${area}`))
}

function getChartData() {
  const currentData = LIFE_AREAS.map(area => props.ratings[area].current)
  const targetData = LIFE_AREAS.map(area => props.ratings[area].target)

  return {
    labels: getAreaLabels(),
    datasets: [
      {
        label: t('assessment.currentLabel'),
        data: currentData,
        backgroundColor: 'rgba(239, 68, 68, 0.15)', // Light red
        borderColor: 'rgba(239, 68, 68, 0.8)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(239, 68, 68, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(239, 68, 68, 1)',
        pointRadius: 4,
        tension: 0.1
      },
      {
        label: t('assessment.targetLabel'),
        data: targetData,
        backgroundColor: 'rgba(6, 182, 212, 0.1)', // Light cyan
        borderColor: 'rgba(6, 182, 212, 0.8)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(6, 182, 212, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(6, 182, 212, 1)',
        pointRadius: 4,
        tension: 0.1
      }
    ]
  }
}

function initChart() {
  if (!chartCanvas.value) return

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  const config: ChartConfiguration<'radar'> = {
    type: 'radar',
    data: getChartData(),
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#e5e7eb',
            font: {
              family: 'Inter',
              size: 12
            },
            padding: 20
          }
        },
        tooltip: {
          titleFont: { family: 'Outfit', size: 14 },
          bodyFont: { family: 'Inter', size: 12 },
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          borderWidth: 1
        }
      },
      scales: {
        r: {
          min: 0,
          max: 10,
          ticks: {
            stepSize: 2,
            display: false, // Clean look, no tick texts
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            circular: false
          },
          angleLines: {
            color: 'rgba(255, 255, 255, 0.08)'
          },
          pointLabels: {
            color: '#9ca3af',
            font: {
              family: 'Outfit',
              size: 11,
              weight: 500
            }
          }
        }
      }
    }
  }

  chartInstance = new Chart(ctx, config)
}

watch(
  () => props.ratings,
  () => {
    if (chartInstance) {
      chartInstance.data = getChartData()
      chartInstance.update()
    }
  },
  { deep: true }
)

// Watch for locale changes to translate chart labels
watch(
  () => t('assessment.areas.health'), 
  () => {
    if (chartInstance) {
      chartInstance.data.labels = getAreaLabels()
      chartInstance.data.datasets[0].label = t('assessment.currentLabel')
      chartInstance.data.datasets[1].label = t('assessment.targetLabel')
      chartInstance.update()
    }
  }
)

onMounted(() => {
  initChart()
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 380px;
  max-width: 480px;
  margin: 0 auto;
}
</style>
