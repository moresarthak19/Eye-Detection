import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { COLORS } from '../../utils/constants';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const BlinkRateChart = ({ historicalData }) => {
  // Extract blinkRate array from historicalData object
  const dataArray = historicalData?.blinkRate || [];
  
  if (!dataArray || dataArray.length === 0) {
    return (
      <div className="h-full min-h-[300px]">
        <h3 className="text-gray-200 text-xl font-semibold mb-6">Blink Rate History</h3>
        <div className="flex items-center justify-center h-[250px] text-gray-500 text-[0.95rem]">
          Loading data...
        </div>
      </div>
    );
  }

  // Take last 20 data points for better visibility
  const recentData = dataArray.slice(-20);

  const labels = recentData.map(item => {
    const date = new Date(item.timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Blink Rate (per minute)',
        data: recentData.map(item => item.value),
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: '#4ade80',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#e5e7eb',
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#4ade80',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.parsed.y} blinks/min`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 30,
        ticks: {
          color: '#9ca3af',
          stepSize: 5
        },
        grid: {
          color: 'rgba(74, 222, 128, 0.1)',
          drawBorder: false
        },
        title: {
          display: true,
          text: 'Blinks per Minute',
          color: '#9ca3af',
          font: {
            size: 11
          }
        }
      },
      x: {
        ticks: {
          color: '#9ca3af',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8
        },
        grid: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <div className="h-full min-h-[300px]">
      <h3 className="text-gray-200 text-xl font-semibold mb-6">👁️ Blink Rate History</h3>
      <div className="h-[250px]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default BlinkRateChart;
