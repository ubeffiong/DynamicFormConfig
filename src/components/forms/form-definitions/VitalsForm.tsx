'use client';

import React from 'react';
import { ConfiguredForm } from '../ConfiguredForm';
import { FormSchema } from '@/lib/form-config/types';

export const vitalsSchema: FormSchema = {
  formKey: 'vitals',
  formName: 'Vitals Sign Form',
  description: 'Patient vitals recording form',
  groups: [
    { id: 'vitalsMain', name: 'vitalsMain', label: 'Vital Signs' },
    { id: 'additional', name: 'additional', label: 'Additional Measurements' },
  ],
  fields: [
    { id: 'recordDate', name: 'recordDate', label: 'Recording Date/Time', type: 'datetime', validation: { required: true }, groupId: 'vitalsMain', groupLabel: 'Vital Signs' },
    { id: 'bloodPressureSystolic', name: 'bloodPressureSystolic', label: 'Blood Pressure (Systolic)', type: 'number', placeholder: 'mmHg', validation: { required: true, min: 60, max: 250 }, groupId: 'vitalsMain', groupLabel: 'Vital Signs' },
    { id: 'bloodPressureDiastolic', name: 'bloodPressureDiastolic', label: 'Blood Pressure (Diastolic)', type: 'number', placeholder: 'mmHg', validation: { required: true, min: 40, max: 150 }, groupId: 'vitalsMain', groupLabel: 'Vital Signs' },
    { id: 'heartRate', name: 'heartRate', label: 'Heart Rate', type: 'number', placeholder: 'bpm', validation: { required: true, min: 30, max: 220 }, groupId: 'vitalsMain', groupLabel: 'Vital Signs' },
    { id: 'respiratoryRate', name: 'respiratoryRate', label: 'Respiratory Rate', type: 'number', placeholder: 'breaths/min', validation: { required: true, min: 8, max: 40 }, groupId: 'vitalsMain', groupLabel: 'Vital Signs' },
    { id: 'temperature', name: 'temperature', label: 'Temperature', type: 'number', placeholder: '°F', validation: { required: true, min: 94, max: 108 }, groupId: 'vitalsMain', groupLabel: 'Vital Signs' },
    { id: 'oxygenSaturation', name: 'oxygenSaturation', label: 'Oxygen Saturation (SpO2)', type: 'number', placeholder: '%', validation: { min: 0, max: 100 }, groupId: 'vitalsMain', groupLabel: 'Vital Signs' },
    { id: 'weight', name: 'weight', label: 'Weight', type: 'number', placeholder: 'kg', groupId: 'additional', groupLabel: 'Additional Measurements' },
    { id: 'height', name: 'height', label: 'Height', type: 'number', placeholder: 'cm', groupId: 'additional', groupLabel: 'Additional Measurements' },
    { id: 'bmi', name: 'bmi', label: 'BMI', type: 'number', placeholder: 'kg/m²', groupId: 'additional', groupLabel: 'Additional Measurements' },
    { id: 'notes', name: 'notes', label: 'Notes', type: 'textarea', groupId: 'additional', groupLabel: 'Additional Measurements' },
  ],
};

interface VitalsFormProps {
  onSubmit?: (data: Record<string, unknown>) => void;
}

export function VitalsForm({ onSubmit }: VitalsFormProps) {
  return <ConfiguredForm formKey={vitalsSchema.formKey} schema={vitalsSchema} onSubmit={onSubmit} />;
}

export default VitalsForm;
