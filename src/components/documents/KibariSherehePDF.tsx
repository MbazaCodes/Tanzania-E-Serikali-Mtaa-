/**
 * Kibari cha Matukio / Sherehe PDF
 * Event / Celebration Permit
 * 
 * Service: Kibari cha Matukio / Sherehe
 */
import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { DocumentPDFProps, commonStyles, generateQRCodeUrl, formatFullName, formatDate } from './types';
import { TANZANIA_LOGO_BASE64 } from '@/constants/logo';

// Additional styles for event permit
const eventStyles = StyleSheet.create({
  eventBanner: {
    backgroundColor: '#ec4899',
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    borderRadius: 4,
  },
  bannerText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  eventName: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#fdf2f8',
    padding: 15,
    marginVertical: 10,
    borderRadius: 4,
  },
  infoIcon: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 10,
    color: '#9d174d',
    marginBottom: 3,
  },
  infoMain: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1c1917',
  },
  infoSub: {
    fontSize: 10,
    color: '#57534e',
    marginTop: 2,
  },
  guestsBox: {
    backgroundColor: '#fce7f3',
    padding: 12,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#ec4899',
    borderRadius: 4,
  },
  guestsLabel: {
    fontSize: 10,
    color: '#9d174d',
  },
  guestsNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#9d174d',
  },
});

export const KibariSherehePDF: React.FC<DocumentPDFProps> = ({ application, lang }) => {
  const user = (application as any).users;
  const formData = application.form_data || {};
  const qrCodeUrl = generateQRCodeUrl(application, 'Kibari cha Matukio / Sherehe');

  // Event type labels
  const eventTypeLabels: Record<string, { sw: string; en: string }> = {
    'HARUSI': { sw: 'Harusi', en: 'Wedding' },
    'HITIMU': { sw: 'Hitimu', en: 'Graduation' },
    'TAMASHA': { sw: 'Tamasha', en: 'Festival' },
    'MKUTANO': { sw: 'Mkutano', en: 'Meeting' },
    'NYINGINEZO': { sw: 'Nyinginezo', en: 'Other' },
  };

  const getEventTypeLabel = (type: string): string => {
    const label = eventTypeLabels[type];
    if (label) return lang === 'sw' ? label.sw : label.en;
    return type;
  };

  // Event type emoji
  const eventEmojis: Record<string, string> = {
    'HARUSI': '💒',
    'HITIMU': '🎓',
    'TAMASHA': '🎉',
    'MKUTANO': '🤝',
    'NYINGINEZO': '📋',
  };

  const labels = {
    sw: {
      title: 'KIBALI CHA MATUKIO / SHEREHE',
      permitApproved: 'KIBALI KIMEIDHINISHWA',
      eventInfo: 'TAARIFA ZA TUKIO',
      venueInfo: 'MAHALI NA MUDA',
      contactInfo: 'MWASILIANO',
      eventType: 'Aina ya Tukio',
      eventName: 'Jina la Tukio',
      venue: 'Ukumbi / Eneo',
      date: 'Tarehe',
      time: 'Muda',
      guests: 'Wageni Wanaotarajiwa',
      organizer: 'Msimamizi',
      phone: 'Simu',
      whatsapp: 'WhatsApp Group',
      applicantName: 'Mwombaji',
      nida: 'NIDA',
      organizerSig: 'Sahihi ya Msimamizi',
      officerSig: 'Afisa Mtendaji',
      footer: 'Kibali hiki ni halali kwa tarehe na muda uliotajwa tu. Zingatia amani na utulivu.',
    },
    en: {
      title: 'EVENT / CELEBRATION PERMIT',
      permitApproved: 'PERMIT APPROVED',
      eventInfo: 'EVENT INFORMATION',
      venueInfo: 'VENUE AND TIME',
      contactInfo: 'CONTACT INFORMATION',
      eventType: 'Event Type',
      eventName: 'Event Name',
      venue: 'Venue',
      date: 'Date',
      time: 'Time',
      guests: 'Expected Guests',
      organizer: 'Organizer',
      phone: 'Phone',
      whatsapp: 'WhatsApp Group',
      applicantName: 'Applicant',
      nida: 'NIDA',
      organizerSig: 'Organizer Signature',
      officerSig: 'Executive Officer',
      footer: 'This permit is valid only for the specified date and time. Maintain peace and order.',
    }
  };

  const t = labels[lang];
  const eventEmoji = eventEmojis[formData.event_type] || '📋';

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

        {/* Event Banner */}
        <View style={eventStyles.eventBanner}>
          <Text style={eventStyles.bannerText}>✓ {t.permitApproved}</Text>
          <Text style={eventStyles.eventName}>{formData.event_name || 'N/A'}</Text>
        </View>

        {/* Event Type Card */}
        <View style={eventStyles.infoCard}>
          <View style={eventStyles.infoIcon}>
            <Text style={eventStyles.iconText}>{eventEmoji}</Text>
          </View>
          <View style={eventStyles.infoContent}>
            <Text style={eventStyles.infoTitle}>{t.eventType}</Text>
            <Text style={eventStyles.infoMain}>{getEventTypeLabel(formData.event_type)}</Text>
            <Text style={eventStyles.infoSub}>{formData.event_name}</Text>
          </View>
        </View>

        {/* Venue and Time Card */}
        <View style={eventStyles.infoCard}>
          <View style={eventStyles.infoIcon}>
            <Text style={eventStyles.iconText}>📍</Text>
          </View>
          <View style={eventStyles.infoContent}>
            <Text style={eventStyles.infoTitle}>{t.venue}</Text>
            <Text style={eventStyles.infoMain}>{formData.venue || 'N/A'}</Text>
            <Text style={eventStyles.infoSub}>
              {formatDate(formData.start_date)} | {formData.start_time || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Expected Guests */}
        <View style={eventStyles.guestsBox}>
          <Text style={eventStyles.guestsLabel}>{t.guests}</Text>
          <Text style={eventStyles.guestsNumber}>{formData.expected_guests || '0'}</Text>
        </View>

        {/* Contact Information */}
        <View style={commonStyles.sectionHeader}>
          <Text style={commonStyles.sectionTitle}>{t.contactInfo}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.applicantName}:</Text>
          <Text style={commonStyles.infoValue}>{formatFullName(user)}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.nida}:</Text>
          <Text style={commonStyles.infoValue}>{user?.nida_number || 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.organizer}:</Text>
          <Text style={commonStyles.infoValue}>{formData.contact_person || 'N/A'}</Text>
        </View>

        <View style={commonStyles.infoRow}>
          <Text style={commonStyles.infoLabel}>{t.phone}:</Text>
          <Text style={commonStyles.infoValue}>{formData.contact_phone || 'N/A'}</Text>
        </View>

        {formData.whatsapp_group && (
          <View style={commonStyles.infoRow}>
            <Text style={commonStyles.infoLabel}>{t.whatsapp}:</Text>
            <Text style={commonStyles.infoValue}>{formData.whatsapp_group}</Text>
          </View>
        )}

        {/* Signatures */}
        <View style={commonStyles.signatureSection}>
          <View style={commonStyles.signatureBox}>
            <View style={commonStyles.signatureLine} />
            <Text style={commonStyles.signatureName}>{formData.contact_person || formatFullName(user)}</Text>
            <Text style={commonStyles.signatureTitle}>{t.organizerSig}</Text>
          </View>
          <View style={[commonStyles.signatureBox, { textAlign: 'right', alignItems: 'flex-end' }]}>
            <View style={commonStyles.signatureLine} />
            <Text style={commonStyles.signatureName}>{t.officerSig.toUpperCase()}</Text>
            <Text style={commonStyles.signatureTitle}>{lang === 'sw' ? 'Sahihi na Muhuri' : 'Signature & Stamp'}</Text>
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

export default KibariSherehePDF;
