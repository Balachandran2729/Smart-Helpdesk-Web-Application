
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import configService from '../services/configService';

const ConfigPage = () => {
  const [config, setConfig] = useState({
    autoCloseEnabled: true,
    confidenceThreshold: 0.78,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedConfig = await configService.getConfig();
        if (fetchedConfig && typeof fetchedConfig === 'object') {
          setConfig({
            autoCloseEnabled: fetchedConfig.autoCloseEnabled ?? true,
            confidenceThreshold: fetchedConfig.confidenceThreshold ?? 0.78,
          });
        } else {
          throw new Error('Invalid configuration data received.');
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'An error occurred while fetching configuration.';
        setError(errorMsg);
        toast.error(`Failed to load config: ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prevConfig => ({
      ...prevConfig,
      [name]: type === 'checkbox' ? checked : (name === 'confidenceThreshold' ? parseFloat(value) : value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (config.confidenceThreshold < 0 || config.confidenceThreshold > 1) {
         toast.warn('Confidence threshold must be between 0 and 1.');
         setSaving(false);
         return;
      }

      const updatedConfig = await configService.updateConfig(config);
      setConfig(updatedConfig); 
      toast.success('Configuration updated successfully!');
    } catch (err) {
      console.error('ConfigPage: Update config error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'An error occurred while updating configuration.';
      setError(errorMsg);
      toast.error(`Failed to update config: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading configuration...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div>
      <h1>System Configuration</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="autoCloseEnabled" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="autoCloseEnabled"
                name="autoCloseEnabled"
                checked={config.autoCloseEnabled}
                onChange={handleChange}
              />
              Enable Auto-Close
            </label>
            <p className="form-text">If enabled, tickets with high confidence scores will be automatically resolved.</p>
          </div>

          <div className="form-group">
            <label htmlFor="confidenceThreshold" className="form-label">
              Confidence Threshold: {config.confidenceThreshold.toFixed(2)}
            </label>
            <input
              type="range"
              id="confidenceThreshold"
              name="confidenceThreshold"
              min="0"
              max="1"
              step="0.01"
              value={config.confidenceThreshold}
              onChange={handleChange}
              className="form-range" 
              style={{ width: '100%' }}
            />
            <p className="form-text">Minimum confidence score required for auto-closing tickets.</p>
          </div>

          {error && <div className="error" style={{ marginBottom: '1rem' }}>{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConfigPage;