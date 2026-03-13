'use client';

import React from 'react';
import { ConfiguredForm } from '../ConfiguredForm';
import { FormSchema } from '@/lib/form-config/types';

export const generalConsultationSchema: FormSchema = {
  formKey: 'general_consultation',
  formName: 'General Consultation',
  description: 'General consultation form for patients',
  groups: [
    { id: 'vitals', name: 'vitals', label: 'Vital Signs' },
    { id: 'symptoms', name: 'symptoms', label: 'Symptoms' },
    { id: 'assessment', name: 'assessment', label: 'Assessment' },
  ],
  fields: [
    { id: 'consultationDate', name: 'consultationDate', label: 'Consultation Date', type: 'datetime', validation: { required: true }, groupId: 'vitals', groupLabel: 'Vital Signs' },
    { id: 'temperature', name: 'temperature', label: 'Temperature (°F)', type: 'number', placeholder: '98.6', validation: { required: true, min: 94, max: 108 }, groupId: 'vitals', groupLabel: 'Vital Signs' },
    { id: 'bloodPressure', name: 'bloodPressure', label: 'Blood Pressure', type: 'text', placeholder: '120/80', validation: { required: true }, groupId: 'vitals', groupLabel: 'Vital Signs' },
    { id: 'heartRate', name: 'heartRate', label: 'Heart Rate (bpm)', type: 'number', placeholder: '72', validation: { required: true, min: 30, max: 220 }, groupId: 'vitals', groupLabel: 'Vital Signs' },
    { id: 'respiratoryRate', name: 'respiratoryRate', label: 'Respiratory Rate', type: 'number', placeholder: '16', groupId: 'vitals', groupLabel: 'Vital Signs' },
    { id: 'oxygenSaturation', name: 'oxygenSaturation', label: 'Oxygen Saturation (%)', type: 'number', placeholder: '98', groupId: 'vitals', groupLabel: 'Vital Signs' },
    { id: 'chiefComplaint', name: 'chiefComplaint', label: 'Chief Complaint', type: 'textarea', validation: { required: true }, groupId: 'symptoms', groupLabel: 'Symptoms' },
    { id: 'symptomDuration', name: 'symptomDuration', label: 'Symptom Duration', type: 'text', placeholder: 'e.g., 3 days', groupId: 'symptoms', groupLabel: 'Symptoms' },
    { id: 'symptomSeverity', name: 'symptomSeverity', label: 'Severity', type: 'select', options: [
      { label: 'Mild', value: 'mild' },
      { label: 'Moderate', value: 'moderate' },
      { label: 'Severe', value: 'severe' },
    ], groupId: 'symptoms', groupLabel: 'Symptoms' },
    { id: 'additionalSymptoms', name: 'additionalSymptoms', label: 'Additional Symptoms', type: 'textarea', groupId: 'symptoms', groupLabel: 'Symptoms' },
    { id: 'physicalExam', name: 'physicalExam', label: 'Physical Examination Notes', type: 'textarea', groupId: 'assessment', groupLabel: 'Assessment' },
    { id: 'diagnosis', name: 'diagnosis', label: 'Diagnosis', type: 'textarea', validation: { required: true }, groupId: 'assessment', groupLabel: 'Assessment' },
    { id: 'treatmentPlan', name: 'treatmentPlan', label: 'Treatment Plan', type: 'textarea', groupId: 'assessment', groupLabel: 'Assessment' },
    { id: 'followUpDate', name: 'followUpDate', label: 'Follow-up Date', type: 'date', groupId: 'assessment', groupLabel: 'Assessment' },
  ],
};

interface GeneralConsultationFormProps {
  onSubmit?: (data: Record<string, unknown>) => void;
}

export function GeneralConsultationForm({ onSubmit }: GeneralConsultationFormProps) {
  return <ConfiguredForm formKey={generalConsultationSchema.formKey} schema={generalConsultationSchema} onSubmit={onSubmit} />;
}

export default GeneralConsultationForm;
