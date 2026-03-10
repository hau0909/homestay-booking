import React, { useState, useEffect } from "react";
import { supabase } from "@/src/lib/supabase";

interface Fee {
  id: number;
  title: string;
  price: number;
}

interface EditBookingStatusModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (status: string, totalPrice?: number) => void;
  currentStatus?: string;
  listing_id?: string;
  total_price?: number;
}

const EditBookingStatusModal: React.FC<EditBookingStatusModalProps> = ({ 
  open, 
  onClose, 
  onSelect, 
  currentStatus,
  listing_id,
  total_price = 0
}) => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [selectedFees, setSelectedFees] = useState<number[]>([]);
  const [showFeesDropdown, setShowFeesDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch fees khi modal mở và status là CONFIRMED
  useEffect(() => {
    if (open && currentStatus === 'CONFIRMED' && listing_id) {
      fetchFees();
    }
  }, [open, currentStatus, listing_id]);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("fees")
        .select("id, title, price")
        .eq("listing_id", listing_id);
      
      if (error) throw error;
      setFees(data || []);
    } catch (err) {
      console.error("Error fetching fees:", err);
    } finally {
      setLoading(false);
    }
  };

  // Tính tổng giá
  const calculateTotal = () => {
    const selectedFeesPrices = fees
      .filter(fee => selectedFees.includes(fee.id))
      .reduce((sum, fee) => sum + fee.price, 0);
    return total_price + selectedFeesPrices;
  };

  // Lọc status options dựa vào current status
  const getStatusOptions = () => {
    if (currentStatus === 'CONFIRMED') {
      return ["COMPLETED"];
    }
    if (currentStatus === 'PENDING') {
      return ["CONFIRMED", "CANCELLED"];
    }
    // Fallback if needed
    return ["CONFIRMED", "COMPLETED", "CANCELLED"];
  };

  const STATUS_OPTIONS = getStatusOptions();
  const totalAmount = calculateTotal();

  const handleSelectStatus = (status: string) => {
    if (status === 'COMPLETED' && currentStatus === 'CONFIRMED') {
      // Khi completed từ confirmed, truyền total price với fees
      onSelect(status, totalAmount);
    } else {
      onSelect(status);
    }
  };

  const toggleFeeSelection = (feeId: number) => {
    setSelectedFees(prev => 
      prev.includes(feeId) 
        ? prev.filter(id => id !== feeId)
        : [...prev, feeId]
    );
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: '#fff', borderRadius: 12, minWidth: 800, maxWidth: '90vw', padding: 28, boxShadow: '0 8px 32px #0002', position: 'relative', maxHeight: '80vh', overflowY: 'auto' }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 18, color: '#222' }}>Update booking status</h3>
        
        {/* Status Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => handleSelectStatus(status)}
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

        {/* Fees Section - chỉ hiển thị khi status là CONFIRMED */}
        {currentStatus === 'CONFIRMED' && (
          <>
            <div style={{ borderTop: '1.5px solid #e3e8ee', paddingTop: 20, marginBottom: 20, display: 'flex', gap: 24 }}>
              {/* Fees Dropdown Button - Left Side */}
              <div style={{ flex: 0.4, position: 'relative' }}>
                <button
                  onClick={() => setShowFeesDropdown(!showFeesDropdown)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 7,
                    border: '1.5px solid #e3e8ee',
                    background: '#f7fafd',
                    color: '#222',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.18s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#eff3f8'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#f7fafd'}
                >
                  <span>Fees {selectedFees.length > 0 && `(${selectedFees.length})`}</span>
                  <span style={{ fontSize: 18 }}>{showFeesDropdown ? '▼' : '▶'}</span>
                </button>
              </div>

              {/* Fees List - Right Side */}
              <div style={{ flex: 0.6 }}>
                {showFeesDropdown && (
                  <div style={{
                    background: '#fff',
                    border: '1.5px solid #e3e8ee',
                    borderRadius: '7px',
                    padding: '8px 0',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  }}>
                    {loading ? (
                      <div style={{ padding: '12px 16px', color: '#999' }}>Loading fees...</div>
                    ) : fees.length === 0 ? (
                      <div style={{ padding: '12px 16px', color: '#999' }}>No fees available</div>
                    ) : (
                      fees.map(fee => (
                        <div
                          key={fee.id}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid #f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            cursor: 'pointer',
                            transition: 'background 0.18s',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = '#f7fafd'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                          onClick={() => toggleFeeSelection(fee.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedFees.includes(fee.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleFeeSelection(fee.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              width: 18,
                              height: 18,
                              cursor: 'pointer',
                              accentColor: '#328E6E',
                            }}
                          />
                          <div style={{ flex: 1 }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ fontWeight: 600, color: '#222' }}>{fee.title}</div>
                          </div>
                          <div style={{ fontWeight: 700, color: '#328E6E' }} onClick={(e) => e.stopPropagation()}>${fee.price}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Total Section */}
            <div style={{
              background: '#f0f4f8',
              borderRadius: 7,
              padding: '16px',
              marginTop: 16,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#666', fontSize: 14 }}>Listing Price:</span>
                <span style={{ fontWeight: 700, color: '#222' }}>${total_price}</span>
              </div>
              {selectedFees.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#666', fontSize: 14 }}>Fees:</span>
                  <span style={{ fontWeight: 700, color: '#222' }}>
                    ${fees
                      .filter(fee => selectedFees.includes(fee.id))
                      .reduce((sum, fee) => sum + fee.price, 0)}
                  </span>
                </div>
              )}
              <div style={{ borderTop: '1.5px solid #e3e8ee', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: '#222', fontSize: 15 }}>Total:</span>
                <span style={{ fontWeight: 700, color: '#328E6E', fontSize: 18 }}>${totalAmount}</span>
              </div>
            </div>
          </>
        )}

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
