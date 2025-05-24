import './HistoryTable.css';

const HistoryTable = ({ data, locationName }) => {
  if (!data || data.length === 0) {
    return <p className="no-data-message">No historical data found for the selected criteria.</p>;
  }

  return (
    <div className="history-table-container">
      <table className="history-table">
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