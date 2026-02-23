import React from "react";

interface BookingViewModalProps {
  open: boolean;
  onClose: () => void;
  booking: any | null;
  listing: any | null;
}

const BookingViewModal: React.FC<BookingViewModalProps> = ({ open, onClose, booking, listing }) => {
  if (!open || !booking || !listing) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: '#fff', borderRadius: 16, minWidth: 720, padding: 32, boxShadow: '0 8px 32px #0002', position: 'relative', display: 'flex', gap: 36 }}>
        {/* Thông tin người đặt */}
        <div style={{ flex: 1, minWidth: 320, background: '#f7fafd', borderRadius: 12, boxShadow: '0 2px 8px #328e6e22', padding: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 18, color: '#328E6E', letterSpacing: 0.2 }}>Thông tin người đặt</h3>
          <div style={{ marginBottom: 12 }}><span style={{ fontWeight: 600, color: '#222' }}>Booking ID:</span> <span style={{ color: '#555' }}>{booking.id}</span></div>
          <div style={{ marginBottom: 12 }}><span style={{ fontWeight: 600, color: '#222' }}>Tên khách:</span> <span style={{ color: '#555' }}>{booking.guest_name || booking.name || 'N/A'}</span></div>
          <div style={{ marginBottom: 12 }}><span style={{ fontWeight: 600, color: '#222' }}>Email:</span> <span style={{ color: '#555' }}>{booking.guest_email || booking.email || 'N/A'}</span></div>
          <div style={{ marginBottom: 12 }}><span style={{ fontWeight: 600, color: '#222' }}>Số điện thoại:</span> <span style={{ color: '#555' }}>{booking.guest_phone || booking.phone || 'N/A'}</span></div>
          <div style={{ marginBottom: 12 }}><span style={{ fontWeight: 600, color: '#222' }}>Địa chỉ:</span> <span style={{ color: '#555' }}>{booking.guest_address || booking.address || 'N/A'}</span></div>
          <div style={{ marginBottom: 12 }}><span style={{ fontWeight: 600, color: '#222' }}>Check-in:</span> <span style={{ color: '#555' }}>{booking.check_in_date}</span></div>
          <div style={{ marginBottom: 12 }}><span style={{ fontWeight: 600, color: '#222' }}>Check-out:</span> <span style={{ color: '#555' }}>{booking.check_out_date}</span></div>
          <div style={{ marginBottom: 12 }}><span style={{ fontWeight: 600, color: '#222' }}>Status:</span> <span style={{ color: '#555' }}>{booking.status}</span></div>
        </div>
        {/* Thông tin phòng */}
        <div style={{ flex: 1, minWidth: 320, background: '#f7fafd', borderRadius: 12, boxShadow: '0 2px 8px #328e6e22', padding: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 18, color: '#328E6E', letterSpacing: 0.2 }}>Thông tin phòng</h3>
          <div style={{ marginBottom: 12 }}><span style={{ fontWeight: 600, color: '#222' }}>Listing ID:</span> <span style={{ color: '#555' }}>{listing.id}</span></div>
          <div style={{ marginBottom: 12 }}><span style={{ fontWeight: 600, color: '#222' }}>Title:</span> <span style={{ color: '#555' }}>{listing.title}</span></div>
          <div style={{ marginBottom: 12 }}><span style={{ fontWeight: 600, color: '#222' }}>Address:</span> <span style={{ color: '#555' }}>{listing.address_detail || listing.address || 'N/A'}</span></div>
          <div style={{ marginBottom: 12 }}><span style={{ fontWeight: 600, color: '#222' }}>Max Guests:</span> <span style={{ color: '#555' }}>{listing.max_guests || 'N/A'}</span></div>
          <div style={{ marginBottom: 12 }}><span style={{ fontWeight: 600, color: '#222' }}>Price (weekday):</span> <span style={{ color: '#555' }}>${listing.price_weekday || 'N/A'}</span></div>
          <div style={{ marginBottom: 12 }}><span style={{ fontWeight: 600, color: '#222' }}>Price (weekend):</span> <span style={{ color: '#555' }}>${listing.price_weekend || 'N/A'}</span></div>
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

export default BookingViewModal;
