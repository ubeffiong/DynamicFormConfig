'use client';

import React from 'react';
import { ConfiguredForm } from '../ConfiguredForm';
import { FormSchema } from '@/lib/form-config/types';

export const settingsSchema: FormSchema = {
  formKey: 'settings',
  formName: 'Settings',
  description: 'Application settings form',
  groups: [
    { id: 'general', name: 'general', label: 'General Settings' },
    { id: 'notifications', name: 'notifications', label: 'Notifications' },
    { id: 'security', name: 'security', label: 'Security' },
  ],
  fields: [
    { id: 'siteName', name: 'siteName', label: 'Site Name', type: 'text', validation: { required: true }, groupId: 'general', groupLabel: 'General Settings' },
    { id: 'timezone', name: 'timezone', label: 'Timezone', type: 'select', options: [
      { label: 'UTC', value: 'UTC' },
      { label: 'EST', value: 'EST' },
      { label: 'PST', value: 'PST' },
      { label: 'CST', value: 'CST' },
    ], groupId: 'general', groupLabel: 'General Settings' },
    { id: 'language', name: 'language', label: 'Language', type: 'select', options: [
      { label: 'English', value: 'en' },
      { label: 'Spanish', value: 'es' },
      { label: 'French', value: 'fr' },
    ], groupId: 'general', groupLabel: 'General Settings' },
    { id: 'emailNotifications', name: 'emailNotifications', label: 'Enable Email Notifications', type: 'checkbox', groupId: 'notifications', groupLabel: 'Notifications' },
    { id: 'smsNotifications', name: 'smsNotifications', label: 'Enable SMS Notifications', type: 'checkbox', groupId: 'notifications', groupLabel: 'Notifications' },
    { id: 'pushNotifications', name: 'pushNotifications', label: 'Enable Push Notifications', type: 'checkbox', groupId: 'notifications', groupLabel: 'Notifications' },
    { id: 'twoFactorAuth', name: 'twoFactorAuth', label: 'Enable Two-Factor Authentication', type: 'checkbox', groupId: 'security', groupLabel: 'Security' },
    { id: 'sessionTimeout', name: 'sessionTimeout', label: 'Session Timeout (minutes)', type: 'number', validation: { min: 5, max: 120 }, groupId: 'security', groupLabel: 'Security' },
  ],
};

interface SettingsFormProps {
  onSubmit?: (data: Record<string, unknown>) => void;
}

export function SettingsForm({ onSubmit }: SettingsFormProps) {
  return <ConfiguredForm formKey={settingsSchema.formKey} schema={settingsSchema} onSubmit={onSubmit} />;
}

export default SettingsForm;
