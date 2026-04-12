/**
 * Forms Index
 * 
 * Export all service-specific forms for easy import
 */

export * from './types';

export { UtambulishoMkaziForm } from './UtambulishoMkaziForm';
export { BaruaUtambulishoForm } from './BaruaUtambulishoForm';
export { KibariMazishiForm } from './KibariMazishiForm';
export { KibariShereheForm } from './KibariShereheForm';

import { UtambulishoMkaziForm } from './UtambulishoMkaziForm';
import { BaruaUtambulishoForm } from './BaruaUtambulishoForm';
import { KibariMazishiForm } from './KibariMazishiForm';
import { KibariShereheForm } from './KibariShereheForm';
import React from 'react';
import { FormProps } from './types';

// Map service names to their form components
// IMPORTANT: These names must match exactly with HARDCODED_SERVICES in services.ts
export const SERVICE_FORMS: Record<string, React.FC<FormProps>> = {
  // Utambulisho wa Mkazi - Resident Identity
  'Utambulisho wa Mkazi': UtambulishoMkaziForm,

  // Kibari cha Mazishi - Burial Permit
  'Kibari cha Mazishi': KibariMazishiForm,

  // Kibari cha Sherehe - Celebration Permit
  'Kibari cha Sherehe': KibariShereheForm,

  // Kibari cha Ujezi Mdogo - uses dynamic form generator (no dedicated form)

  // Barua ya Utambulisho - Introduction Letter
  'Barua ya Utambulisho': BaruaUtambulishoForm,
};

export const getServiceForm = (serviceName: string): React.FC<FormProps> | null => {
  return SERVICE_FORMS[serviceName] || null;
};

export const hasServiceForm = (serviceName: string): boolean => {
  return serviceName in SERVICE_FORMS;
};
