# Active Context: Dynamic Form Configuration System

## Current State

**Template Status**: ✅ Ready for development

A dynamic form configuration system for healthcare/clinical applications with field management and system activation functions.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] Dynamic form configuration system
- [x] Field removal toggle (isRemoved flag) - fields are not deleted, just marked as removed
- [x] Group removal toggle (isRemoved flag)
- [x] System Activation Functions with field/group metadata control
- [x] Admin UI for managing fields, groups, and system activations

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/lib/form-config/types.ts` | Type definitions (FormFieldConfig, FieldGroupConfig, SystemFunctionActivation) | ✅ |
| `src/lib/form-config/service.ts` | Business logic, localStorage persistence | ✅ |
| `src/lib/form-config/hooks.tsx` | React context & hooks | ✅ |
| `src/components/admin/FormConfigEditor.tsx` | Admin UI for form configuration | ✅ |
| `src/components/forms/ConfiguredForm.tsx` | Dynamic form renderer | ✅ |

## Key Features

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

## Quick Start Guide

### To add a new form:

1. Navigate to admin panel
2. Create new form configuration
3. Add fields and groups
4. Configure system activation functions if needed

### To configure System Activation:

1. Go to System Activations tab
2. Add a new activation with function name (e.g., "insurance_enabled")
3. Add fields this function should control
4. Set fields as enabled or disabled by default

## Available Recipes

| Recipe | File | Use Case |
|--------|------|----------|
| Add Database | `.kilocode/recipes/add-database.md` | Data persistence with Drizzle + SQLite |

## Pending Improvements

- [ ] Add conditions/effects editor for system activations
- [ ] Add backend integration for form configs
- [ ] Add import/export functionality

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-03-13 | Added field removal toggle and System Activation Functions with field metadata |
