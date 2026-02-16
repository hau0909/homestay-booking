import React from "react";

interface BookingActionsProps {
  status: string;
  onView: () => void;
  onEdit?: () => void;
}

const BookingActions: React.FC<BookingActionsProps> = ({ status, onView, onEdit }) => {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
      {status === 'PENDING' && onEdit && (
        <button
          style={{
            padding: '4px 14px',
            borderRadius: 5,
            background: '#ff9800',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            marginRight: 4,
            transition: 'background 0.18s',
          }}
          onClick={onEdit}
        >
          Edit
        </button>
      )}
      <button
        style={{
          padding: '4px 14px',
          borderRadius: 5,
          background: '#1976d2',
          color: '#fff',
          border: 'none',
          fontWeight: 600,
          fontSize: 14,
          cursor: 'pointer',
          transition: 'background 0.18s',
        }}
        onClick={onView}
      >
        View
      </button>
    </div>
  );
};

export default BookingActions;
