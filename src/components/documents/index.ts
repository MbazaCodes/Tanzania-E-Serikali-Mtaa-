/**
 * Documents Index
 * 
 * Central export for all service-specific PDF documents
 */

export { UtambulishoMkaziPDF } from './UtambulishoMkaziPDF';
export { KibariMazishiPDF } from './KibariMazishiPDF';
export { KibariSherehePDF } from './KibariSherehePDF';
export { RisitiMalipoPDF } from './RisitiMalipoPDF';

export * from './types';

import { UtambulishoMkaziPDF } from './UtambulishoMkaziPDF';
import { KibariMazishiPDF } from './KibariMazishiPDF';
import { KibariSherehePDF } from './KibariSherehePDF';
import { RisitiMalipoPDF } from './RisitiMalipoPDF';
import type { DocumentPDFProps } from './types';
import React from 'react';

/**
 * Mapping of service names to their PDF document components
 * IMPORTANT: These names must match exactly with HARDCODED_SERVICES in services.ts
 */
export const SERVICE_DOCUMENTS: Record<string, React.FC<DocumentPDFProps>> = {
  // Utambulisho wa Mkazi - Resident Identity
  'Utambulisho wa Mkazi': UtambulishoMkaziPDF,

  // Kibari cha Mazishi - Burial Permit
  'Kibari cha Mazishi': KibariMazishiPDF,

  // Kibari cha Sherehe - Celebration Permit
  'Kibari cha Sherehe': KibariSherehePDF,
};

export function getServiceDocument(serviceName: string): React.FC<DocumentPDFProps> | undefined {
  return SERVICE_DOCUMENTS[serviceName];
}

export function hasServiceDocument(serviceName: string): boolean {
  return serviceName in SERVICE_DOCUMENTS;
}

export function getReceiptDocument(): React.FC<DocumentPDFProps> {
  return RisitiMalipoPDF;
}

export const AVAILABLE_PDF_SERVICES = Object.keys(SERVICE_DOCUMENTS);
