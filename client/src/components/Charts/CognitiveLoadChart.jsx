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
  Legend,
  Filler
} from 'chart.js';
import { COLORS, COGNITIVE_LOAD_LEVELS } from '../../utils/constants';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CognitiveLoadChart = ({ historicalData }) => {
  // Extract cognitiveLoad array from historicalData object
  const dataArray = historicalData?.cognitiveLoad || [];
  
  if (!dataArray || dataArray.length === 0) {
    return (
      <div className="h-full min-h-[300px]">
        <h3 className="text-gray-200 text-xl font-semibold mb-6">📊 Cognitive Load Trend (Last 5 Minutes)</h3>
        <div className="flex items-center justify-center h-[250px] text-gray-500 text-[0.95rem]">
          Loading data... ({dataArray?.length || 0} data points)
        </div>
      </div>
    );
  }

  // Format timestamps for labels
  const labels = dataArray.map(item => {
    const date = new Date(item.timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Cognitive Load',
        data: dataArray.map(item => item.cognitiveLoad), // This is cognitive_load_value (0-100)
        borderColor: COLORS.PRIMARY,
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: COLORS.PRIMARY,
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
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: COLORS.PRIMARY,
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            let loadLevel = 'Low';
            if (value >= 70) loadLevel = 'High';
            else if (value >= 40) loadLevel = 'Medium';
            return `Load: ${loadLevel} (${value.toFixed(0)}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          color: '#9ca3af',
          callback: function(value) {
            return value + '%';
          }
        },
        grid: {
          color: 'rgba(0, 212, 255, 0.1)',
          drawBorder: false
        }
      },
      x: {
        ticks: {
          color: '#9ca3af',
          maxRotation: 45,
          minRotation: 45
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
      <h3 className="text-gray-200 text-xl font-semibold mb-6">📊 Cognitive Load Trend (Last 5 Minutes)</h3>
      <div className="h-[250px]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default CognitiveLoadChart;
