import React from "react";

interface EditBookingStatusModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (status: string) => void;
}

const STATUS_OPTIONS = ["CONFIRMED", "COMPLETED", "CANCELLED"];

const EditBookingStatusModal: React.FC<EditBookingStatusModalProps> = ({ open, onClose, onSelect }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: '#fff', borderRadius: 12, minWidth: 320, padding: 28, boxShadow: '0 8px 32px #0002', position: 'relative' }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 18, color: '#222' }}>Cập nhật trạng thái booking</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => onSelect(status)}
              style={{
                padding: '10px 0',
                borderRadius: 7,
                border: '1.5px solid #e3e8ee',
                background: '#f7fafd',
                color: '#222',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                transition: 'all 0.18s',
              }}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 10, right: 16, background: 'none', border: 'none', color: '#888', fontSize: 22, cursor: 'pointer', fontWeight: 700
          }}
        >×</button>
      </div>
    </div>
  );
};

export default EditBookingStatusModal;
