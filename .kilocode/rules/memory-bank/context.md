# Active Context: Dynamic Form Configuration System

## Current State

A dynamic form configuration system for healthcare/clinical applications with field management and system activation functions. Now supports schema-based field auto-discovery and custom facility configurations.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] Dynamic form configuration system
- [x] Field removal toggle (isRemoved flag) - fields are not deleted, just marked as removed
- [x] Group removal toggle (isRemoved flag)
- [x] System Activation Functions with field/group metadata control
- [x] Admin UI for managing fields, groups, and system activations
- [x] Schema-based field auto-discovery - forms can define their fields programmatically
- [x] Auto-creation of config from schema when form loads
- [x] Custom configuration support with named configs
- [x] Default facility type configs: Default (Full), PHC, General Hospital, FMC, FTH, Private Clinic
- [x] Self-contained form files with schema defined in each file

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/lib/form-config/types.ts` | Type definitions | ✅ |
| `src/lib/form-config/service.ts` | Business logic, localStorage persistence | ✅ |
| `src/lib/form-config/hooks.tsx` | React context & hooks | ✅ |
| `src/components/admin/FormConfigEditor.tsx` | Admin UI for form configuration | ✅ |
| `src/components/forms/ConfiguredForm.tsx` | Dynamic form renderer | ✅ |
| `src/components/forms/form-definitions/` | Individual form files with schemas | ✅ |

## How to Add a New Form

1. Create a new file in `src/components/forms/form-definitions/`
2. Define the `FormSchema` in the file
3. Create the form component that uses the schema
4. Export both the schema and component
5. Add to `index.ts` in form-definitions

Example:

```typescript
// src/components/forms/form-definitions/MyNewForm.tsx

'use client';
import React from 'react';
import { ConfiguredForm } from '../ConfiguredForm';
import { FormSchema } from '@/lib/form-config/types';

export const myNewFormSchema: FormSchema = {
  formKey: 'my_new_form',
  formName: 'My New Form',
  description: 'Description',
  groups: [
    { id: 'section1', name: 'section1', label: 'Section 1' },
  ],
  fields: [
    { id: 'field1', name: 'field1', label: 'Field 1', type: 'text', validation: { required: true }, groupId: 'section1' },
  ],
};

interface MyNewFormProps {
  onSubmit?: (data: Record<string, unknown>) => void;
}

export function MyNewForm({ onSubmit }: MyNewFormProps) {
  return <ConfiguredForm formKey={myNewFormSchema.formKey} schema={myNewFormSchema} onSubmit={onSubmit} />;
}
```

## Custom Configurations
- Save current form configurations with custom name
- Choose facility type: Default, PHC, General Hospital, FMC, FTH, Private Clinic
- Set as default configuration
- Load/delete saved configurations in admin panel

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-03-13 | Added field removal toggle and System Activation Functions |
| 2026-03-13 | Added schema-based auto-discovery |
| 2026-03-13 | Added custom configuration support with facility types |
| 2026-03-13 | Restructured forms to be self-contained with schema in each file |
