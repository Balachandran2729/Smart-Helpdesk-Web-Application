import api from './api';

const getConfig = async () => {
  try {
    const response = await api.get('/config');
    if (response.data && response.data.success === true) {
      if (response.data.data && typeof response.data.data === 'object') {
        return response.data.data; 
      } else {
        console.error('configService: Expected response.data.data to be an object, got:', response.data.data, 'Type:', typeof response.data.data);
        throw new Error('Invalid configuration data format received.');
      }
    } else {
      console.error('configService: API request was not successful or returned unexpected structure. Response:', response.data);
      if (response.data && response.data.success === false) {
         throw new Error(response.data.message || 'API request failed.');
      }
      throw new Error('Failed to fetch configuration.');
    }
  } catch (error) {
    console.error('configService: Error fetching config:', error);
    throw error;
  }
};
const updateConfig = async (configData) => {
  try {
    const response = await api.put('/config', configData);
    if (response.data && response.data.success === true) {
      if (response.data.data && typeof response.data.data === 'object') {
        return response.data.data;
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