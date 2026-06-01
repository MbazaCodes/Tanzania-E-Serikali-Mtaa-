// @ts-nocheck — dynamic form data rendering; fields vary by service type
/**
 * Kibari cha Mazishi PDF
 * Funeral Announcement / Permit
 * 
 * Service: Kibari cha Mazishi
 */
import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { DocumentPDFProps, commonStyles, generateQRCodeUrl, formatFullName, formatDate } from './types';
import { TANZANIA_LOGO_BASE64 } from '@/constants/logo';

// Additional styles for funeral document
const funeralStyles = StyleSheet.create({
  condolenceBox: {
    backgroundColor: '#1c1917',
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  condolenceText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  arabicText: {
    color: '#ffffff',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  deceasedName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  dateRange: {
    textAlign: 'center',
    fontSize: 12,
    color: '#57534e',
    marginBottom: 20,
  },
});

export const KibariMazishiPDF: React.FC<DocumentPDFProps> = ({ application, lang }) => {
  const user = (application as any).users;
  const formData = application.form_data as Record<string, unknown> || {};
  const qrCodeUrl = generateQRCodeUrl(application, 'Kibari cha Mazishi');

  const labels = {
    sw: {
      title: 'KIBARI CHA MAZISHI',
      deceasedInfo: 'TAARIFA ZA MAREHEMU',
      funeralSchedule: 'RATIBA YA MAZISHI',
      familyContact: 'MWASILIANO YA FAMILIA',
      deceasedName: 'Jina Kamili',
      fathersName: 'Jina la Baba',
      mothersName: 'Jina la Mama',
      dateOfBirth: 'Tarehe ya Kuzaliwa',
      dateOfDeath: 'Tarehe ya Kufariki',
      placeOfDeath: 'Mahala pa Kufariki',
      age: 'Umri',
      spouse: 'Mume/Mke',
      bodyLocation: 'Mahala ilipo Maiti',
      funeralDate: 'Tarehe ya Mazishi',
      funeralTime: 'Muda wa Mazishi',
      serviceLocation: 'Mahala pa Huduma',
      burialLocation: 'Mahala pa Kuzika',
      representative: 'Mwakilishi wa Familia',
      phone: 'Simu',
      children: 'Watoto',
      innalillahi: 'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ',
      condolence: 'POLE KWA MSIBA',
      footer: 'Mwenyezi Mungu ailaze roho ya marehemu mahala pema peponi. Amina.',
    },
    en: {
      title: 'FUNERAL PERMIT',
      deceasedInfo: 'DECEASED INFORMATION',
      funeralSchedule: 'FUNERAL SCHEDULE',
      familyContact: 'FAMILY CONTACT',
      deceasedName: 'Full Name',
      fathersName: "Father's Name",
      mothersName: "Mother's Name",
      dateOfBirth: 'Date of Birth',
      dateOfDeath: 'Date of Death',
      placeOfDeath: 'Place of Death',
      age: 'Age',
      spouse: 'Spouse',
      bodyLocation: 'Body Location',
      funeralDate: 'Funeral Date',
      funeralTime: 'Funeral Time',
      serviceLocation: 'Service Location',
      burialLocation: 'Burial Location',
      representative: 'Family Representative',
      phone: 'Phone',
      children: 'Children',
      innalillahi: 'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ',
      condolence: 'CONDOLENCES',
      footer: 'May the Almighty rest the soul of the deceased in eternal peace. Amen.',
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

        {/* Condolence Box */}
        <View style={funeralStyles.condolenceBox}>
          <Text style={funeralStyles.arabicText}>{t.innalillahi}</Text>
          <Text style={funeralStyles.condolenceText}>{t.condolence}</Text>
        </View>

        {/* Deceased Name */}
        <Text style={funeralStyles.deceasedName}>{formData.deceased_full_name || 'N/A'}</Text>
        <Text style={funeralStyles.dateRange}>
          {formData.date_of_birth ? formatDate(formData.date_of_birth) : '?'} - {formatDate(formData.date_of_death)}
        </Text>

        {/* Deceased Information Section */}
        <View style={commonStyles.sectionHeader}>
          <Text style={commonStyles.sectionTitle}>{t.deceasedInfo}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.fathersName}:</Text>
          <Text style={commonStyles.infoValue}>{formData.fathers_name || 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.mothersName}:</Text>
          <Text style={commonStyles.infoValue}>{formData.mothers_name || 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.age}:</Text>
          <Text style={commonStyles.infoValue}>{formData.age_at_death ? `${formData.age_at_death} ${lang === 'sw' ? 'miaka' : 'years'}` : 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.placeOfDeath}:</Text>
          <Text style={commonStyles.infoValue}>{formData.place_of_death || 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.spouse}:</Text>
          <Text style={commonStyles.infoValue}>{formData.surviving_spouse || 'N/A'}</Text>
        </View>

        {/* Funeral Schedule Section */}
        <View style={commonStyles.sectionHeader}>
          <Text style={commonStyles.sectionTitle}>{t.funeralSchedule}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.bodyLocation}:</Text>
          <Text style={commonStyles.infoValue}>{formData.body_location || 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.funeralDate}:</Text>
          <Text style={commonStyles.infoValue}>{formatDate(formData.service_date)}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.funeralTime}:</Text>
          <Text style={commonStyles.infoValue}>{formData.service_time || 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.serviceLocation}:</Text>
          <Text style={commonStyles.infoValue}>{formData.service_location || 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.burialLocation}:</Text>
          <Text style={commonStyles.infoValue}>{formData.burial_location || 'N/A'}</Text>
        </View>

        {/* Family Contact Section */}
        <View style={commonStyles.sectionHeader}>
          <Text style={commonStyles.sectionTitle}>{t.familyContact}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.representative}:</Text>
          <Text style={commonStyles.infoValue}>{formData.family_representative || 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.phone}:</Text>
          <Text style={commonStyles.infoValue}>{formData.representative_phone || 'N/A'}</Text>
        </View>

        {formData.children_names && (
          <View style={commonStyles.infoRow}>
            <Text style={commonStyles.infoLabel}>{t.children}:</Text>
            <Text style={commonStyles.infoValue}>{formData.children_names}</Text>
          </View>
        )}

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

export default KibariMazishiPDF;
