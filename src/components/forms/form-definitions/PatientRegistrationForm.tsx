'use client';

import React from 'react';
import { ConfiguredForm } from '../ConfiguredForm';
import { FormSchema } from '@/lib/form-config/types';

export const patientRegistrationSchema: FormSchema = {
  formKey: 'patient_registration',
  formName: 'Patient Registration',
  description: 'New patient registration form',
  groups: [
    { id: 'personal', name: 'personal', label: 'Personal Information' },
    { id: 'contact', name: 'contact', label: 'Contact Details' },
    { id: 'medical', name: 'medical', label: 'Medical History' },
  ],
  fields: [
    { id: 'firstName', name: 'firstName', label: 'First Name', type: 'text', placeholder: 'Enter first name', validation: { required: true }, groupId: 'personal', groupLabel: 'Personal Information' },
    { id: 'lastName', name: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Enter last name', validation: { required: true }, groupId: 'personal', groupLabel: 'Personal Information' },
    { id: 'dateOfBirth', name: 'dateOfBirth', label: 'Date of Birth', type: 'date', validation: { required: true }, groupId: 'personal', groupLabel: 'Personal Information' },
    { id: 'gender', name: 'gender', label: 'Gender', type: 'select', options: [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
      { label: 'Other', value: 'other' },
    ], groupId: 'personal', groupLabel: 'Personal Information' },
    { id: 'email', name: 'email', label: 'Email', type: 'email', placeholder: 'email@example.com', groupId: 'contact', groupLabel: 'Contact Details' },
    { id: 'phone', name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '123-456-7890', validation: { required: true }, groupId: 'contact', groupLabel: 'Contact Details' },
    { id: 'address', name: 'address', label: 'Address', type: 'textarea', placeholder: 'Enter address', groupId: 'contact', groupLabel: 'Contact Details' },
    { id: 'emergencyContact', name: 'emergencyContact', label: 'Emergency Contact Name', type: 'text', groupId: 'contact', groupLabel: 'Contact Details' },
    { id: 'emergencyPhone', name: 'emergencyPhone', label: 'Emergency Contact Phone', type: 'tel', groupId: 'contact', groupLabel: 'Contact Details' },
    { id: 'bloodType', name: 'bloodType', label: 'Blood Type', type: 'select', options: [
      { label: 'A+', value: 'A+' },
      { label: 'A-', value: 'A-' },
      { label: 'B+', value: 'B+' },
      { label: 'B-', value: 'B-' },
      { label: 'O+', value: 'O+' },
      { label: 'O-', value: 'O-' },
      { label: 'AB+', value: 'AB+' },
      { label: 'AB-', value: 'AB-' },
    ], groupId: 'medical', groupLabel: 'Medical History' },
    { id: 'allergies', name: 'allergies', label: 'Known Allergies', type: 'textarea', placeholder: 'List any allergies', groupId: 'medical', groupLabel: 'Medical History' },
    { id: 'medications', name: 'medications', label: 'Current Medications', type: 'textarea', placeholder: 'List current medications', groupId: 'medical', groupLabel: 'Medical History' },
  ],
};

interface PatientRegistrationFormProps {
  onSubmit?: (data: Record<string, unknown>) => void;
}

export function PatientRegistrationForm({ onSubmit }: PatientRegistrationFormProps) {
  return <ConfiguredForm formKey={patientRegistrationSchema.formKey} schema={patientRegistrationSchema} onSubmit={onSubmit} />;
}

export default PatientRegistrationForm;
