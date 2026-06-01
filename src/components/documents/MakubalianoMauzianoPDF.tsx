// @ts-nocheck — dynamic form data rendering; fields vary by service type
/**
 * Makubaliano ya Mauziano PDF
 * Sales Agreement / Rental Agreement
 * 
 * Service: Makubaliano ya Mauziano
 */
import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { DocumentPDFProps, commonStyles, generateQRCodeUrl, formatFullName, formatDate, formatCurrency } from './types';
import { TANZANIA_LOGO_BASE64 } from '@/constants/logo';

// Additional styles for agreement document
const agreementStyles = StyleSheet.create({
  partyBox: {
    borderWidth: 1,
    borderColor: '#d6d3d1',
    padding: 12,
    marginBottom: 15,
    borderRadius: 4,
    backgroundColor: '#fafaf9',
  },
  partyTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  agreementBadge: {
    backgroundColor: '#059669',
    padding: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceBox: {
    backgroundColor: '#fef3c7',
    padding: 15,
    marginVertical: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  priceLabel: {
    fontSize: 10,
    color: '#92400e',
    marginBottom: 5,
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#92400e',
  },
  twoColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: '48%',
  },
});

export const MakubalianoMauzianoPDF: React.FC<DocumentPDFProps> = ({ application, lang }) => {
  const user = (application as any).users;
  const formData = application.form_data as Record<string, unknown> || {};
  const qrCodeUrl = generateQRCodeUrl(application, 'Makubaliano ya Mauziano');

  // Asset type labels
  const assetTypeLabels: Record<string, { sw: string; en: string }> = {
    'ARDHI': { sw: 'Ardhi / Kiwanja', en: 'Land / Plot' },
    'GARI': { sw: 'Gari / Chombo cha Moto', en: 'Vehicle' },
    'NYUMBA': { sw: 'Nyumba', en: 'House' },
    'KODI_PANGO_MAKAZI': { sw: 'Kodi ya Pango - Makazi', en: 'Residential Rent' },
    'KODI_PANGO_BIASHARA': { sw: 'Kodi ya Pango - Biashara', en: 'Commercial Rent' },
    'NYINGINEZO': { sw: 'Nyinginezo', en: 'Other' },
  };

  const getAssetTypeLabel = (type: string): string => {
    const label = assetTypeLabels[type];
    if (label) return lang === 'sw' ? label.sw : label.en;
    return type;
  };

  const labels = {
    sw: {
      title: 'HATI YA MAKUBALIANO',
      assetInfo: 'TAARIFA ZA MALI',
      sellerInfo: 'MUUZAJI / MPANGISHAJI',
      buyerInfo: 'MNUNUZI / MPANGAJI',
      assetType: 'Aina ya Mali',
      description: 'Maelezo',
      price: 'Bei / Kodi',
      name: 'Jina',
      nida: 'NIDA',
      citizenId: 'Namba ya Raia',
      phone: 'Simu',
      tin: 'TIN',
      agreement: 'MAKUBALIANO YAMEIDHINISHWA',
      agreementText: 'Makubaliano haya yamehakikiwa na pande zote mbili na kuidhinishwa na mamlaka husika.',
      sellerSig: 'Sahihi ya Muuzaji/Mpangishaji',
      buyerSig: 'Sahihi ya Mnunuzi/Mpangaji',
      footer: 'Hati hii ni uthibitisho wa kisheria wa mauziano/upangaji huu.',
    },
    en: {
      title: 'AGREEMENT DOCUMENT',
      assetInfo: 'ASSET INFORMATION',
      sellerInfo: 'SELLER / LANDLORD',
      buyerInfo: 'BUYER / TENANT',
      assetType: 'Asset Type',
      description: 'Description',
      price: 'Price / Rent',
      name: 'Name',
      nida: 'NIDA',
      citizenId: 'Citizen ID',
      phone: 'Phone',
      tin: 'TIN',
      agreement: 'AGREEMENT APPROVED',
      agreementText: 'This agreement has been verified by both parties and approved by relevant authorities.',
      sellerSig: 'Seller/Landlord Signature',
      buyerSig: 'Buyer/Tenant Signature',
      footer: 'This document is legal proof of this sale/rental agreement.',
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

        {/* Agreement Badge */}
        <View style={agreementStyles.agreementBadge}>
          <Text style={agreementStyles.badgeText}>✓ {t.agreement}</Text>
        </View>

        {/* Asset Information Section */}
        <View style={commonStyles.sectionHeader}>
          <Text style={commonStyles.sectionTitle}>{t.assetInfo}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.assetType}:</Text>
          <Text style={commonStyles.infoValue}>{getAssetTypeLabel(formData.asset_type)}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.description}:</Text>
          <Text style={commonStyles.infoValue}>{formData.asset_description || 'N/A'}</Text>
        </View>

        {/* Price Box */}
        <View style={agreementStyles.priceBox}>
          <Text style={agreementStyles.priceLabel}>{t.price}</Text>
          <Text style={agreementStyles.priceAmount}>{formatCurrency(formData.sale_price)}</Text>
        </View>

        {/* Two Column Layout for Parties */}
        <View style={agreementStyles.twoColumns}>
          {/* Seller/Landlord */}
          <View style={[agreementStyles.partyBox, agreementStyles.column]}>
            <Text style={agreementStyles.partyTitle}>{t.sellerInfo}</Text>
            
            <View style={commonStyles.infoRow}>
              <Text style={commonStyles.infoLabel}>{t.name}:</Text>
              <Text style={commonStyles.infoValue}>{formatFullName(user)}</Text>
            </View>

            <View style={commonStyles.infoRow}>
              <Text style={commonStyles.infoLabel}>{t.nida}:</Text>
              <Text style={commonStyles.infoValue}>{user?.nida_number || 'N/A'}</Text>
            </View>

            <View style={commonStyles.infoRow}>
              <Text style={commonStyles.infoLabel}>{t.citizenId}:</Text>
              <Text style={commonStyles.infoValue}>{user?.citizen_id || 'N/A'}</Text>
            </View>

            <View style={commonStyles.infoRow}>
              <Text style={commonStyles.infoLabel}>{t.tin}:</Text>
              <Text style={commonStyles.infoValue}>{formData.seller_tin || 'N/A'}</Text>
            </View>
          </View>

          {/* Buyer/Tenant */}
          <View style={[agreementStyles.partyBox, agreementStyles.column]}>
            <Text style={agreementStyles.partyTitle}>{t.buyerInfo}</Text>
            
            <View style={commonStyles.infoRow}>
              <Text style={commonStyles.infoLabel}>{t.name}:</Text>
              <Text style={commonStyles.infoValue}>{formData.second_party_name || 'N/A'}</Text>
            </View>

            <View style={commonStyles.infoRow}>
              <Text style={commonStyles.infoLabel}>{t.citizenId}:</Text>
              <Text style={commonStyles.infoValue}>{formData.second_party_citizen_id || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Agreement Text */}
        <Text style={[commonStyles.body, { marginTop: 20 }]}>
          {t.agreementText}
        </Text>

        {/* Signatures */}
        <View style={commonStyles.signatureSection}>
          <View style={commonStyles.signatureBox}>
            <View style={commonStyles.signatureLine} />
            <Text style={commonStyles.signatureName}>{formatFullName(user)}</Text>
            <Text style={commonStyles.signatureTitle}>{t.sellerSig}</Text>
          </View>
          <View style={[commonStyles.signatureBox, { textAlign: 'right', alignItems: 'flex-end' }]}>
            <View style={commonStyles.signatureLine} />
            <Text style={commonStyles.signatureName}>{formData.second_party_name || 'N/A'}</Text>
            <Text style={commonStyles.signatureTitle}>{t.buyerSig}</Text>
          </View>
        </View>

        {/* QR Code */}
        <View style={commonStyles.qrSection}>
          <Image src={qrCodeUrl} style={commonStyles.qrCode} />
          <Text style={commonStyles.qrLabel}>{application.application_number}</Text>
        </View>

        {/* Footer */}
        <View style={commonStyles.footer}>
          <Text style={commonStyles.footerText}>{t.footer}</Text>
          <Text style={commonStyles.metadata}>
            VERIFICATION ID: {application.id.toUpperCase()} | GENERATED ON: {new Date().toISOString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default MakubalianoMauzianoPDF;
