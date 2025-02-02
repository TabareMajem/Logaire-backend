import { Chart } from 'chart.js';
import { useEffect, useRef } from 'react';

interface LineChartProps {
  data: any[];
  xAxis: string;
  yAxis: string;
  title: string;
}

export function LineChart({ data, xAxis, yAxis, title }: LineChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d[xAxis]),
        datasets: [{
          label: title,
          data: data.map(d => d[yAxis]),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: title
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, xAxis, yAxis, title]);

  return (
    <canvas ref={chartRef} />
  );
} 