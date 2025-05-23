import React, { useState, useEffect } from 'react';
import { fetchLocations, fetchLocationHistory } from '../services/api';
import HistoryTable from './HistoryTable';
import HistoryChart from './HistoryChart';

const LocationSearch = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [historicalData, setHistoricalData] = useState(null);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadedLocationId, setLoadedLocationId] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLocations = async () => {
      setLoadingLocations(true);
      setError(null);
      try {
        const data = await fetchLocations();
        setLocations(data);
        if (data.length > 0) {
          setSelectedLocation(data[0].id);
        }
      } catch (err) {
        setError(err.message);
        console.error("Failed to load locations:", err);
      } finally {
        setLoadingLocations(false);
      }
    };
    loadLocations();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!selectedLocation || !startDate || !endDate) {
      setError("Please select a location and both start and end dates.");
      return;
    }
    setLoadingHistory(true);
    setError(null);
    setHistoricalData(null);
    try {
      const data = await fetchLocationHistory(selectedLocation, startDate, endDate);
      setHistoricalData(data);
      setLoadedLocationId(selectedLocation);
    } catch (err) {
      setError(err.message);
      console.error("Failed to load historical data:", err);
    } finally {
      setLoadingHistory(false);
    }
  };
  
  const getLoadedLocationName = () => {
    if (!loadedLocationId || locations.length === 0) return '';
    const foundLocation = locations.find(loc => loc.id.toString() === loadedLocationId);
    return foundLocation ? foundLocation.name : '';
  };

  return (
    <div>
      <h2>Location Sunrise/Sunset History</h2>

      {loadingLocations && <p>Loading locations...</p>}
      
      <form onSubmit={handleSearch}>
        <div>
          <label htmlFor="location-select">Choose a location:</label>
          <select 
            id="location-select" 
            value={selectedLocation} 
            onChange={(e) => setSelectedLocation(e.target.value)}
            disabled={loadingLocations || locations.length === 0}
          >
            {locations.length === 0 && !loadingLocations && <option value="">No locations available</option>}
            {locations.map((location) => (
              <option key={location.id} value={location.id.toString()}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="start-date">Start Date:</label>
          <input 
            type="date" 
            id="start-date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            required 
          />
        </div>

        <div>
          <label htmlFor="end-date">End Date:</label>
          <input 
            type="date" 
            id="end-date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            required 
          />
        </div>

        <button type="submit" disabled={loadingHistory || !selectedLocation}>
          {loadingHistory ? 'Searching...' : 'Search History'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {historicalData && (
        <div>
          <HistoryTable data={historicalData} locationName={getLoadedLocationName()} />
          <HistoryChart data={historicalData} locationName={getLoadedLocationName()} />
        </div>
      )}
    </div>
  );
};

export default LocationSearch;