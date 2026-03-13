export { PatientRegistrationForm, patientRegistrationSchema } from './PatientRegistrationForm';
export { GeneralConsultationForm, generalConsultationSchema } from './GeneralConsultationForm';
export { AdmissionForm, admissionSchema } from './AdmissionForm';
export { VitalsForm, vitalsSchema } from './VitalsForm';
export { SettingsForm, settingsSchema } from './SettingsForm';

import { patientRegistrationSchema } from './PatientRegistrationForm';
import { generalConsultationSchema } from './GeneralConsultationForm';
import { admissionSchema } from './AdmissionForm';
import { vitalsSchema } from './VitalsForm';
import { settingsSchema } from './SettingsForm';
import { FormSchema } from '@/lib/form-config/types';

export const allFormSchemas: FormSchema[] = [
  patientRegistrationSchema,
  generalConsultationSchema,
  admissionSchema,
  vitalsSchema,
  settingsSchema,
];

export const formOptions = allFormSchemas.map(schema => ({
  key: schema.formKey,
  label: schema.formName,
  schema,
}));
