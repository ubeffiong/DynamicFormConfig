'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  FormConfig,
  FormConfigSummary,
  BackendFormConfig,
  FormFieldConfig,
  FieldGroupConfig,
} from './types';
import {
  fetchFormConfigs,
  fetchFormConfigByKey,
  saveFormConfig as saveConfig,
  deleteFormConfig as deleteConfig,
  activateFormConfig as activateConfig,
  applySystemActivations,
  mergeWithBackendRequired,
  getActiveSystemFunctions,
  setActiveSystemFunctions,
  initializeSampleConfigs,
} from './service';

interface FormConfigContextValue {
  configs: BackendFormConfig;
  loading: boolean;
  error: string | null;
  refreshConfigs: () => Promise<void>;
  getConfig: (formKey: string) => Promise<FormConfig | null>;
  saveConfig: (config: FormConfig) => Promise<FormConfig>;
  deleteConfig: (configId: string) => Promise<void>;
  activateConfig: (formKey: string, active: boolean) => Promise<void>;
  getActiveFunctions: () => string[];
  setActiveFunctions: (functions: string[]) => void;
  applyConfig: (
    formKey: string,
    formData: Record<string, unknown>,
    backendRequired?: string[]
  ) => Promise<{ fields: FormFieldConfig[]; groups: FieldGroupConfig[] }>;
}

const FormConfigContext = createContext<FormConfigContextValue | null>(null);

export function FormConfigProvider({ children }: { children: ReactNode }) {
  const [configs, setConfigs] = useState<BackendFormConfig>({ formConfigs: [], summaries: [], activeFormKeys: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFunctions, setActiveFunctionsState] = useState<string[]>([]);

  const refreshConfigs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      initializeSampleConfigs();
      const data = await fetchFormConfigs();
      setConfigs(data);
      setActiveFunctionsState(getActiveSystemFunctions());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configurations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshConfigs();
  }, [refreshConfigs]);

  const getConfig = useCallback(async (formKey: string): Promise<FormConfig | null> => {
    return fetchFormConfigByKey(formKey);
  }, []);

  const saveConfigHandler = useCallback(async (config: FormConfig): Promise<FormConfig> => {
    const saved = await saveConfig(config);
    await refreshConfigs();
    return saved;
  }, [refreshConfigs]);

  const deleteConfigHandler = useCallback(async (configId: string): Promise<void> => {
    await deleteConfig(configId);
    await refreshConfigs();
  }, [refreshConfigs]);

  const activateConfigHandler = useCallback(async (formKey: string, active: boolean): Promise<void> => {
    await activateConfig(formKey, active);
    await refreshConfigs();
  }, [refreshConfigs]);

  const getActiveFunctions = useCallback((): string[] => {
    return activeFunctions;
  }, [activeFunctions]);

  const setActiveFunctionsHandler = useCallback((functions: string[]) => {
    setActiveSystemFunctions(functions);
    setActiveFunctionsState(functions);
  }, []);

  const applyConfig = useCallback(async (
    formKey: string,
    formData: Record<string, unknown>,
    backendRequired: string[] = []
  ): Promise<{ fields: FormFieldConfig[]; groups: FieldGroupConfig[] }> => {
    const config = await fetchFormConfigByKey(formKey);
    if (!config) {
      throw new Error(`Configuration not found for form: ${formKey}`);
    }

    let { fields, groups } = applySystemActivations(config, formData, activeFunctions);
    fields = mergeWithBackendRequired(fields, backendRequired);
    
    return { fields, groups };
  }, [activeFunctions]);

  return (
    <FormConfigContext.Provider
      value={{
        configs,
        loading,
        error,
        refreshConfigs,
        getConfig,
        saveConfig: saveConfigHandler,
        deleteConfig: deleteConfigHandler,
        activateConfig: activateConfigHandler,
        getActiveFunctions,
        setActiveFunctions: setActiveFunctionsHandler,
        applyConfig,
      }}
    >
      {children}
    </FormConfigContext.Provider>
  );
}

export function useFormConfig() {
  const context = useContext(FormConfigContext);
  if (!context) {
    throw new Error('useFormConfig must be used within a FormConfigProvider');
  }
  return context;
}

export function useConfiguredForm(formKey: string, backendRequired: string[] = []) {
  const { applyConfig, getConfig, loading, error } = useFormConfig();
  const [config, setConfig] = useState<FormConfig | null>(null);
  const [appliedFields, setAppliedFields] = useState<FormFieldConfig[]>([]);
  const [appliedGroups, setAppliedGroups] = useState<FieldGroupConfig[]>([]);

  useEffect(() => {
    async function loadConfig() {
      const cfg = await getConfig(formKey);
      setConfig(cfg);
    }
    if (formKey) {
      loadConfig();
    }
  }, [formKey, getConfig]);

  const applyToForm = useCallback(async (formData: Record<string, unknown>) => {
    if (!config) return { fields: [], groups: [] };
    
    const result = await applyConfig(formKey, formData, backendRequired);
    setAppliedFields(result.fields);
    setAppliedGroups(result.groups);
    return result;
  }, [config, formKey, backendRequired, applyConfig]);

  const getVisibleFields = useCallback(() => {
    return appliedFields.filter(f => f.visibility === 'visible');
  }, [appliedFields]);

  const getVisibleGroups = useCallback(() => {
    return appliedGroups.filter(g => g.visibility === 'visible');
  }, [appliedGroups]);

  const getFieldById = useCallback((fieldId: string) => {
    return appliedFields.find(f => f.id === fieldId);
  }, [appliedFields]);

  const getFieldsByGroup = useCallback((groupId: string) => {
    return appliedFields
      .filter(f => f.groupId === groupId && f.visibility !== 'hidden')
      .sort((a, b) => a.order - b.order);
  }, [appliedFields]);

  return {
    config,
    appliedFields,
    appliedGroups,
    applyToForm,
    getVisibleFields,
    getVisibleGroups,
    getFieldById,
    getFieldsByGroup,
    loading,
    error,
  };
}
