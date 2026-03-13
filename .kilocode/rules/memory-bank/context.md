# Active Context: Dynamic Form Configuration System

## Current State

A dynamic form configuration system for healthcare/clinical applications with field management and system activation functions. Now supports schema-based field auto-discovery.

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

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/lib/form-config/types.ts` | Type definitions (FormFieldConfig, FieldGroupConfig, SystemFunctionActivation, FormSchema) | ✅ |
| `src/lib/form-config/service.ts` | Business logic, localStorage persistence, form registry | ✅ |
| `src/lib/form-config/hooks.tsx` | React context & hooks, registerSchema, getConfigWithSchema | ✅ |
| `src/components/admin/FormConfigEditor.tsx` | Admin UI for form configuration | ✅ |
| `src/components/forms/ConfiguredForm.tsx` | Dynamic form renderer, createConfiguredForm with schema | ✅ |

## Key Features

### Schema-Based Forms
Define form fields programmatically using `FormSchema`:

```typescript
const myFormSchema: FormSchema = {
  formKey: 'my_form',
  formName: 'My Form',
  description: 'Description',
  groups: [
    { id: 'personal', name: 'personal', label: 'Personal Info' },
  ],
  fields: [
    { id: 'name', name: 'name', label: 'Name', type: 'text', validation: { required: true }, groupId: 'personal' },
  ],
};

// Create form with auto-discovery
const MyForm = createConfiguredForm(myFormSchema);
```

### Field Removal Toggle
- Fields are NOT deleted when "Remove" is clicked
- Instead, `isRemoved: true` flag is set on the field
- Removed fields appear with a red tint in admin UI
- Admin can click "Restore" to re-enable removed fields
- Removed fields are filtered out when rendering forms

### System Activation Functions
- Each activation can control which fields/groups it manages
- Admin can add fields/groups to each activation function
- Can enable/disable fields and groups per function
- Metadata stored in `fieldMetadata` and `groupMetadata` arrays

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-03-13 | Added field removal toggle and System Activation Functions with field metadata |
| 2026-03-13 | Added schema-based auto-discovery for dynamic form configuration |
