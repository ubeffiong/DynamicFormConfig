'use client';

import React, { useState, useEffect } from 'react';
import { FormConfig, FormFieldConfig, FieldGroupConfig, FieldVisibility, SystemFunctionActivation } from '@/lib/form-config/types';
import { useFormConfig } from '@/lib/form-config/hooks';

interface FormConfigEditorProps {
  formKey?: string;
  onSave?: (config: FormConfig) => void;
  onCancel?: () => void;
}

export function FormConfigEditor({ formKey, onSave, onCancel }: FormConfigEditorProps) {
  const { getConfigWithSchema, saveConfig, loading } = useFormConfig();
  const [config, setConfig] = useState<FormConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'fields' | 'groups' | 'activations'>('fields');

  useEffect(() => {
    async function load() {
      if (formKey) {
        const cfg = await getConfigWithSchema(formKey);
        if (cfg) {
          setConfig({ ...cfg, fields: [...cfg.fields], groups: [...cfg.groups], systemActivations: [...cfg.systemActivations] });
        }
      } else {
        setConfig({
          id: `form-${Date.now()}`,
          formName: 'New Form',
          formKey: `form_${Date.now()}`,
          version: 1,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          fields: [],
          groups: [],
          systemActivations: [],
        });
      }
    }
    load();
  }, [formKey, getConfigWithSchema]);

  const handleSave = async () => {
    if (config) {
      await saveConfig(config);
      onSave?.(config);
    }
  };

  const updateField = (fieldId: string, updates: Partial<FormFieldConfig>) => {
    if (!config) return;
    setConfig({
      ...config,
      fields: config.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f),
    });
  };

  const updateGroup = (groupId: string, updates: Partial<FieldGroupConfig>) => {
    if (!config) return;
    setConfig({
      ...config,
      groups: config.groups.map(g => g.id === groupId ? { ...g, ...updates } : g),
    });
  };

  const addField = () => {
    if (!config) return;
    const newField: FormFieldConfig = {
      id: `field-${Date.now()}`,
      name: `field_${config.fields.length + 1}`,
      label: `Field ${config.fields.length + 1}`,
      type: 'text',
      visibility: 'visible',
      order: config.fields.length + 1,
    };
    setConfig({ ...config, fields: [...config.fields, newField] });
  };

  const addGroup = () => {
    if (!config) return;
    const newGroup: FieldGroupConfig = {
      id: `group-${Date.now()}`,
      name: `group_${config.groups.length + 1}`,
      label: `Group ${config.groups.length + 1}`,
      visibility: 'visible',
      order: config.groups.length + 1,
    };
    setConfig({ ...config, groups: [...config.groups, newGroup] });
  };

  const removeField = (fieldId: string) => {
    if (!config) return;
    setConfig({ 
      ...config, 
      fields: config.fields.map(f => f.id === fieldId ? { ...f, isRemoved: !f.isRemoved } : f) 
    });
  };

  const removeGroup = (groupId: string) => {
    if (!config) return;
    setConfig({ 
      ...config, 
      groups: config.groups.map(g => g.id === groupId ? { ...g, isRemoved: !g.isRemoved } : g) 
    });
  };

  const addActivation = () => {
    if (!config) return;
    const newActivation: SystemFunctionActivation = {
      functionName: '',
      description: '',
      conditions: [],
      effects: [],
      fieldMetadata: [],
      groupMetadata: [],
    };
    setConfig({ ...config, systemActivations: [...config.systemActivations, newActivation] });
  };

  const updateActivation = (index: number, updates: Partial<SystemFunctionActivation>) => {
    if (!config) return;
    const updated = [...config.systemActivations];
    updated[index] = { ...updated[index], ...updates };
    setConfig({ ...config, systemActivations: updated });
  };

  const removeActivation = (index: number) => {
    if (!config) return;
    setConfig({ ...config, systemActivations: config.systemActivations.filter((_, i) => i !== index) });
  };

  if (loading || !config) {
    return <div className="p-4">Loading configuration...</div>;
  }

  return (
    <div className="form-config-editor">
      <div className="editor-header mb-4">
        <h2 className="text-xl font-bold">{formKey ? 'Edit Form Configuration' : 'Create New Form'}</h2>
        <div className="form-info mt-4 p-3 bg-gray-50 rounded">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Form Name</label>
              <input
                type="text"
                value={config.formName}
                onChange={(e) => setConfig({ ...config, formName: e.target.value })}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Form Key</label>
              <input
                type="text"
                value={config.formKey}
                onChange={(e) => setConfig({ ...config, formKey: e.target.value })}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium">Description</label>
            <input
              type="text"
              value={config.description || ''}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
        </div>
      </div>

      <div className="tabs mb-4 flex border-b">
        <button
          className={`px-4 py-2 ${activeTab === 'fields' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
          onClick={() => setActiveTab('fields')}
        >
          Fields ({config.fields.filter(f => !f.isRemoved).length}/{config.fields.length})
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'groups' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          Groups ({config.groups.filter(g => !g.isRemoved).length}/{config.groups.length})
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'activations' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
          onClick={() => setActiveTab('activations')}
        >
          System Activations ({config.systemActivations.length})
        </button>
      </div>

      {activeTab === 'fields' && (
        <div className="fields-section">
          <button onClick={addField} className="mb-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            + Add Field
          </button>
          <div className="space-y-3">
            {config.fields.map((field) => (
              <div key={field.id} className={`field-card p-3 border rounded bg-white ${field.isRemoved ? 'opacity-60 bg-red-50 border-red-200' : ''}`}>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium">Name</label>
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateField(field.id, { name: e.target.value })}
                      className="w-full border rounded px-2 py-1 text-sm"
                      disabled={field.isRemoved}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium">Label</label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      className="w-full border rounded px-2 py-1 text-sm"
                      disabled={field.isRemoved}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium">Type</label>
                    <select
                      value={field.type}
                      onChange={(e) => updateField(field.id, { type: e.target.value as FormFieldConfig['type'] })}
                      className="w-full border rounded px-2 py-1 text-sm"
                      disabled={field.isRemoved}
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="email">Email</option>
                      <option value="tel">Phone</option>
                      <option value="date">Date</option>
                      <option value="datetime">DateTime</option>
                      <option value="select">Select</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="textarea">Textarea</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium">Visibility</label>
                    <select
                      value={field.visibility}
                      onChange={(e) => updateField(field.id, { visibility: e.target.value as FieldVisibility })}
                      className="w-full border rounded px-2 py-1 text-sm"
                      disabled={field.isRemoved}
                    >
                      <option value="visible">Visible</option>
                      <option value="hidden">Hidden</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 mt-2">
                  <div>
                    <label className="block text-xs font-medium">Group</label>
                    <select
                      value={field.groupId || ''}
                      onChange={(e) => updateField(field.id, { groupId: e.target.value || undefined })}
                      className="w-full border rounded px-2 py-1 text-sm"
                      disabled={field.isRemoved}
                    >
                      <option value="">No Group</option>
                      {config.groups.map(g => (
                        <option key={g.id} value={g.id}>{g.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium">Order</label>
                    <input
                      type="number"
                      value={field.order}
                      onChange={(e) => updateField(field.id, { order: parseInt(e.target.value) || 0 })}
                      className="w-full border rounded px-2 py-1 text-sm"
                      disabled={field.isRemoved}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium">Required</label>
                    <input
                      type="checkbox"
                      checked={field.validation?.required || false}
                      onChange={(e) => updateField(field.id, { 
                        validation: { ...field.validation, required: e.target.checked }
                      })}
                      className="mt-1"
                      disabled={field.isRemoved}
                    />
                  </div>
                  <div className="flex items-end">
                    {field.isRemoved ? (
                      <button
                        onClick={() => removeField(field.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        onClick={() => removeField(field.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                {field.isRemoved && (
                  <div className="mt-2 text-xs text-red-600 font-medium">
                    This field has been removed and will not appear in the form. Click Restore to add it back.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'groups' && (
        <div className="groups-section">
          <button onClick={addGroup} className="mb-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            + Add Group
          </button>
          <div className="space-y-3">
            {config.groups.map((group) => (
              <div key={group.id} className={`group-card p-3 border rounded bg-white ${group.isRemoved ? 'opacity-60 bg-red-50 border-red-200' : ''}`}>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium">Name</label>
                    <input
                      type="text"
                      value={group.name}
                      onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                      className="w-full border rounded px-2 py-1 text-sm"
                      disabled={group.isRemoved}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium">Label</label>
                    <input
                      type="text"
                      value={group.label}
                      onChange={(e) => updateGroup(group.id, { label: e.target.value })}
                      className="w-full border rounded px-2 py-1 text-sm"
                      disabled={group.isRemoved}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium">Visibility</label>
                    <select
                      value={group.visibility}
                      onChange={(e) => updateGroup(group.id, { visibility: e.target.value as FieldVisibility })}
                      className="w-full border rounded px-2 py-1 text-sm"
                      disabled={group.isRemoved}
                    >
                      <option value="visible">Visible</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium">Order</label>
                    <input
                      type="number"
                      value={group.order}
                      onChange={(e) => updateGroup(group.id, { order: parseInt(e.target.value) || 0 })}
                      className="w-full border rounded px-2 py-1 text-sm"
                      disabled={group.isRemoved}
                    />
                  </div>
                </div>
                <div className="mt-2 flex justify-end">
                  {group.isRemoved ? (
                    <button
                      onClick={() => removeGroup(group.id)}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      onClick={() => removeGroup(group.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {group.isRemoved && (
                  <div className="mt-2 text-xs text-red-600 font-medium">
                    This group has been removed and will not appear in the form. Click Restore to add it back.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'activations' && (
        <div className="activations-section">
          <button onClick={addActivation} className="mb-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            + Add System Activation
          </button>
          <div className="space-y-4">
            {config.systemActivations.map((activation, index) => (
              <div key={index} className="activation-card p-3 border rounded bg-white">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-medium">Function Name</label>
                    <input
                      type="text"
                      value={activation.functionName}
                      onChange={(e) => updateActivation(index, { functionName: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      placeholder="e.g., insurance_enabled"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Description</label>
                    <input
                      type="text"
                      value={activation.description || ''}
                      onChange={(e) => updateActivation(index, { description: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      placeholder="e.g., Controls insurance-related fields"
                    />
                  </div>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Controlled Fields</label>
                    <button
                      onClick={() => {
                        const availableFields = config.fields
                          .filter(f => !activation.fieldMetadata?.some(m => m.fieldId === f.id))
                          .map(f => ({ fieldId: f.id, isEnabled: true }));
                        updateActivation(index, { 
                          fieldMetadata: [...(activation.fieldMetadata || []), ...availableFields] 
                        });
                      }}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Add All Fields
                    </button>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    Manage which fields this function can enable/disable when activated
                  </div>
                  <div className="space-y-2">
                    {activation.fieldMetadata?.map((meta, metaIndex) => {
                      const field = config.fields.find(f => f.id === meta.fieldId);
                      return field ? (
                        <div key={meta.fieldId} className="flex items-center gap-2 bg-white p-2 rounded border">
                          <span className="text-sm flex-1">{field.label} ({field.name})</span>
                          <select
                            value={meta.isEnabled ? 'enabled' : 'disabled'}
                            onChange={(e) => {
                              const newMetadata = [...(activation.fieldMetadata || [])];
                              newMetadata[metaIndex] = { ...meta, isEnabled: e.target.value === 'enabled' };
                              updateActivation(index, { fieldMetadata: newMetadata });
                            }}
                            className="border rounded px-2 py-1 text-sm"
                          >
                            <option value="enabled">Enabled</option>
                            <option value="disabled">Disabled</option>
                          </select>
                          <button
                            onClick={() => {
                              const newMetadata = (activation.fieldMetadata || []).filter((_, i) => i !== metaIndex);
                              updateActivation(index, { fieldMetadata: newMetadata });
                            }}
                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ) : null;
                    })}
                    {(!activation.fieldMetadata || activation.fieldMetadata.length === 0) && (
                      <div className="text-xs text-gray-500 italic">No fields configured. Click &quot;Add All Fields&quot; or add individual fields below.</div>
                    )}
                  </div>
                  <div className="mt-2">
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          const newMetadata = [...(activation.fieldMetadata || []), { fieldId: e.target.value, isEnabled: true }];
                          updateActivation(index, { fieldMetadata: newMetadata });
                        }
                      }}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="">+ Add Field...</option>
                      {config.fields
                        .filter(f => !activation.fieldMetadata?.some(m => m.fieldId === f.id))
                        .map(f => (
                          <option key={f.id} value={f.id}>{f.label}</option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Controlled Groups</label>
                    <button
                      onClick={() => {
                        const availableGroups = config.groups
                          .filter(g => !activation.groupMetadata?.some(m => m.groupId === g.id))
                          .map(g => ({ groupId: g.id, isEnabled: true }));
                        updateActivation(index, { 
                          groupMetadata: [...(activation.groupMetadata || []), ...availableGroups] 
                        });
                      }}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Add All Groups
                    </button>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    Manage which field groups this function can enable/disable when activated
                  </div>
                  <div className="space-y-2">
                    {activation.groupMetadata?.map((meta, metaIndex) => {
                      const group = config.groups.find(g => g.id === meta.groupId);
                      return group ? (
                        <div key={meta.groupId} className="flex items-center gap-2 bg-white p-2 rounded border">
                          <span className="text-sm flex-1">{group.label} ({group.name})</span>
                          <select
                            value={meta.isEnabled ? 'enabled' : 'disabled'}
                            onChange={(e) => {
                              const newMetadata = [...(activation.groupMetadata || [])];
                              newMetadata[metaIndex] = { ...meta, isEnabled: e.target.value === 'enabled' };
                              updateActivation(index, { groupMetadata: newMetadata });
                            }}
                            className="border rounded px-2 py-1 text-sm"
                          >
                            <option value="enabled">Enabled</option>
                            <option value="disabled">Disabled</option>
                          </select>
                          <button
                            onClick={() => {
                              const newMetadata = (activation.groupMetadata || []).filter((_, i) => i !== metaIndex);
                              updateActivation(index, { groupMetadata: newMetadata });
                            }}
                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ) : null;
                    })}
                    {(!activation.groupMetadata || activation.groupMetadata.length === 0) && (
                      <div className="text-xs text-gray-500 italic">No groups configured. Click &quot;Add All Groups&quot; or add individual groups below.</div>
                    )}
                  </div>
                  <div className="mt-2">
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          const newMetadata = [...(activation.groupMetadata || []), { groupId: e.target.value, isEnabled: true }];
                          updateActivation(index, { groupMetadata: newMetadata });
                        }
                      }}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="">+ Add Group...</option>
                      {config.groups
                        .filter(g => !activation.groupMetadata?.some(m => m.groupId === g.id))
                        .map(g => (
                          <option key={g.id} value={g.id}>{g.label}</option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-2">
                  Conditions: {activation.conditions.length} | Effects: {activation.effects.length}
                </div>
                <button
                  onClick={() => removeActivation(index)}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  Remove Activation
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="actions mt-6 flex gap-3">
        <button onClick={handleSave} className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Save Configuration
        </button>
        {onCancel && (
          <button onClick={onCancel} className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
