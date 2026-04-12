/**
 * Risiti ya Malipo PDF
 * Payment Receipt
 * 
 * This is a general receipt for all service payments
 */
import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { DocumentPDFProps, commonStyles, generateQRCodeUrl, formatFullName, formatDate, formatCurrency } from './types';
import { TANZANIA_LOGO_BASE64 } from '@/constants/logo';

// Receipt-specific styles
const receiptStyles = StyleSheet.create({
  receiptBanner: {
    backgroundColor: '#059669',
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 4,
  },
  paidText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  receiptNumber: {
    color: '#d1fae5',
    fontSize: 10,
    marginTop: 5,
  },
  paymentCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#059669',
    padding: 20,
    alignItems: 'center',
    marginVertical: 15,
    borderRadius: 8,
  },
  amountLabel: {
    fontSize: 10,
    color: '#065f46',
    marginBottom: 5,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 5,
  },
  amountWords: {
    fontSize: 9,
    color: '#065f46',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  detailsTable: {
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 10,
  },
  tableRowAlt: {
    backgroundColor: '#f9fafb',
  },
  tableLabel: {
    width: '40%',
    fontSize: 10,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  tableValue: {
    width: '60%',
    fontSize: 10,
    color: '#1f2937',
  },
  methodBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  methodText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  stampSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#059669',
  },
  stampBox: {
    alignItems: 'center',
    width: '30%',
  },
  stampCircle: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: '#059669',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  stampText: {
    fontSize: 8,
    color: '#059669',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

// Convert number to words for amounts (simplified)
const numberToWords = (num: number, lang: string): string => {
  if (num === 0) return lang === 'sw' ? 'Sifuri' : 'Zero';
  
  const ones = {
    sw: ['', 'Moja', 'Mbili', 'Tatu', 'Nne', 'Tano', 'Sita', 'Saba', 'Nane', 'Tisa'],
    en: ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  };
  
  // For simplicity, just return the formatted number with currency word
  const currency = lang === 'sw' ? 'Shilingi za Tanzania' : 'Tanzanian Shillings';
  return `${currency} ${num.toLocaleString()} ${lang === 'sw' ? 'tu' : 'Only'}`;
};

// Payment method labels
const paymentMethodLabels: Record<string, { sw: string; en: string }> = {
  'MOBILE_MONEY': { sw: 'Simu', en: 'Mobile Money' },
  'BANK_TRANSFER': { sw: 'Benki', en: 'Bank Transfer' },
  'CASH': { sw: 'Taslimu', en: 'Cash' },
  'CARD': { sw: 'Kadi', en: 'Card' },
};

export const RisitiMalipoPDF: React.FC<DocumentPDFProps> = ({ application, lang }) => {
  const user = (application as any).users;
  const serviceFee = application.form_data?.service_fee || 0;
  const paymentMethod = (application as any).payment_method || 'MOBILE_MONEY';
  const paymentReference = (application as any).payment_reference || application.application_number;

  const qrCodeUrl = generateQRCodeUrl(application, 'Risiti ya Malipo');

  const getPaymentMethodLabel = (method: string): string => {
    const label = paymentMethodLabels[method];
    if (label) return lang === 'sw' ? label.sw : label.en;
    return method;
  };

  const labels = {
    sw: {
      title: 'RISITI YA MALIPO',
      paid: 'IMELIPWA',
      receiptNo: 'Nambari ya Risiti',
      amountLabel: 'KIASI KILICHOLIPWA',
      paymentDetails: 'TAARIFA ZA MALIPO',
      service: 'Huduma',
      applicationNo: 'Nambari ya Maombi',
      paymentMethod: 'Njia ya Malipo',
      reference: 'Nambari ya Transaction',
      paymentDate: 'Tarehe ya Malipo',
      paidBy: 'TAARIFA ZA MLIPAJI',
      fullName: 'Jina la Mlipaji',
      nida: 'NIDA',
      phone: 'Simu',
      address: 'Anwani',
      cashier: 'Karani',
      verified: 'Imethibitishwa',
      originalCopy: 'Nakala Halali',
      footer: 'Risiti hii ni ushahidi wa malipo. Hifadhi kwa rekodi zako.',
    },
    en: {
      title: 'PAYMENT RECEIPT',
      paid: 'PAID',
      receiptNo: 'Receipt Number',
      amountLabel: 'AMOUNT PAID',
      paymentDetails: 'PAYMENT DETAILS',
      service: 'Service',
      applicationNo: 'Application Number',
      paymentMethod: 'Payment Method',
      reference: 'Transaction Reference',
      paymentDate: 'Payment Date',
      paidBy: 'PAYER INFORMATION',
      fullName: 'Payer Name',
      nida: 'NIDA',
      phone: 'Phone',
      address: 'Address',
      cashier: 'Cashier',
      verified: 'Verified',
      originalCopy: 'Original Copy',
      footer: 'This receipt is proof of payment. Keep it for your records.',
    }
  };

  const t = labels[lang];

  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        <Text style={commonStyles.watermark}>E-MTAA</Text>

        {/* Header */}
        <View style={commonStyles.header}>
          <Image src={TANZANIA_LOGO_BASE64} style={commonStyles.logo} />
          <Text style={commonStyles.country}>JAMHURI YA MUUNGANO WA TANZANIA</Text>
          <Text style={commonStyles.office}>OFISI YA RAIS - TAMISEMI</Text>
          <View style={commonStyles.divider} />
        </View>

        {/* Title */}
        <Text style={commonStyles.title}>{t.title}</Text>

        {/* Paid Banner */}
        <View style={receiptStyles.receiptBanner}>
          <Text style={receiptStyles.paidText}>✓ {t.paid}</Text>
          <Text style={receiptStyles.receiptNumber}>
            {t.receiptNo}: {paymentReference}
          </Text>
        </View>

        {/* Amount Card */}
        <View style={receiptStyles.paymentCard}>
          <Text style={receiptStyles.amountLabel}>{t.amountLabel}</Text>
          <Text style={receiptStyles.amountValue}>{formatCurrency(serviceFee)}</Text>
          <Text style={receiptStyles.amountWords}>{numberToWords(serviceFee, lang)}</Text>
        </View>

        {/* Payment Details Table */}
        <View style={receiptStyles.detailsTable}>
          <View style={receiptStyles.tableRow}>
            <Text style={receiptStyles.tableLabel}>{t.service}</Text>
            <Text style={receiptStyles.tableValue}>{application.service_name}</Text>
          </View>
          <View style={[receiptStyles.tableRow, receiptStyles.tableRowAlt]}>
            <Text style={receiptStyles.tableLabel}>{t.applicationNo}</Text>
            <Text style={receiptStyles.tableValue}>{application.application_number}</Text>
          </View>
          <View style={receiptStyles.tableRow}>
            <Text style={receiptStyles.tableLabel}>{t.paymentMethod}</Text>
            <View style={receiptStyles.methodBadge}>
              <Text style={receiptStyles.methodText}>{getPaymentMethodLabel(paymentMethod)}</Text>
            </View>
          </View>
          <View style={[receiptStyles.tableRow, receiptStyles.tableRowAlt]}>
            <Text style={receiptStyles.tableLabel}>{t.reference}</Text>
            <Text style={receiptStyles.tableValue}>{paymentReference}</Text>
          </View>
          <View style={[receiptStyles.tableRow, { borderBottomWidth: 0 }]}>
            <Text style={receiptStyles.tableLabel}>{t.paymentDate}</Text>
            <Text style={receiptStyles.tableValue}>
              {formatDate(application.paid_at || application.updated_at)}
            </Text>
          </View>
        </View>

        {/* Payer Information */}
        <View style={commonStyles.sectionHeader}>
          <Text style={commonStyles.sectionTitle}>{t.paidBy}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.fullName}:</Text>
          <Text style={commonStyles.infoValue}>{formatFullName(user)}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.nida}:</Text>
          <Text style={commonStyles.infoValue}>{user?.nida_number || 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.phone}:</Text>
          <Text style={commonStyles.infoValue}>{user?.phone || 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.address}:</Text>
          <Text style={commonStyles.infoValue}>
            {[user?.street, user?.ward, user?.district].filter(Boolean).join(', ') || 'N/A'}
          </Text>
        </View>

        {/* Stamps Section */}
        <View style={receiptStyles.stampSection}>
          <View style={receiptStyles.stampBox}>
            <View style={receiptStyles.stampCircle}>
              <Text style={receiptStyles.stampText}>{t.cashier}</Text>
            </View>
            <Text style={{ fontSize: 8, color: '#6b7280' }}>E-MTAA</Text>
          </View>
          <View style={receiptStyles.stampBox}>
            <View style={receiptStyles.stampCircle}>
              <Text style={receiptStyles.stampText}>{t.verified}</Text>
            </View>
            <Text style={{ fontSize: 8, color: '#6b7280' }}>{new Date().toLocaleDateString()}</Text>
          </View>
          <View style={receiptStyles.stampBox}>
            <View style={receiptStyles.stampCircle}>
              <Text style={receiptStyles.stampText}>{t.originalCopy}</Text>
            </View>
            <Text style={{ fontSize: 8, color: '#6b7280' }}>ORIGINAL</Text>
          </View>
        </View>

        {/* QR Code */}
        <View style={commonStyles.qrSection}>
          <Image src={qrCodeUrl} style={commonStyles.qrCode} />
          <Text style={commonStyles.qrLabel}>{paymentReference}</Text>
        </View>

        {/* Footer */}
        <View style={commonStyles.footer}>
          <Text style={commonStyles.footerText}>{t.footer}</Text>
          <Text style={commonStyles.metadata}>
            PAYMENT ID: {application.id.toUpperCase()} | GENERATED ON: {new Date().toISOString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default RisitiMalipoPDF;
