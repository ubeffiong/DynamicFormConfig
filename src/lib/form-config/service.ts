import { FormConfig, FormConfigSummary, BackendFormConfig, FormFieldConfig, FieldGroupConfig, SystemFunctionActivation, FormSchema } from './types';

const STORAGE_KEY = 'form_configs';
const ACTIVE_FUNCTIONS_KEY = 'active_system_functions';

const defaultConfigs: BackendFormConfig = {
  formConfigs: [],
  summaries: [],
  activeFormKeys: [],
};

function getStoredConfigs(): BackendFormConfig {
  if (typeof window === 'undefined') return defaultConfigs;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultConfigs;
    }
  }
  return defaultConfigs;
}

function saveStoredConfigs(configs: BackendFormConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  }
}

export function getActiveSystemFunctions(): string[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(ACTIVE_FUNCTIONS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function setActiveSystemFunctions(functions: string[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACTIVE_FUNCTIONS_KEY, JSON.stringify(functions));
  }
}

const registeredSchemas = new Map<string, FormSchema>();

export function registerFormSchema(schema: FormSchema): void {
  registeredSchemas.set(schema.formKey, schema);
}

export function getRegisteredSchemas(): FormSchema[] {
  return Array.from(registeredSchemas.values());
}

export function getRegisteredSchema(formKey: string): FormSchema | undefined {
  return registeredSchemas.get(formKey);
}

export function unregisterFormSchema(formKey: string): void {
  registeredSchemas.delete(formKey);
}

export async function getOrCreateConfigFromSchema(formKey: string): Promise<FormConfig | null> {
  const schema = getRegisteredSchema(formKey);
  if (!schema) {
    return fetchFormConfigByKey(formKey);
  }

  let config = await fetchFormConfigByKey(formKey);
  
  if (!config) {
    config = {
      id: `${formKey}-config`,
      formName: schema.formName,
      formKey: schema.formKey,
      description: schema.description,
      version: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      groups: schema.groups.map((g, idx) => ({
        ...g,
        visibility: 'visible',
        order: idx + 1,
      })),
      fields: schema.fields.map((f, idx) => ({
        ...f,
        visibility: 'visible',
        order: idx + 1,
      })),
      systemActivations: [],
    };
    await saveFormConfig(config);
  } else {
    const existingFieldIds = new Set(config.fields.map(f => f.id));
    const existingGroupIds = new Set(config.groups.map(g => g.id));
    
    const newFields = schema.fields
      .filter(f => !existingFieldIds.has(f.id))
      .map((f, idx) => ({
        ...f,
        visibility: 'visible' as const,
        order: config!.fields.length + idx + 1,
      }));
    
    const newGroups = schema.groups
      .filter(g => !existingGroupIds.has(g.id))
      .map((g, idx) => ({
        ...g,
        visibility: 'visible' as const,
        order: config!.groups.length + idx + 1,
      }));
    
    if (newFields.length > 0 || newGroups.length > 0) {
      config = {
        ...config,
        fields: [...config.fields, ...newFields],
        groups: [...config.groups, ...newGroups],
        updatedAt: new Date().toISOString(),
      };
      await saveFormConfig(config);
    }
  }
  
  return config;
}

export async function fetchFormConfigs(): Promise<BackendFormConfig> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return getStoredConfigs();
}

export async function fetchFormConfigByKey(formKey: string): Promise<FormConfig | null> {
  await new Promise(resolve => setTimeout(resolve, 50));
  const configs = getStoredConfigs();
  return configs.formConfigs.find(c => c.formKey === formKey) || null;
}

export async function saveFormConfig(config: FormConfig): Promise<FormConfig> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const configs = getStoredConfigs();
  const existingIndex = configs.formConfigs.findIndex(c => c.id === config.id);
  
  if (existingIndex >= 0) {
    configs.formConfigs[existingIndex] = { ...config, updatedAt: new Date().toISOString() };
  } else {
    config.createdAt = new Date().toISOString();
    config.updatedAt = new Date().toISOString();
    configs.formConfigs.push(config);
  }
  
  configs.summaries = configs.formConfigs.map(c => ({
    id: c.id,
    formKey: c.formKey,
    formName: c.formName,
    description: c.description,
    isActive: c.isActive,
    fieldCount: c.fields.filter(f => !f.isRemoved).length,
    groupCount: c.groups.filter(g => !g.isRemoved).length,
  }));
  
  saveStoredConfigs(configs);
  return config;
}

export async function deleteFormConfig(configId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 50));
  const configs = getStoredConfigs();
  configs.formConfigs = configs.formConfigs.filter(c => c.id !== configId);
  configs.summaries = configs.formConfigs.map(c => ({
    id: c.id,
    formKey: c.formKey,
    formName: c.formName,
    description: c.description,
    isActive: c.isActive,
    fieldCount: c.fields.filter(f => !f.isRemoved).length,
    groupCount: c.groups.filter(g => !g.isRemoved).length,
  }));
  saveStoredConfigs(configs);
}

export async function activateFormConfig(formKey: string, active: boolean): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 50));
  const configs = getStoredConfigs();
  const config = configs.formConfigs.find(c => c.formKey === formKey);
  if (config) {
    config.isActive = active;
    config.updatedAt = new Date().toISOString();
  }
  
  if (active) {
    if (!configs.activeFormKeys.includes(formKey)) {
      configs.activeFormKeys.push(formKey);
    }
  } else {
    configs.activeFormKeys = configs.activeFormKeys.filter(k => k !== formKey);
  }
  
  saveStoredConfigs(configs);
}

export function applySystemActivations(
  config: FormConfig,
  formData: Record<string, unknown>,
  activeFunctions: string[]
): { fields: FormFieldConfig[]; groups: FieldGroupConfig[] } {
  const activatedFields = config.fields.map(field => ({ ...field }));
  const activatedGroups = config.groups.map(group => ({ ...group }));
  
  const relevantActivations = config.systemActivations.filter(activation => 
    activeFunctions.includes(activation.functionName)
  );
  
  for (const activation of relevantActivations) {
    const conditionsMet = activation.conditions.every(condition => {
      const fieldValue = formData[condition.fieldId];
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'not_equals':
          return fieldValue !== condition.value;
        case 'contains':
          return String(fieldValue).includes(String(condition.value));
        case 'greater_than':
          return Number(fieldValue) > Number(condition.value);
        case 'less_than':
          return Number(fieldValue) < Number(condition.value);
        default:
          return false;
      }
    });
    
    if (conditionsMet) {
      for (const effect of activation.effects) {
        const field = activatedFields.find(f => f.id === effect.fieldId);
        if (field) {
          switch (effect.action) {
            case 'show':
              field.visibility = 'visible';
              break;
            case 'hide':
              field.visibility = 'hidden';
              break;
            case 'enable':
              field.visibility = 'visible';
              break;
            case 'disable':
              field.visibility = 'disabled';
              break;
            case 'require':
              if (field.validation) {
                field.validation.required = true;
              } else {
                field.validation = { required: true };
              }
              break;
            case 'unrequire':
              if (field.validation) {
                field.validation.required = false;
              }
              break;
          }
        }
        
        const group = activatedGroups.find(g => g.id === effect.fieldId);
        if (group) {
          switch (effect.action) {
            case 'show':
              group.visibility = 'visible';
              break;
            case 'hide':
              group.visibility = 'hidden';
              break;
          }
        }
      }
    }
  }
  
  return { fields: activatedFields, groups: activatedGroups };
}

export function mergeWithBackendRequired(
  fields: FormFieldConfig[],
  backendRequired: string[]
): FormFieldConfig[] {
  return fields.map(field => {
    if (backendRequired.includes(field.name)) {
      return {
        ...field,
        visibility: 'visible',
        validation: {
          ...field.validation,
          required: true,
        },
      };
    }
    return field;
  });
}

export function initializeSampleConfigs(): void {
  const configs = getStoredConfigs();
  if (configs.formConfigs.length > 0) return;
  
  const patientRegistrationConfig: FormConfig = {
    id: 'patient-registration',
    formName: 'Patient Registration',
    formKey: 'patient_registration',
    description: 'New patient registration form',
    version: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    groups: [
      { id: 'personal', name: 'personal', label: 'Personal Information', visibility: 'visible', order: 1 },
      { id: 'contact', name: 'contact', label: 'Contact Details', visibility: 'visible', order: 2 },
      { id: 'medical', name: 'medical', label: 'Medical History', visibility: 'visible', order: 3 },
    ],
    fields: [
      { id: 'firstName', name: 'firstName', label: 'First Name', type: 'text', placeholder: 'Enter first name', visibility: 'visible', order: 1, groupId: 'personal', validation: { required: true } },
      { id: 'lastName', name: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Enter last name', visibility: 'visible', order: 2, groupId: 'personal', validation: { required: true } },
      { id: 'dateOfBirth', name: 'dateOfBirth', label: 'Date of Birth', type: 'date', visibility: 'visible', order: 3, groupId: 'personal', validation: { required: true } },
      { id: 'gender', name: 'gender', label: 'Gender', type: 'select', visibility: 'visible', order: 4, groupId: 'personal', options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' },
      ]},
      { id: 'email', name: 'email', label: 'Email', type: 'email', placeholder: 'email@example.com', visibility: 'visible', order: 5, groupId: 'contact' },
      { id: 'phone', name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '123-456-7890', visibility: 'visible', order: 6, groupId: 'contact', validation: { required: true } },
      { id: 'address', name: 'address', label: 'Address', type: 'textarea', placeholder: 'Enter address', visibility: 'visible', order: 7, groupId: 'contact' },
      { id: 'emergencyContact', name: 'emergencyContact', label: 'Emergency Contact Name', type: 'text', visibility: 'visible', order: 8, groupId: 'contact' },
      { id: 'emergencyPhone', name: 'emergencyPhone', label: 'Emergency Contact Phone', type: 'tel', visibility: 'visible', order: 9, groupId: 'contact' },
      { id: 'bloodType', name: 'bloodType', label: 'Blood Type', type: 'select', visibility: 'visible', order: 10, groupId: 'medical', options: [
        { label: 'A+', value: 'A+' },
        { label: 'A-', value: 'A-' },
        { label: 'B+', value: 'B+' },
        { label: 'B-', value: 'B-' },
        { label: 'O+', value: 'O+' },
        { label: 'O-', value: 'O-' },
        { label: 'AB+', value: 'AB+' },
        { label: 'AB-', value: 'AB-' },
      ]},
      { id: 'allergies', name: 'allergies', label: 'Known Allergies', type: 'textarea', placeholder: 'List any allergies', visibility: 'visible', order: 11, groupId: 'medical' },
      { id: 'medications', name: 'medications', label: 'Current Medications', type: 'textarea', placeholder: 'List current medications', visibility: 'visible', order: 12, groupId: 'medical' },
    ],
    systemActivations: [
      {
        functionName: 'insurance_enabled',
        description: 'Controls insurance-related fields visibility',
        conditions: [{ fieldId: 'hasInsurance', operator: 'equals', value: true }],
        effects: [
          { fieldId: 'insuranceProvider', action: 'show' },
          { fieldId: 'policyNumber', action: 'show' },
          { fieldId: 'groupNumber', action: 'show' },
        ],
        fieldMetadata: [],
        groupMetadata: [],
      },
    ],
  };
  
  const admissionConfig: FormConfig = {
    id: 'admission',
    formName: 'Admission Form',
    formKey: 'admission',
    description: 'Patient admission form',
    version: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    groups: [
      { id: 'admissionDetails', name: 'admissionDetails', label: 'Admission Details', visibility: 'visible', order: 1 },
      { id: 'roomInfo', name: 'roomInfo', label: 'Room Information', visibility: 'visible', order: 2 },
    ],
    fields: [
      { id: 'admissionDate', name: 'admissionDate', label: 'Admission Date', type: 'datetime', visibility: 'visible', order: 1, groupId: 'admissionDetails', validation: { required: true } },
      { id: 'admissionType', name: 'admissionType', label: 'Admission Type', type: 'select', visibility: 'visible', order: 2, groupId: 'admissionDetails', validation: { required: true }, options: [
        { label: 'Emergency', value: 'emergency' },
        { label: 'Elective', value: 'elective' },
        { label: 'Transfer', value: 'transfer' },
      ]},
      { id: 'reason', name: 'reason', label: 'Reason for Admission', type: 'textarea', visibility: 'visible', order: 3, groupId: 'admissionDetails', validation: { required: true } },
      { id: 'assignedDoctor', name: 'assignedDoctor', label: 'Assigned Doctor', type: 'text', visibility: 'visible', order: 4, groupId: 'admissionDetails' },
      { id: 'roomNumber', name: 'roomNumber', label: 'Room Number', type: 'text', visibility: 'visible', order: 5, groupId: 'roomInfo' },
      { id: 'bedNumber', name: 'bedNumber', label: 'Bed Number', type: 'text', visibility: 'visible', order: 6, groupId: 'roomInfo' },
      { id: 'floor', name: 'floor', label: 'Floor', type: 'number', visibility: 'visible', order: 7, groupId: 'roomInfo' },
      { id: 'ward', name: 'ward', label: 'Ward', type: 'select', visibility: 'visible', order: 8, groupId: 'roomInfo', options: [
        { label: 'General', value: 'general' },
        { label: 'ICU', value: 'icu' },
        { label: 'Pediatric', value: 'pediatric' },
        { label: 'Maternity', value: 'maternity' },
      ]},
    ],
    systemActivations: [],
  };
  
  const vitalsConfig: FormConfig = {
    id: 'vitals',
    formName: 'Vitals Sign Form',
    formKey: 'vitals',
    description: 'Patient vitals recording form',
    version: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    groups: [
      { id: 'vitalsMain', name: 'vitalsMain', label: 'Vital Signs', visibility: 'visible', order: 1 },
      { id: 'additional', name: 'additional', label: 'Additional Measurements', visibility: 'visible', order: 2 },
    ],
    fields: [
      { id: 'recordDate', name: 'recordDate', label: 'Recording Date/Time', type: 'datetime', visibility: 'visible', order: 1, groupId: 'vitalsMain', validation: { required: true } },
      { id: 'bloodPressureSystolic', name: 'bloodPressureSystolic', label: 'Blood Pressure (Systolic)', type: 'number', placeholder: 'mmHg', visibility: 'visible', order: 2, groupId: 'vitalsMain', validation: { required: true, min: 60, max: 250 } },
      { id: 'bloodPressureDiastolic', name: 'bloodPressureDiastolic', label: 'Blood Pressure (Diastolic)', type: 'number', placeholder: 'mmHg', visibility: 'visible', order: 3, groupId: 'vitalsMain', validation: { required: true, min: 40, max: 150 } },
      { id: 'heartRate', name: 'heartRate', label: 'Heart Rate', type: 'number', placeholder: 'bpm', visibility: 'visible', order: 4, groupId: 'vitalsMain', validation: { required: true, min: 30, max: 220 } },
      { id: 'respiratoryRate', name: 'respiratoryRate', label: 'Respiratory Rate', type: 'number', placeholder: 'breaths/min', visibility: 'visible', order: 5, groupId: 'vitalsMain', validation: { required: true, min: 8, max: 40 } },
      { id: 'temperature', name: 'temperature', label: 'Temperature', type: 'number', placeholder: '°F', visibility: 'visible', order: 6, groupId: 'vitalsMain', validation: { required: true, min: 94, max: 108 } },
      { id: 'oxygenSaturation', name: 'oxygenSaturation', label: 'Oxygen Saturation (SpO2)', type: 'number', placeholder: '%', visibility: 'visible', order: 7, groupId: 'vitalsMain', validation: { min: 0, max: 100 } },
      { id: 'weight', name: 'weight', label: 'Weight', type: 'number', placeholder: 'kg', visibility: 'visible', order: 8, groupId: 'additional' },
      { id: 'height', name: 'height', label: 'Height', type: 'number', placeholder: 'cm', visibility: 'visible', order: 9, groupId: 'additional' },
      { id: 'bmi', name: 'bmi', label: 'BMI', type: 'number', placeholder: 'kg/m²', visibility: 'visible', order: 10, groupId: 'additional' },
      { id: 'notes', name: 'notes', label: 'Notes', type: 'textarea', visibility: 'visible', order: 11, groupId: 'additional' },
    ],
    systemActivations: [],
  };
  
  const settingsConfig: FormConfig = {
    id: 'settings',
    formName: 'Settings',
    formKey: 'settings',
    description: 'Application settings form',
    version: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    groups: [
      { id: 'general', name: 'general', label: 'General Settings', visibility: 'visible', order: 1 },
      { id: 'notifications', name: 'notifications', label: 'Notifications', visibility: 'visible', order: 2 },
      { id: 'security', name: 'security', label: 'Security', visibility: 'visible', order: 3 },
    ],
    fields: [
      { id: 'siteName', name: 'siteName', label: 'Site Name', type: 'text', visibility: 'visible', order: 1, groupId: 'general', validation: { required: true } },
      { id: 'timezone', name: 'timezone', label: 'Timezone', type: 'select', visibility: 'visible', order: 2, groupId: 'general', options: [
        { label: 'UTC', value: 'UTC' },
        { label: 'EST', value: 'EST' },
        { label: 'PST', value: 'PST' },
        { label: 'CST', value: 'CST' },
      ]},
      { id: 'language', name: 'language', label: 'Language', type: 'select', visibility: 'visible', order: 3, groupId: 'general', options: [
        { label: 'English', value: 'en' },
        { label: 'Spanish', value: 'es' },
        { label: 'French', value: 'fr' },
      ]},
      { id: 'emailNotifications', name: 'emailNotifications', label: 'Enable Email Notifications', type: 'checkbox', visibility: 'visible', order: 4, groupId: 'notifications' },
      { id: 'smsNotifications', name: 'smsNotifications', label: 'Enable SMS Notifications', type: 'checkbox', visibility: 'visible', order: 5, groupId: 'notifications' },
      { id: 'pushNotifications', name: 'pushNotifications', label: 'Enable Push Notifications', type: 'checkbox', visibility: 'visible', order: 6, groupId: 'notifications' },
      { id: 'twoFactorAuth', name: 'twoFactorAuth', label: 'Enable Two-Factor Authentication', type: 'checkbox', visibility: 'visible', order: 7, groupId: 'security' },
      { id: 'sessionTimeout', name: 'sessionTimeout', label: 'Session Timeout (minutes)', type: 'number', visibility: 'visible', order: 8, groupId: 'security', validation: { min: 5, max: 120 } },
    ],
    systemActivations: [],
  };
  
  configs.formConfigs = [patientRegistrationConfig, admissionConfig, vitalsConfig, settingsConfig];
  configs.summaries = configs.formConfigs.map(c => ({
    id: c.id,
    formKey: c.formKey,
    formName: c.formName,
    description: c.description,
    isActive: c.isActive,
    fieldCount: c.fields.filter(f => !f.isRemoved).length,
    groupCount: c.groups.filter(g => !g.isRemoved).length,
  }));
  configs.activeFormKeys = configs.formConfigs.filter(c => c.isActive).map(c => c.formKey);
  
  saveStoredConfigs(configs);
}
