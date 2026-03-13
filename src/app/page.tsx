'use client';

import React, { useState } from 'react';
import { FormConfigProvider, useFormConfig } from '@/lib/form-config/hooks';
import { FormConfigEditor } from '@/components/admin/FormConfigEditor';
import { 
  PatientRegistrationForm, 
  GeneralConsultationForm, 
  AdmissionForm, 
  VitalsForm, 
  SettingsForm,
  allFormSchemas,
  formOptions
} from '@/components/forms/form-definitions';

function SchemaRegistration() {
  const { registerSchema } = useFormConfig();
  
  React.useEffect(() => {
    allFormSchemas.forEach(schema => {
      registerSchema(schema);
    });
  }, [registerSchema]);

  return null;
}

function AdminPanel() {
  const { configs, activateConfig, loading, customConfigs, activeCustomConfigId, saveCustomConfig, deleteCustomConfig, loadCustomConfig } = useFormConfig();
  const [editingForm, setEditingForm] = useState<string | null>(null);
  const [showActivationPanel, setShowActivationPanel] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [activeFunctions, setActiveFunctions] = useState<string[]>([]);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [saveFacilityType, setSaveFacilityType] = useState<string>('Default');
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  const handleActivate = async (formKey: string, active: boolean) => {
    await activateConfig(formKey, active);
  };

  const handleSaveCustomConfig = async () => {
    if (!saveName) return;
    await saveCustomConfig(saveName, saveDescription || undefined, saveFacilityType as any, configs.formConfigs, saveAsDefault);
    setShowSaveModal(false);
    setSaveName('');
    setSaveDescription('');
    setSaveFacilityType('Default');
    setSaveAsDefault(false);
  };

  const handleLoadConfig = async (configId: string) => {
    await loadCustomConfig(configId);
  };

  const facilityTypes = ['Default', 'PHC', 'General Hospital', 'FMC', 'FTH', 'Private Clinic'];

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="admin-panel">
      <div className="header mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Form Configuration Admin</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSaveModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save as Custom Config
          </button>
          <button
            onClick={() => setShowActivationPanel(!showActivationPanel)}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            {showActivationPanel ? 'Hide' : 'Show'} System Functions
          </button>
        </div>
      </div>

      <div className="custom-configs-panel mb-6 p-4 border rounded bg-blue-50">
        <h2 className="text-lg font-semibold mb-3">Custom Configurations</h2>
        <p className="text-sm text-gray-600 mb-3">
          Load a pre-configured set of forms for your facility type
        </p>
        <div className="flex flex-wrap gap-3">
          {customConfigs.map(config => (
            <div key={config.metadata.id} className={`flex items-center gap-2 px-4 py-3 bg-white border rounded ${activeCustomConfigId === config.metadata.id ? 'border-blue-500 ring-2 ring-blue-200' : ''}`}>
              <div className="flex-1">
                <div className="font-medium">{config.metadata.name}</div>
                <div className="text-xs text-gray-500">{config.metadata.facilityType} - {config.formConfigs.length} forms</div>
                {config.metadata.isDefault && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">Default</span>
                )}
              </div>
              <button
                onClick={() => handleLoadConfig(config.metadata.id)}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Load
              </button>
              <button
                onClick={() => deleteCustomConfig(config.metadata.id)}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))}
          {customConfigs.length === 0 && (
            <p className="text-gray-500 italic">No custom configurations saved yet.</p>
          )}
        </div>
        {activeCustomConfigId && (
          <div className="mt-3 text-sm text-green-600 font-medium">
            Currently loaded: {customConfigs.find(c => c.metadata.id === activeCustomConfigId)?.metadata.name}
          </div>
        )}
      </div>

      {showActivationPanel && (
        <div className="activation-panel mb-6 p-4 border rounded bg-purple-50">
          <h2 className="text-lg font-semibold mb-3">System Function Activations</h2>
          <p className="text-sm text-gray-600 mb-3">
            Enable functions to trigger field visibility/requirement rules
          </p>
          <div className="flex flex-wrap gap-2">
            {['insurance_enabled', 'icu_mode', 'pediatric_mode', 'emergency_mode'].map(fn => (
              <label key={fn} className="flex items-center gap-2 px-3 py-2 bg-white border rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeFunctions.includes(fn)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setActiveFunctions([...activeFunctions, fn]);
                    } else {
                      setActiveFunctions(activeFunctions.filter(f => f !== fn));
                    }
                  }}
                />
                <span className="text-sm">{fn}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="configs-grid">
        <h2 className="text-lg font-semibold mb-3">Available Forms</h2>
        <div className="grid gap-4">
          {configs.summaries.map(summary => (
            <div key={summary.id} className="config-card p-4 border rounded bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{summary.formName}</h3>
                  <p className="text-sm text-gray-500">Key: {summary.formKey}</p>
                  {summary.description && (
                    <p className="text-sm text-gray-400">{summary.description}</p>
                  )}
                  <div className="mt-2 text-xs text-gray-400">
                    Fields: {summary.fieldCount} | Groups: {summary.groupCount}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={summary.isActive}
                      onChange={(e) => handleActivate(summary.formKey, e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                  <button
                    onClick={() => setEditingForm(summary.formKey)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Configure
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setEditingForm('__new__')}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          + Create New Form
        </button>
      </div>

      {editingForm && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="modal-content bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <FormConfigEditor
              formKey={editingForm === '__new__' ? undefined : editingForm}
              onSave={() => setEditingForm(null)}
              onCancel={() => setEditingForm(null)}
            />
          </div>
        </div>
      )}

      {showSaveModal && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="modal-content bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Save Custom Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Configuration Name *</label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., My Hospital Config"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Optional description"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Facility Type</label>
                <select
                  value={saveFacilityType}
                  onChange={(e) => setSaveFacilityType(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  {facilityTypes.map(ft => (
                    <option key={ft} value={ft}>{ft}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={saveAsDefault}
                    onChange={(e) => setSaveAsDefault(e.target.checked)}
                  />
                  <span className="text-sm">Set as default configuration</span>
                </label>
              </div>
              <div className="text-sm text-gray-500">
                This will save {configs.formConfigs.length} form configurations that can be loaded later.
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSaveCustomConfig}
                disabled={!saveName}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Save Configuration
              </button>
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormDemo() {
  const [activeForm, setActiveForm] = useState<string>('patient_registration');
  const [submittedData, setSubmittedData] = useState<Record<string, unknown> | null>(null);

  const renderForm = () => {
    switch (activeForm) {
      case 'patient_registration':
        return <PatientRegistrationForm onSubmit={setSubmittedData} />;
      case 'general_consultation':
        return <GeneralConsultationForm onSubmit={setSubmittedData} />;
      case 'admission':
        return <AdmissionForm onSubmit={setSubmittedData} />;
      case 'vitals':
        return <VitalsForm onSubmit={setSubmittedData} />;
      case 'settings':
        return <SettingsForm onSubmit={setSubmittedData} />;
      default:
        return <PatientRegistrationForm onSubmit={setSubmittedData} />;
    }
  };

  return (
    <div className="form-demo">
      <h2 className="text-xl font-bold mb-4">Form Preview</h2>
      
      <div className="form-tabs flex gap-2 mb-4 border-b pb-2">
        {formOptions.map(form => (
          <button
            key={form.key}
            onClick={() => setActiveForm(form.key)}
            className={`px-4 py-2 rounded ${activeForm === form.key ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {form.label}
          </button>
        ))}
      </div>

      <div className="form-container p-4 border rounded bg-white">
        {renderForm()}
      </div>

      {submittedData && (
        <div className="submitted-data mt-4 p-4 bg-green-50 border rounded">
          <h3 className="font-semibold mb-2">Submitted Data:</h3>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(submittedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function FormConfigDemo() {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <FormConfigProvider>
      <SchemaRegistration />
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Dynamic Form Configuration System</h1>
            <button
              onClick={() => setShowAdmin(!showAdmin)}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
            >
              {showAdmin ? 'Show Forms' : 'Admin Panel'}
            </button>
          </div>

          {showAdmin ? (
            <AdminPanel />
          ) : (
            <FormDemo />
          )}
        </div>
      </div>
    </FormConfigProvider>
  );
}
