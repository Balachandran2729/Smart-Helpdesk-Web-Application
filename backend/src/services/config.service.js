// src/services/config.service.js
const Config = require('../models/Config');
const logger = require('../utils/logger');

const getConfig = async () => {
  const config = await Config.getConfig();
  logger.debug('System config fetched');
  return config;
};

const updateConfig = async (updateData) => {
  let config = await Config.findOne();
  if (!config) {
    config = new Config();
  }
  Object.assign(config, updateData);
  await config.save();
  logger.info('System config updated');
  return config;
};

module.exports = {
  getConfig,
  updateConfig,
};