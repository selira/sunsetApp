import React from 'react';

const HistoryTable = ({ data, locationName }) => {
  if (!data || data.length === 0) {
    return <p>No historical data found for the selected criteria.</p>;
  }

  return (
    <div>
      <h3>Historical Data for {locationName}</h3>
      <h4> All times in city local time as provided by <a href='https://sunrisesunset.io' target='_blank'>sunrisesunset.io</a></h4>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Sunrise</th>
            <th>Sunset</th>
            <th>Golden Hour</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry, index) => (
            <tr key={entry.date || index}>
              <td>{entry.date}</td>
              <td>{entry.sunrise || 'N/A'}</td>
              <td>{entry.sunset || 'N/A'}</td>
              <td>{entry.golden_hour || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryTable;