import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

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

// Updated helper function to parse time strings like "6:19:06 AM" or ISO strings
const parseTimeToHours = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return null;

  // parse as "H:MM:SS AM/PM"
  const amPmMatch = timeString.match(/(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)/i);
  if (amPmMatch) {
    let hours = parseInt(amPmMatch[1], 10);
    const minutes = parseInt(amPmMatch[2], 10);
    const seconds = parseInt(amPmMatch[3], 10);
    const period = amPmMatch[4].toUpperCase();

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
        console.error("Error parsing AM/PM time string (invalid numbers):", timeString);
        return null;
    }

    if (period === 'PM' && hours < 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    // If hours is already > 12 and PM, or < 12 and AM, it's fine.

    return hours + minutes / 60 + seconds / 3600;
  }

  console.error("Error parsing time string (unrecognized format):", timeString);
  return null;
};


const HistoryChart = ({ data, locationName }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (data && data.length > 0) {
      const labels = data.map(d => d.date);

      // Use the updated parsing function
      const sunriseTimes = data.map(d => parseTimeToHours(d.sunrise));
      const goldenHourTimes = data.map(d => parseTimeToHours(d.golden_hour));
      const sunsetTimes = data.map(d => parseTimeToHours(d.sunset));

      setChartData({
        labels,
        datasets: [
          {
            label: 'Sunrise Time',
            data: sunriseTimes,
            borderColor: 'rgb(255, 206, 86)',
            backgroundColor: 'rgba(255, 206, 86, 0.5)',
            fill: true,
            tension: 0.1,
          },
          {
            label: 'Golden Hour Time',
            data: goldenHourTimes,
            borderColor: 'rgb(255, 159, 64)',
            backgroundColor: 'rgba(255, 159, 64, 0.5)',
            fill: true,
            tension: 0.1,
          },
          {
            label: 'Sunset Time',
            data: sunsetTimes,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            fill: true,
            tension: 0.1,
          }
        ]
      });
    } else {
      setChartData(null);
    }
  }, [data]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Daily Light Phases for ${locationName || ''}`
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              const totalHours = context.parsed.y;
              const h = Math.floor(totalHours);
              const m = Math.floor((totalHours - h) * 60);
              label += `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        stacked: false,
        title: {
          display: true,
          // Consider changing if times are local due to AM/PM format
          text: 'Time of Day (Hours from Midnight)'
        },
        min: 0,
        ticks: {
          stepSize: 2,
          callback: function(value) {
            return value + ':00';
          }
        }
      }
    }
  };

  if (!chartData) {
    return null;
  }

  return (
    <div style={{ marginBottom: '50px', height: '400px', width: '100%' }}>
      <h3>Historical Data for {locationName}</h3>
      <h4>All times are in local city time, as provided by <a href='https://sunrisesunset.io' target='_blank'>sunrisesunset.io</a></h4>
      <Line options={chartOptions} data={chartData} />
    </div>
  );
};

export default HistoryChart;