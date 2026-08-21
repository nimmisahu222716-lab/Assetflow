import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;
  const normalized = status.replace(/\s+/g, '_');
  return (
    <span className={`status-pill status-${normalized}`}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: 'currentColor'
      }}></span>
      {status}
    </span>
  );
};
