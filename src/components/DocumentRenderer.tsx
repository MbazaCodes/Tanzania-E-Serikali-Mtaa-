import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 20, marginBottom: 20, textAlign: 'center' },
  section: { marginBottom: 10 },
  label: { fontSize: 12, fontWeight: 'bold' },
  value: { fontSize: 12, marginBottom: 5 }
});

export const DocumentRenderer: React.FC<{ application: any; service: any }> = ({ application, service }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Certificate</Text>
        <View style={styles.section}>
          <Text style={styles.label}>Application Number:</Text>
          <Text style={styles.value}>{application.application_number}</Text>
        </View>
      </Page>
    </Document>
  );
};

export const DocumentPreview: React.FC<{ application: any; service: any; onClose: () => void }> = ({ 
  application, service, onClose 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Document Preview</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Close</button>
        </div>
        <div className="border p-4 rounded">
          <p>Application: {application.application_number}</p>
          <p>Status: {application.status}</p>
        </div>
      </div>
    </div>
  );
};
