import { useEffect, useRef } from 'react'
import { getStyle } from '@coreui/utils'
import { CChart } from '@coreui/react-chartjs'
import { Chart } from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'

export const TestComponent = () => {
  const chartRef = useRef<Chart<'doughnut'> | null>(null)

  useEffect(() => {
    const handleColorSchemeChange = () => {
      const chartInstance = chartRef.current
      if (chartInstance) {
        const { options } = chartInstance

        if (options.plugins?.legend?.labels) {
          options.plugins.legend.labels.color = getStyle('--cui-body-color')
        }

        chartInstance.update()
      }
    }

    document.documentElement.addEventListener('ColorSchemeChange', handleColorSchemeChange)

    return () => {
      document.documentElement.removeEventListener('ColorSchemeChange', handleColorSchemeChange)
    }
  }, [])

  const data: ChartData<'doughnut'> = {
    labels: ['VueJs', 'EmberJs', 'ReactJs', 'AngularJs'],
    datasets: [
      {
        backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
        data: [40, 20, 80, 10],
      },
    ],
  }

  const options: ChartOptions<'doughnut'> = {
    plugins: {
      legend: {
        labels: {
          color: getStyle('--cui-body-color'),
        },
      },
    },
  }

  return (
    <div className="p-6 bg-card text-card-foreground border border-border rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Test Component - Doughnut Chart</h3>
      <CChart type="doughnut" data={data} options={options} ref={chartRef} />
    </div>
  );
};

export default TestComponent;