export type FieldType = 
  | 'text' 
  | 'number' 
  | 'email' 
  | 'tel' 
  | 'date' 
  | 'datetime' 
  | 'select' 
  | 'multiselect' 
  | 'checkbox' 
  | 'radio' 
  | 'textarea' 
  | 'file'
  | 'password';

export type FieldVisibility = 'visible' | 'hidden' | 'disabled';

export interface SelectOption {
  label: string;
  value: string;
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

export interface FormFieldConfig {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  defaultValue?: unknown;
  options?: SelectOption[];
  validation?: FieldValidation;
  visibility: FieldVisibility;
  order: number;
  groupId?: string;
}

export interface FieldGroupConfig {
  id: string;
  name: string;
  label: string;
  visibility: FieldVisibility;
  order: number;
  collapsible?: boolean;
  collapsed?: boolean;
}

export interface SystemFunctionActivation {
  functionName: string;
  conditions: {
    fieldId: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: unknown;
  }[];
  effects: {
    fieldId: string;
    action: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'unrequire';
  }[];
}

export interface FormConfig {
  id: string;
  formName: string;
  formKey: string;
  description?: string;
  version: number;
  fields: FormFieldConfig[];
  groups: FieldGroupConfig[];
  systemActivations: SystemFunctionActivation[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FormConfigSummary {
  id: string;
  formKey: string;
  formName: string;
  description?: string;
  isActive: boolean;
  fieldCount: number;
  groupCount: number;
}

export interface BackendFormConfig {
  formConfigs: FormConfig[];
  summaries: FormConfigSummary[];
  activeFormKeys: string[];
}

export function getDefaultFieldConfig(
  id: string,
  name: string,
  label: string,
  type: FieldType,
  order: number
): FormFieldConfig {
  return {
    id,
    name,
    label,
    type,
    visibility: 'visible',
    order,
  };
}

export function getDefaultGroupConfig(
  id: string,
  name: string,
  label: string,
  order: number
): FieldGroupConfig {
  return {
    id,
    name,
    label,
    visibility: 'visible',
    order,
    collapsible: false,
    collapsed: false,
  };
}
