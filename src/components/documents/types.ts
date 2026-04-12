/**
 * Shared Types and Styles for Document PDFs
 */
import { StyleSheet } from '@react-pdf/renderer';
import { Application } from '@/lib/supabase';

export interface DocumentPDFProps {
  application: Application;
  lang: 'sw' | 'en';
}

// Common styles for all PDF documents
export const commonStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 12,
    color: '#1c1917',
  },
  photoSection: {
    position: 'absolute',
    top: 40,
    left: 40,
    width: 80,
    alignItems: 'center',
  },
  photoBox: {
    width: 70,
    height: 85,
    borderWidth: 1,
    borderColor: '#78716c',
    backgroundColor: '#f5f5f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  photo: {
    width: 68,
    height: 83,
    objectFit: 'cover',
  },
  photoPlaceholder: {
    fontSize: 8,
    color: '#a8a29e',
    textAlign: 'center',
  },
  nidaLabel: {
    fontSize: 6,
    color: '#78716c',
    marginBottom: 2,
  },
  nidaNumber: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#1c1917',
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  country: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  office: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#44403c',
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: '#1c1917',
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textDecoration: 'underline',
    textTransform: 'uppercase',
    marginBottom: 30,
  },
  subject: {
    fontWeight: 'bold',
    marginBottom: 20,
  },
  body: {
    lineHeight: 1.6,
    textAlign: 'justify',
    marginBottom: 40,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  signatureBox: {
    width: '45%',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#a8a29e',
    marginBottom: 10,
  },
  signatureName: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  signatureTitle: {
    fontSize: 10,
    color: '#78716c',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e7e5e4',
    paddingTop: 10,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#a8a29e',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  metadata: {
    fontSize: 6,
    color: '#d6d3d1',
    fontFamily: 'Courier',
  },
  watermark: {
    position: 'absolute',
    top: '40%',
    left: '20%',
    fontSize: 100,
    color: '#f5f5f4',
    opacity: 0.1,
    transform: 'rotate(-45deg)',
    zIndex: -1,
  },
  qrSection: {
    position: 'absolute',
    bottom: 80,
    right: 40,
    alignItems: 'center',
  },
  qrCode: {
    width: 70,
    height: 70,
    marginBottom: 4,
  },
  qrLabel: {
    fontSize: 6,
    color: '#78716c',
    textAlign: 'center',
  },
  // Additional styles for specific sections
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5',
  },
  infoLabel: {
    width: '40%',
    fontWeight: 'bold',
    fontSize: 10,
    color: '#57534e',
  },
  infoValue: {
    width: '60%',
    fontSize: 10,
    color: '#1c1917',
  },
  sectionHeader: {
    backgroundColor: '#f5f5f4',
    padding: 8,
    marginBottom: 15,
    marginTop: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#059669',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#065f46',
    textTransform: 'uppercase',
  },
});

// Helper function to generate QR code URL
export const generateQRCodeUrl = (application: Application, serviceName: string): string => {
  const verificationData = JSON.stringify({
    id: application.id,
    app_no: application.application_number,
    service: serviceName,
    issued: new Date().toISOString().split('T')[0]
  });
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationData)}`;
};

// Helper function to format user full name
export const formatFullName = (user: any): string => {
  return `${user?.first_name || ''} ${user?.middle_name || ''} ${user?.last_name || ''}`.replace(/\s+/g, ' ').trim();
};

// Helper function to format date
export const formatDate = (dateString?: string): string => {
  if (!dateString) return new Date().toLocaleDateString('sw-TZ');
  return new Date(dateString).toLocaleDateString('sw-TZ');
};

// Helper function to format currency
export const formatCurrency = (amount?: number): string => {
  if (!amount) return 'N/A';
  return `TZS ${amount.toLocaleString()}`;
};
