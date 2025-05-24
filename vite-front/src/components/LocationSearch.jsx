import React, { useState, useEffect } from 'react';
import { fetchLocations, fetchLocationHistory } from '../services/api';
import HistoryTable from './HistoryTable';
import HistoryChart from './HistoryChart';
import LocationMap from './LocationMap';
import './LocationSearch.css';

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
        data.push({ id: 0, name: 'Non-existing location', latitude: null, longitude: null }); // to test the 404 response.
        setLocations(data);
        if (data.length > 0 && !selectedLocation) {
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
    setSelectedLocation(locationId);
  };

  return (
    <div className="location-search-container">

      <div className="layout-container">
        {/* Left Column: Map, Inputs, Button */}
        <div className="left-column">
          <form onSubmit={handleSearch} className="form-section">
            <div>
              <label htmlFor="location-select">Choose a location:</label>
              <select 
                id="location-select" 
                value={selectedLocation} 
                onChange={(e) => setSelectedLocation(e.target.value)}
                disabled={loadingLocations || locations.length === 0}
              >
                {loadingLocations && <option value="">Loading locations...</option>}
                {!loadingLocations && locations.length === 0 && <option value="">No locations available</option>}
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

          {!loadingLocations && locations.length > 0 && (
            <LocationMap
              locations={locations}
              onSelectLocation={handleMapLocationSelect}
              activeLocationId={selectedLocation}
            />
          )}
        </div>

        {/* Right Column: Table and Chart */}
        <div className="right-column">
          {error && <p className="error-message">Error: {error}</p>}
          
          {loadingHistory && <p>Loading history data...</p>}

          {!loadingHistory && historicalData && Object.keys(historicalData).length > 0 && (
            
            <>
              <HistoryChart data={historicalData} locationName={getLoadedLocationName()} />
              <HistoryTable data={historicalData}/>
            </>
          )}
          {!loadingHistory && (!historicalData || Object.keys(historicalData).length === 0) && !error && !loadingLocations && (
             <p className="results-placeholder">Select a location and date range, then click "Search History" to see results.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationSearch;