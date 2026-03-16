// trietcmce180982_sprint3
import React, { useState } from "react";
import { supabase } from "@/src/lib/supabase";

interface ExperienceBooking {
  id: string;
  experience_id: string;
  user_id: string;
  status: string;
  booking_date: string;
  price: number;
  experienceTitle?: string;
  slot_start_time?: string;
  slot_end_time?: string;
  attendees?: number;
}

interface ExperienceBookingActionsProps {
  booking: ExperienceBooking;
  statusFilter?: string;
}

const ExperienceBookingActions: React.FC<ExperienceBookingActionsProps> = ({ booking, statusFilter }) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const handleStatusChange = async (newStatus: "CONFIRMED" | "CANCELLED") => {
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", booking.id);
      if (error) {
        setActionError("Update failed: " + error.message);
      } else {
        setActionSuccess("Status updated successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 800);
      }
    } catch (err: any) {
      setActionError("Update failed: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const [showActions, setShowActions] = useState(false);
  // Nếu tab CONFIRMED thì chỉ hiện nút Edit và COMPLETED
  if (statusFilter === 'CONFIRMED') {
    return (
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
        {!showActions ? (
          <button
            style={{ padding: '8px 24px', borderRadius: 8, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #1976d233', transition: 'background 0.18s, box-shadow 0.18s' }}
            onClick={() => setShowActions(true)}
          >Edit</button>
        ) : (
          <>
            <button
              style={{ padding: '8px 24px', borderRadius: 8, background: '#43a047', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, cursor: actionLoading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px #43a04733', transition: 'background 0.18s, box-shadow 0.18s' }}
              disabled={actionLoading}
              onClick={async () => {
                setActionLoading(true);
                setActionError("");
                setActionSuccess("");
                try {
                  const { error } = await supabase
                    .from("bookings")
                    .update({ status: "COMPLETED" })
                    .eq("id", booking.id);
                  if (error) {
                    setActionError("Update failed: " + error.message);
                  } else {
                    setActionSuccess("Status updated to COMPLETED!");
                    setTimeout(() => { window.location.reload(); }, 800);
                  }
                } catch (err: any) {
                  setActionError("Update failed: " + err.message);
                } finally {
                  setActionLoading(false);
                }
              }}
            >COMPLETED</button>
            <button
              style={{ padding: '6px 16px', borderRadius: 8, background: '#e3e8ee', color: '#222', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginLeft: 12 }}
              onClick={() => setShowActions(false)}
            >Cancel</button>
          </>
        )}
        {actionError && <span style={{ color: 'red', marginLeft: 8 }}>{actionError}</span>}
        {actionSuccess && <span style={{ color: 'green', marginLeft: 8 }}>{actionSuccess}</span>}
      </div>
    );
  }
  // Mặc định (tab PENDING)
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
      {!showActions ? (
        <button
          style={{ padding: '8px 24px', borderRadius: 8, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #1976d233', transition: 'background 0.18s, box-shadow 0.18s' }}
          disabled={booking.status !== 'PENDING'}
          onClick={() => setShowActions(true)}
        >Edit</button>
      ) : (
        <>
          <button
            style={{ padding: '8px 24px', borderRadius: 8, background: '#43a047', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, cursor: actionLoading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px #43a04733', transition: 'background 0.18s, box-shadow 0.18s' }}
            disabled={actionLoading}
            onClick={() => handleStatusChange("CONFIRMED")}
          >Confirm</button>
          <button
            style={{ padding: '8px 24px', borderRadius: 8, background: '#e53935', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, cursor: actionLoading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px #e5393533', transition: 'background 0.18s, box-shadow 0.18s', marginLeft: 12 }}
            disabled={actionLoading}
            onClick={() => handleStatusChange("CANCELLED")}
          >Reject</button>
          <button
            style={{ padding: '6px 16px', borderRadius: 8, background: '#e3e8ee', color: '#222', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginLeft: 12 }}
            onClick={() => setShowActions(false)}
          >Cancel</button>
        </>
      )}
      {actionError && <span style={{ color: 'red', marginLeft: 8 }}>{actionError}</span>}
      {actionSuccess && <span style={{ color: 'green', marginLeft: 8 }}>{actionSuccess}</span>}
    </div>
  );
};

export default ExperienceBookingActions;
