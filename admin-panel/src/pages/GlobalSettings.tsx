import { useEffect, useState } from 'react';
import { Save, Loader2, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { globalSettingsApi } from '../lib/api';
import type { GlobalSettingsConfig } from '../lib/types';

export default function GlobalSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [config, setConfig] = useState<GlobalSettingsConfig | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await globalSettingsApi.getConfig();
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    
    setSaving(true);
    setError(null);
    try {
      await globalSettingsApi.saveConfig(config);
      setSuccess('Saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
      // Force reload to update sidebar
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Global Settings</h2>
          <p className="text-gray-500 mt-1">Configure app identity and AI prompt behavior</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Save Changes</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* App Identity Section */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">App Identity</h3>
          <p className="text-sm text-gray-500">Configure the name and logo displayed in the admin panel</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">App Name</label>
            <input
              type="text"
              value={config?.appName || ''}
              onChange={(e) => setConfig(config ? { ...config, appName: e.target.value } : null)}
              placeholder="e.g. FirstShot Admin"
              className="w-full border rounded-lg px-4 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">App Logo (SVG Code)</label>
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center overflow-hidden border border-gray-300 flex-shrink-0">
                {config?.appLogoSvg ? (
                  <div 
                    className="w-10 h-10 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-white"
                    dangerouslySetInnerHTML={{ __html: config.appLogoSvg }}
                  />
                ) : config?.appLogoUrl ? (
                  <img src={config.appLogoUrl} className="w-10 h-10 object-contain" alt="App Logo" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={config?.appLogoSvg || ''}
                  onChange={(e) => setConfig(config ? { ...config, appLogoSvg: e.target.value } : null)}
                  placeholder="Paste your SVG code here (e.g., <svg>...</svg>)"
                  rows={4}
                  className="w-full border rounded-lg px-4 py-2 text-sm font-mono"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Paste the raw SVG code for your logo. It will be displayed as white on dark backgrounds.
            </p>
          </div>
        </div>
      </div>

      {/* Style Prompt Section */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Image Style Prompt</h3>
          <p className="text-sm text-gray-500">This text will be appended to AI image generation prompts</p>
        </div>
        
        <div className="p-6">
          <textarea
            value={config?.stylePrompt || ''}
            onChange={(e) => setConfig(config ? { ...config, stylePrompt: e.target.value } : null)}
            placeholder="e.g., in the style of a soft watercolor painting with muted earth tones, gentle brushstrokes, and a dreamy atmospheric quality. Do not include any text or writing in the image."
            rows={6}
            className="w-full border rounded-lg px-4 py-3 text-sm"
          />
          <p className="text-xs text-gray-400 mt-2">
            This style description will be combined with image descriptions when generating images. You can include instructions like "Do not include any text in the image" here.
          </p>
        </div>
      </div>

      {/* Master Prompt Section */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Master Prompt</h3>
          <p className="text-sm text-gray-500">Template for constructing the final prompt based on context</p>
        </div>
        
        <div className="p-6">
          <textarea
            value={config?.masterPrompt || ''}
            onChange={(e) => setConfig(config ? { ...config, masterPrompt: e.target.value } : null)}
            placeholder="Enter master prompt template using tokens..."
            rows={10}
            className="w-full border rounded-lg px-4 py-3 text-sm font-mono"
          />
          <div className="mt-3 text-xs text-gray-500">
            <p className="font-medium mb-1">Available Tokens (will be replaced with actual values):</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <code className="bg-gray-100 px-1 py-0.5 rounded">*core-recognition*</code>
              <code className="bg-gray-100 px-1 py-0.5 rounded">*protective-logic*</code>
              <code className="bg-gray-100 px-1 py-0.5 rounded">*cost-under-stress*</code>
              <code className="bg-gray-100 px-1 py-0.5 rounded">*repulsion-disavowal*</code>
              <code className="bg-gray-100 px-1 py-0.5 rounded">*primary*</code>
              <code className="bg-gray-100 px-1 py-0.5 rounded">*secondary*</code>
              <code className="bg-gray-100 px-1 py-0.5 rounded">*situation_context*</code>
              <code className="bg-gray-100 px-1 py-0.5 rounded">*affect_name*</code>
              <code className="bg-gray-100 px-1 py-0.5 rounded">*affect_description*</code>
              <code className="bg-gray-100 px-1 py-0.5 rounded">*affect_guidance*</code>
            </div>
          </div>
        </div>
      </div>

      {/* Email Templates Section */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Email Templates</h3>
          <p className="text-sm text-gray-500">Configure automated email copy</p>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Reset Password */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Reset Password Email</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Subject Line"
                className="w-full border rounded-lg px-4 py-2 text-sm"
                value={config?.resetPasswordEmail?.subject || ''}
                onChange={(e) => setConfig(config ? { ...config, resetPasswordEmail: { ...config.resetPasswordEmail || { body: '' }, subject: e.target.value } } : null)}
              />
              <textarea
                rows={4}
                placeholder="Email Body..."
                className="w-full border rounded-lg px-4 py-3 text-sm"
                value={config?.resetPasswordEmail?.body || ''}
                onChange={(e) => setConfig(config ? { ...config, resetPasswordEmail: { ...config.resetPasswordEmail || { subject: '' }, body: e.target.value } } : null)}
              />
            </div>
          </div>

          {/* App Invite */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">App Invite Email</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Subject Line"
                className="w-full border rounded-lg px-4 py-2 text-sm"
                value={config?.appInviteEmail?.subject || ''}
                onChange={(e) => setConfig(config ? { ...config, appInviteEmail: { ...config.appInviteEmail || { body: '' }, subject: e.target.value } } : null)}
              />
              <textarea
                rows={4}
                placeholder="Email Body..."
                className="w-full border rounded-lg px-4 py-3 text-sm"
                value={config?.appInviteEmail?.body || ''}
                onChange={(e) => setConfig(config ? { ...config, appInviteEmail: { ...config.appInviteEmail || { subject: '' }, body: e.target.value } } : null)}
              />
            </div>
          </div>

          <div className="mt-2 text-xs text-gray-500">
            <p className="font-medium mb-1">Available Tokens:</p>
            <div className="flex gap-2">
              <code className="bg-gray-100 px-1 py-0.5 rounded">*app_name*</code>
              <code className="bg-gray-100 px-1 py-0.5 rounded">*link*</code>
              <code className="bg-gray-100 px-1 py-0.5 rounded">*user_email*</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
