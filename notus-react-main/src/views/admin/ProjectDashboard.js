import React from 'react';

export default function ProjectDashboard() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{
        background: 'linear-gradient(135deg, #003061, #0078d4)',
        color: 'white',
        borderRadius: 16,
        padding: 20,
        boxShadow: '0 12px 30px rgba(0,48,97,0.25)',
        marginBottom: 16
      }}>
        <div style={{ fontSize: 24, fontWeight: 900 }}>Project Dashboard</div>
        <div style={{ opacity: 0.9, marginTop: 6 }}>Résumé projets et indicateurs clés</div>
      </div>

      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
        Contenu à venir.
      </div>
    </div>
  );
}
