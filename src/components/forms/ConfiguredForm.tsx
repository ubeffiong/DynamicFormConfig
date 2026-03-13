'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { FormFieldConfig, FieldGroupConfig, FieldVisibility, FormSchema } from '@/lib/form-config/types';
import { useFormConfig } from '@/lib/form-config/hooks';

interface ConfiguredFormProps {
  formKey: string;
  backendRequired?: string[];
  onSubmit?: (data: Record<string, unknown>) => void;
  children?: ReactNode;
  schema?: FormSchema;
}

interface FormState {
  [key: string]: unknown;
}

const visibilityLabels: Record<FieldVisibility, string> = {
  visible: 'Visible',
  hidden: 'Hidden',
  disabled: 'Disabled',
};

export function ConfiguredForm({ formKey, backendRequired = [], onSubmit, children, schema }: ConfiguredFormProps) {
  const { applyConfig, loading, error, registerSchema } = useFormConfig();
  const [fields, setFields] = useState<FormFieldConfig[]>([]);
  const [groups, setGroups] = useState<FieldGroupConfig[]>([]);
  const [formData, setFormData] = useState<FormState>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (schema) {
      registerSchema(schema);
    }
  }, [schema, registerSchema]);

  useEffect(() => {
    let mounted = true;
    async function loadConfig() {
      try {
        const result = await applyConfig(formKey, formData, backendRequired);
        if (mounted) {
          setFields(result.fields);
          setGroups(result.groups);
        }
      } catch (err) {
        if (mounted) {
          console.error('Failed to load form config:', err);
        }
      }
    }
    loadConfig();
    return () => { mounted = false; };
    // formData intentionally not in deps to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formKey, backendRequired, applyConfig]);

  const visibleFields = fields.filter(f => f.visibility === 'visible' && !f.isRemoved);
  const visibleGroups = groups.filter(g => g.visibility === 'visible' && !g.isRemoved).sort((a, b) => a.order - b.order);

  const getFieldsForGroup = (groupId: string) => {
    return visibleFields
      .filter(f => f.groupId === groupId)
      .sort((a, b) => a.order - b.order);
  };

  const ungroupedFields = visibleFields.filter(f => !f.groupId).sort((a, b) => a.order - b.order);

  const handleChange = (fieldName: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    for (const field of fields) {
      if (field.visibility !== 'visible') continue;
      
      const isRequired = field.validation?.required;
      const value = formData[field.name];
      
      if (isRequired && (value === undefined || value === null || value === '')) {
        newErrors[field.name] = `${field.label} is required`;
        continue;
      }

      if (value && field.validation) {
        if (field.validation.minLength && String(value).length < field.validation.minLength) {
          newErrors[field.name] = `${field.label} must be at least ${field.validation.minLength} characters`;
        }
        if (field.validation.maxLength && String(value).length > field.validation.maxLength) {
          newErrors[field.name] = `${field.label} must be at most ${field.validation.maxLength} characters`;
        }
        if (field.validation.min && Number(value) < field.validation.min) {
          newErrors[field.name] = `${field.label} must be at least ${field.validation.min}`;
        }
        if (field.validation.max && Number(value) > field.validation.max) {
          newErrors[field.name] = `${field.label} must be at most ${field.validation.max}`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit?.(formData);
    }
  };

  const renderField = (field: FormFieldConfig) => {
    const isDisabled = field.visibility === 'disabled';
    const value = formData[field.name] ?? field.defaultValue ?? '';
    const errorMsg = errors[field.name];

    const inputClasses = `w-full border rounded px-3 py-2 ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${errorMsg ? 'border-red-500' : ''}`;

    switch (field.type) {
      case 'select':
        return (
          <select
            id={field.id}
            name={field.name}
            value={value as string}
            onChange={(e) => handleChange(field.name, e.target.value)}
            disabled={isDisabled}
            className={inputClasses}
          >
            <option value="">{field.placeholder || 'Select an option'}</option>
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <input
            type="checkbox"
            id={field.id}
            name={field.name}
            checked={Boolean(value)}
            onChange={(e) => handleChange(field.name, e.target.checked)}
            disabled={isDisabled}
            className="w-5 h-5"
          />
        );
      case 'textarea':
        return (
          <textarea
            id={field.id}
            name={field.name}
            value={value as string}
            onChange={(e) => handleChange(field.name, e.target.value)}
            disabled={isDisabled}
            placeholder={field.placeholder}
            className={inputClasses}
            rows={3}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            id={field.id}
            name={field.name}
            value={value as string}
            onChange={(e) => handleChange(field.name, e.target.value)}
            disabled={isDisabled}
            placeholder={field.placeholder}
            className={inputClasses}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            id={field.id}
            name={field.name}
            value={value as string}
            onChange={(e) => handleChange(field.name, e.target.value)}
            disabled={isDisabled}
            className={inputClasses}
          />
        );
      case 'datetime':
        return (
          <input
            type="datetime-local"
            id={field.id}
            name={field.name}
            value={value as string}
            onChange={(e) => handleChange(field.name, e.target.value)}
            disabled={isDisabled}
            className={inputClasses}
          />
        );
      case 'email':
        return (
          <input
            type="email"
            id={field.id}
            name={field.name}
            value={value as string}
            onChange={(e) => handleChange(field.name, e.target.value)}
            disabled={isDisabled}
            placeholder={field.placeholder}
            className={inputClasses}
          />
        );
      case 'tel':
        return (
          <input
            type="tel"
            id={field.id}
            name={field.name}
            value={value as string}
            onChange={(e) => handleChange(field.name, e.target.value)}
            disabled={isDisabled}
            placeholder={field.placeholder}
            className={inputClasses}
          />
        );
      default:
        return (
          <input
            type="text"
            id={field.id}
            name={field.name}
            value={value as string}
            onChange={(e) => handleChange(field.name, e.target.value)}
            disabled={isDisabled}
            placeholder={field.placeholder}
            className={inputClasses}
          />
        );
    }
  };

  if (loading) {
    return <div className="p-4 text-gray-500">Loading form configuration...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error loading form: {error}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="configured-form space-y-6">
      {visibleGroups.map(group => {
        const groupFields = getFieldsForGroup(group.id);
        if (groupFields.length === 0) return null;
        
        return (
          <div key={group.id} className="form-group mb-6 p-4 border rounded bg-gray-50">
            <h3 className="text-lg font-semibold mb-3 pb-2 border-b">{group.label}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupFields.map(field => (
                <div key={field.id} className={`field-wrapper ${field.type === 'textarea' || field.type === 'checkbox' ? 'col-span-full' : ''}`}>
                  {field.type !== 'checkbox' && (
                    <label htmlFor={field.id} className="block text-sm font-medium mb-1">
                      {field.label}
                      {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
                      {field.visibility === 'disabled' && <span className="text-gray-400 ml-1">(Disabled)</span>}
                    </label>
                  )}
                  {field.type === 'checkbox' ? (
                    <div className="flex items-center gap-2">
                      {renderField(field)}
                      <label htmlFor={field.id} className="text-sm font-medium">
                        {field.label}
                        {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                    </div>
                  ) : (
                    renderField(field)
                  )}
                  {errors[field.name] && (
                    <p className="mt-1 text-sm text-red-500">{errors[field.name]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {ungroupedFields.length > 0 && (
        <div className="ungrouped-fields">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ungroupedFields.map(field => (
              <div key={field.id} className={`field-wrapper ${field.type === 'textarea' || field.type === 'checkbox' ? 'col-span-full' : ''}`}>
                {field.type !== 'checkbox' && (
                  <label htmlFor={field.id} className="block text-sm font-medium mb-1">
                    {field.label}
                    {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
                    {field.visibility === 'disabled' && <span className="text-gray-400 ml-1">(Disabled)</span>}
                  </label>
                )}
                {field.type === 'checkbox' ? (
                  <div className="flex items-center gap-2">
                    {renderField(field)}
                    <label htmlFor={field.id} className="text-sm font-medium">
                      {field.label}
                      {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                  </div>
                ) : (
                  renderField(field)
                )}
                {errors[field.name] && (
                  <p className="mt-1 text-sm text-red-500">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {children}

      <div className="form-actions pt-4">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
        >
          Submit
        </button>
      </div>
    </form>
  );
}

export function createConfiguredForm(formKey: string, backendRequired?: string[]): React.FC<{ onSubmit?: (data: Record<string, unknown>) => void }>;
export function createConfiguredForm(schema: FormSchema, backendRequired?: string[]): React.FC<{ onSubmit?: (data: Record<string, unknown>) => void }>;
export function createConfiguredForm(formKeyOrSchema: string | FormSchema, backendRequired?: string[]) {
  const formKey = typeof formKeyOrSchema === 'string' ? formKeyOrSchema : formKeyOrSchema.formKey;
  const schema = typeof formKeyOrSchema === 'object' ? formKeyOrSchema : undefined;
  
  return function FormWrapper({ onSubmit }: { onSubmit?: (data: Record<string, unknown>) => void }) {
    return <ConfiguredForm formKey={formKey} backendRequired={backendRequired} onSubmit={onSubmit} schema={schema} />;
  };
}
