import React, { useState, useEffect } from 'react';
import { fetchLocations, fetchLocationHistory } from '../services/api';
import HistoryTable from './HistoryTable';
import HistoryChart from './HistoryChart';
import LocationMap from './LocationMap'; // Import the new map component

const LocationSearch = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2025-12-31');
  const [historicalData, setHistoricalData] = useState(null);
  const [loadingLocations, setLoadingLocations] = useState(true);
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
        if (data.length > 0 && !selectedLocation) { // Set default only if not already selected
          setSelectedLocation(data[0].id.toString());
        }
      } catch (err) {
        setError(err.message);
        console.error("Failed to load locations:", err);
      } finally {
        setLoadingLocations(false);
      }
    };
    loadLocations();
  }, []); // Empty dependency array, runs once on mount

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

  const handleMapLocationSelect = (locationId) => {
    setSelectedLocation(locationId); // locationId should already be a string from map
  };

  return (
    <div>
      <h2>Location Sunrise/Sunset History</h2>
      
      {/* Map Section */}
      {loadingLocations && <p>Loading map and locations...</p>}
      {!loadingLocations && locations.length > 0 && (
        <LocationMap
          locations={locations}
          onSelectLocation={handleMapLocationSelect}
          activeLocationId={selectedLocation}
        />
      )}
      {!loadingLocations && locations.length === 0 && <p>No locations available to display on map.</p>}


      {/* Form Section */}
      <form onSubmit={handleSearch} style={{ marginTop: '20px' }}>
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

      {error && <p style={{ color: 'red', marginTop: '10px' }}>Error: {error}</p>}

      {/* Results Section */}
      {historicalData && (
        <div style={{ marginTop: '20px' }}>
          <HistoryTable data={historicalData} locationName={getLoadedLocationName()} />
          <HistoryChart data={historicalData} locationName={getLoadedLocationName()} />
        </div>
      )}
    </div>
  );
};

export default LocationSearch;