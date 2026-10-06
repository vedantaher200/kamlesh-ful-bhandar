import React, { useEffect, useState } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    business_name: 'Kamlesh Ful Bhandar',
    phone_primary: '9921972936',
    phone_secondary: '8208672409',
    whatsapp_number: '919921972936',
    address: 'Ganpati Mandir Jawal, Pawan Nagar, Nashik, Maharashtra',
    hours: 'Monday – Sunday: 6:00 AM – 10:00 PM'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.getSettings();
        if (res.success && res.settings) {
          setSettings((prev) => ({ ...prev, ...res.settings }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg('');
    try {
      await api.updateSettings(settings);
      setSavedMsg('Business settings updated successfully in PostgreSQL database!');
      setTimeout(() => setSavedMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Business Settings & Configuration</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Centralized business contact numbers, operating hours, and shop address in Nashik
          </p>
        </div>
      </div>

      {savedMsg && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <CheckCircle2 size={18} />
          <span>{savedMsg}</span>
        </div>
      )}

      <div style={{ background: '#ffffff', padding: '2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', maxWidth: '750px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                Business Name
              </label>
              <input
                type="text"
                className="form-control"
                value={settings.business_name}
                onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                Primary Phone Number
              </label>
              <input
                type="text"
                className="form-control"
                value={settings.phone_primary}
                onChange={(e) => setSettings({ ...settings, phone_primary: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                Secondary Phone Number
              </label>
              <input
                type="text"
                className="form-control"
                value={settings.phone_secondary}
                onChange={(e) => setSettings({ ...settings, phone_secondary: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                WhatsApp Direct Number (with Country Code)
              </label>
              <input
                type="text"
                className="form-control"
                value={settings.whatsapp_number}
                onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                Operating Hours
              </label>
              <input
                type="text"
                className="form-control"
                value={settings.hours}
                onChange={(e) => setSettings({ ...settings, hours: e.target.value })}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                Shop Physical Address
              </label>
              <textarea
                rows={2}
                className="form-control"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary">
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
