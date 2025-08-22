// src/services/configService.js
import api from './api';

const getConfig = async () => {
  try {
    const response = await api.get('/config');
    console.log('configService: Raw API response for getConfig:', response); // Log full response
    console.log('configService: Fetched config data:', response.data); // Log data part

    // --- Correctly handle the actual backend response structure ---
    // Expected structure: { success: true,  { _id, autoCloseEnabled, confidenceThreshold, ... } }
    // So, the config object is in response.data.data
    if (response.data && response.data.success === true) {
      // --- Access the config object from the 'data' property ---
      if (response.data.data && typeof response.data.data === 'object') {
        console.log("configService: Successfully fetched config from response.data.data.");
        return response.data.data; // Return the config object directly
      } else {
        console.error('configService: Expected response.data.data to be an object, got:', response.data.data, 'Type:', typeof response.data.data);
        throw new Error('Invalid configuration data format received.');
      }
    } else {
      // Handle case where response.data.success is false or structure is different
      console.error('configService: API request was not successful or returned unexpected structure. Response:', response.data);
      // If it's an explicit failure from backend
      if (response.data && response.data.success === false) {
         throw new Error(response.data.message || 'API request failed.');
      }
      // For other unexpected structures, throw a generic error
      throw new Error('Failed to fetch configuration.');
    }
  } catch (error) {
    // This catches network errors, timeouts, Axios errors, or errors thrown above
    console.error('configService: Error fetching config:', error);
    // Re-throw to let ConfigPage handle it
    throw error;
  }
};

// ... (rest of the service functions: updateConfig - apply similar logic if needed) ...

// Example update for updateConfig if it also uses response.data.data
const updateConfig = async (configData) => {
  try {
    const response = await api.put('/config', configData);
    console.log('configService: Raw API response for updateConfig:', response);
    console.log('configService: Updated config data:', response.data);

    // Assuming backend returns { success: true,  { _id, autoCloseEnabled, confidenceThreshold, ... } }
    if (response.data && response.data.success === true) {
      if (response.data.data && typeof response.data.data === 'object') {
        console.log("configService: Successfully updated config from response.data.data.");
        return response.data.data; // Return the updated config object
      } else {
        console.error('configService: Expected response.data.data to be an object for updated config, got:', response.data.data);
        throw new Error(response.data?.message || 'Invalid updated configuration data format received.');
      }
    }
    throw new Error(response.data?.message || 'Failed to update configuration.');
  } catch (error) {
    console.error('configService: Error updating config:', error);
    throw error;
  }
};

const configService = {
  getConfig,
  updateConfig,
};

export default configService;