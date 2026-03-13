'use client';

import React from 'react';
import { ConfiguredForm } from '../ConfiguredForm';
import { FormSchema } from '@/lib/form-config/types';

export const admissionSchema: FormSchema = {
  formKey: 'admission',
  formName: 'Admission Form',
  description: 'Patient admission form',
  groups: [
    { id: 'admissionDetails', name: 'admissionDetails', label: 'Admission Details' },
    { id: 'roomInfo', name: 'roomInfo', label: 'Room Information' },
  ],
  fields: [
    { id: 'admissionDate', name: 'admissionDate', label: 'Admission Date', type: 'datetime', validation: { required: true }, groupId: 'admissionDetails', groupLabel: 'Admission Details' },
    { id: 'admissionType', name: 'admissionType', label: 'Admission Type', type: 'select', validation: { required: true }, options: [
      { label: 'Emergency', value: 'emergency' },
      { label: 'Elective', value: 'elective' },
      { label: 'Transfer', value: 'transfer' },
    ], groupId: 'admissionDetails', groupLabel: 'Admission Details' },
    { id: 'reason', name: 'reason', label: 'Reason for Admission', type: 'textarea', validation: { required: true }, groupId: 'admissionDetails', groupLabel: 'Admission Details' },
    { id: 'assignedDoctor', name: 'assignedDoctor', label: 'Assigned Doctor', type: 'text', groupId: 'admissionDetails', groupLabel: 'Admission Details' },
    { id: 'roomNumber', name: 'roomNumber', label: 'Room Number', type: 'text', groupId: 'roomInfo', groupLabel: 'Room Information' },
    { id: 'bedNumber', name: 'bedNumber', label: 'Bed Number', type: 'text', groupId: 'roomInfo', groupLabel: 'Room Information' },
    { id: 'floor', name: 'floor', label: 'Floor', type: 'number', groupId: 'roomInfo', groupLabel: 'Room Information' },
    { id: 'ward', name: 'ward', label: 'Ward', type: 'select', options: [
      { label: 'General', value: 'general' },
      { label: 'ICU', value: 'icu' },
      { label: 'Pediatric', value: 'pediatric' },
      { label: 'Maternity', value: 'maternity' },
    ], groupId: 'roomInfo', groupLabel: 'Room Information' },
  ],
};

interface AdmissionFormProps {
  onSubmit?: (data: Record<string, unknown>) => void;
}

export function AdmissionForm({ onSubmit }: AdmissionFormProps) {
  return <ConfiguredForm formKey={admissionSchema.formKey} schema={admissionSchema} onSubmit={onSubmit} />;
}

export default AdmissionForm;
