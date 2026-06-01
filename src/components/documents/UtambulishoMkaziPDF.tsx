// @ts-nocheck — dynamic form data rendering; fields vary by service type
/**
 * Utambulisho wa Mkazi PDF
 * Residency Certificate / Identification Letter
 * 
 * Service: Utambulisho wa Mkazi
 */
import React from 'react';
import { Document, Page, Text, View, Image } from '@react-pdf/renderer';
import { DocumentPDFProps, commonStyles, generateQRCodeUrl, formatFullName, formatDate } from './types';
import { TANZANIA_LOGO_BASE64 } from '@/constants/logo';

export const UtambulishoMkaziPDF: React.FC<DocumentPDFProps> = ({ application, lang }) => {
  const user = (application as any).users;
  const formData = application.form_data as Record<string, unknown> || {};
  const qrCodeUrl = generateQRCodeUrl(application, 'Utambulisho wa Mkazi');

  const labels = {
    sw: {
      title: 'CHETI CHA MKAZI',
      council: 'Halmashauri',
      maritalStatus: 'Hali ya Ndoa',
      occupation: 'Kazi/Shughuli',
      neighborhood: 'Kitongoji',
      houseNo: 'Nyumba Na.',
      block: 'Block/Area',
      purpose: 'Sababu ya Maombi',
      institution: 'Taasisi',
      institutionType: 'Aina ya Taasisi',
      nida: 'Namba ya NIDA',
      citizenId: 'Namba ya Raia',
      region: 'Mkoa',
      district: 'Wilaya',
      ward: 'Kata',
      street: 'Mtaa',
      applicantSig: 'Sahihi ya Mwombaji',
      officerSig: 'Sahihi na Muhuri',
      weo: 'AFISA MTENDAJI WA MTAA',
      scanVerify: 'Scan kuthibitisha',
      footer: 'Cheti hiki ni rasmi na kinaweza kuthibitishwa kwa kuchanganua QR code.',
      personalInfo: 'TAARIFA BINAFSI',
      residenceInfo: 'TAARIFA ZA MAKAZI',
      purposeInfo: 'SABABU YA MAOMBI',
    },
    en: {
      title: 'RESIDENCY CERTIFICATE',
      council: 'Council',
      maritalStatus: 'Marital Status',
      occupation: 'Occupation',
      neighborhood: 'Neighborhood',
      houseNo: 'House No.',
      block: 'Block/Area',
      purpose: 'Purpose',
      institution: 'Institution',
      institutionType: 'Institution Type',
      nida: 'NIDA Number',
      citizenId: 'Citizen ID',
      region: 'Region',
      district: 'District',
      ward: 'Ward',
      street: 'Street',
      applicantSig: 'Applicant Signature',
      officerSig: 'Signature & Stamp',
      weo: 'WARD EXECUTIVE OFFICER',
      scanVerify: 'Scan to verify',
      footer: 'This certificate is official and can be verified by scanning the QR code.',
      personalInfo: 'PERSONAL INFORMATION',
      residenceInfo: 'RESIDENCE INFORMATION',
      purposeInfo: 'PURPOSE OF APPLICATION',
    }
  };

  const t = labels[lang];

  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        <Text style={commonStyles.watermark}>E-MTAA</Text>

        {/* Photo Box */}
        <View style={commonStyles.photoSection}>
          <View style={commonStyles.photoBox}>
            {user?.photo_url ? (
              <Image src={user.photo_url} style={commonStyles.photo} />
            ) : (
              <Text style={commonStyles.photoPlaceholder}>PICHA{'\n'}PHOTO</Text>
            )}
          </View>
          <Text style={commonStyles.nidaLabel}>{t.nida}</Text>
          <Text style={commonStyles.nidaNumber}>{user?.nida_number || 'N/A'}</Text>
        </View>

        {/* Header */}
        <View style={commonStyles.header}>
          <Image src={TANZANIA_LOGO_BASE64} style={commonStyles.logo} />
          <Text style={commonStyles.country}>JAMHURI YA MUUNGANO WA TANZANIA</Text>
          <Text style={commonStyles.office}>OFISI YA RAIS - TAMISEMI</Text>
          <View style={commonStyles.divider} />
        </View>

        {/* Title */}
        <Text style={commonStyles.title}>{t.title}</Text>

        {/* Personal Information Section */}
        <View style={commonStyles.sectionHeader}>
          <Text style={commonStyles.sectionTitle}>{t.personalInfo}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{lang === 'sw' ? 'Jina Kamili:' : 'Full Name:'}</Text>
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
          <Text style={commonStyles.infoLabel}>{t.maritalStatus}:</Text>
          <Text style={commonStyles.infoValue}>{formData.marital_status || 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.occupation}:</Text>
          <Text style={commonStyles.infoValue}>{formData.occupation || 'N/A'}</Text>
        </View>

        {/* Residence Information Section */}
        <View style={commonStyles.sectionHeader}>
          <Text style={commonStyles.sectionTitle}>{t.residenceInfo}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.council}:</Text>
          <Text style={commonStyles.infoValue}>{formData.council || 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.region}:</Text>
          <Text style={commonStyles.infoValue}>{user?.region || 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.district}:</Text>
          <Text style={commonStyles.infoValue}>{user?.district || 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.ward}:</Text>
          <Text style={commonStyles.infoValue}>{user?.ward || 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.street}:</Text>
          <Text style={commonStyles.infoValue}>{user?.street || 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.neighborhood}:</Text>
          <Text style={commonStyles.infoValue}>{formData.neighborhood || 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.houseNo}:</Text>
          <Text style={commonStyles.infoValue}>{formData.house_number || 'N/A'}</Text>
        </View>

        {/* Purpose Section */}
        <View style={commonStyles.sectionHeader}>
          <Text style={commonStyles.sectionTitle}>{t.purposeInfo}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.purpose}:</Text>
          <Text style={commonStyles.infoValue}>{formData.purpose || 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.institution}:</Text>
          <Text style={commonStyles.infoValue}>{formData.institution_name || 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.institutionType}:</Text>
          <Text style={commonStyles.infoValue}>{formData.institution_type || 'N/A'}</Text>
        </View>

        {/* Signatures */}
        <View style={commonStyles.signatureSection}>
          <View style={commonStyles.signatureBox}>
            <View style={commonStyles.signatureLine} />
            <Text style={commonStyles.signatureName}>{formatFullName(user)}</Text>
            <Text style={commonStyles.signatureTitle}>{t.applicantSig}</Text>
          </View>
          <View style={[commonStyles.signatureBox, { textAlign: 'right', alignItems: 'flex-end' }]}>
            <View style={commonStyles.signatureLine} />
            <Text style={commonStyles.signatureName}>{t.weo}</Text>
            <Text style={commonStyles.signatureTitle}>{t.officerSig}</Text>
          </View>
        </View>

        {/* QR Code */}
        <View style={commonStyles.qrSection}>
          <Image src={qrCodeUrl} style={commonStyles.qrCode} />
          <Text style={commonStyles.qrLabel}>{t.scanVerify}</Text>
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

export default UtambulishoMkaziPDF;
