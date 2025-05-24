const API_BASE_URL = 'http://localhost:3000'; // Your Rails API endpoint

export const fetchLocations = async () => {
  const response = await fetch(`${API_BASE_URL}/locations`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to fetch locations and parse error' }));
    throw new Error(errorData.error || 'Failed to fetch locations');
  }
  return response.json();
};

export const fetchLocationHistory = async (locationId, startDate, endDate) => {
  if (!locationId || !startDate || !endDate) {
    throw new Error('Location ID, start date, and end date are required.');
  }
  const response = await fetch(`${API_BASE_URL}/locations/${locationId}?start_date=${startDate}&end_date=${endDate}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to fetch location history and parse error' }));
    throw new Error(errorData.error || 'Failed to fetch location history');
  }
  return response.json();
};