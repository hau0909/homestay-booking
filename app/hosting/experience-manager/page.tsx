"use client";
// trietcmce180982_sprint3
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchExperiences, createExperience, deleteExperience } from '@/src/services/experience/crud';

interface Experience {
  id: number;
  title: string;
  description: string;
  price_per_person?: number;
  created_at?: string;
  start_time?: string;
  end_time?: string;
  max_attendees?: number;
  image_url?: string;
}

export default function HostExperienceManagerPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price_per_person: '',
    image_url: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    handleFetchExperiences();
  }, []);

  const handleFetchExperiences = async () => {
    setLoading(true);
    const data = await fetchExperiences();
    setExperiences(data);
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createExperience(form);
    if (success) {
      setForm({ title: '', description: '', price_per_person: '', image_url: '' });
      handleFetchExperiences();
    }
  };

  // Đã chuyển sang trang edit riêng

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    // Đã chuyển chức năng update sang trang edit riêng, không gọi updateExperience ở đây
    setEditingId(null);
    setForm({ title: '', description: '', price_per_person: '', image_url: '' });
    handleFetchExperiences();
  };

  const handleDelete = async (id: number) => {
    await deleteExperience(id);
    handleFetchExperiences();
  };

  return (
    <div className="wishlist-page" style={{ minHeight: '100vh', background: '#fff' }}>
      <h2 style={{ fontSize: 32, fontWeight: 700, margin: '32px 0 16px', textAlign: 'center' }}>
        Host Experience Manager
      </h2>
      {/* Bỏ phần Add New Experience */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
        {loading ? (
          <div>Loading...</div>
        ) : experiences.length === 0 ? (
          <div>No experiences found.</div>
        ) : (
          experiences.map((exp: Experience) => (
            <div key={exp.id} style={{ width: 340, background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #eee', padding: 24, marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {exp.image_url ? (
                <div style={{ width: 320, height: 200, borderRadius: 16, overflow: 'hidden', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8f8' }}>
                  <img
                    src={exp.image_url}
                    alt={exp.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                  />
                </div>
              ) : (
                <div style={{ width: 320, height: 200, background: '#e5e7eb', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: '#888', fontWeight: 500 }}>
                  No Image Available
                </div>
              )}
              <div style={{ width: '100%', textAlign: 'left' }}>
                <h3 style={{ fontWeight: 700, fontSize: 20 }}>{exp.title || 'No title'}</h3>
                <p style={{ color: '#666', margin: '8px 0' }}>{exp.description || ''}</p>
                <p style={{ color: '#E53E3E', margin: '8px 0' }}>
                  <span role="img" aria-label="price">💰</span> {exp.price_per_person !== undefined ? `${exp.price_per_person.toLocaleString()} VND/người` : 'Chưa có giá'}
                </p>
                <p style={{ color: '#888', fontSize: 14 }}>Start time: {exp.start_time ? new Date(exp.start_time).toLocaleString() : 'Chưa có'}</p>
                <p style={{ color: '#888', fontSize: 14 }}>End time: {exp.end_time ? new Date(exp.end_time).toLocaleString() : 'Chưa có'}</p>
                <p style={{ color: '#888', fontSize: 14 }}>Max attendees: {exp.max_attendees !== undefined ? exp.max_attendees : 'Chưa có'}</p>
                <p style={{ color: '#888', fontSize: 14 }}>Added: {exp.created_at ? new Date(exp.created_at).toLocaleDateString() : ''}</p>
                <div style={{ marginTop: 8 }}>
                  <Link href={`/hosting/experience-manager/edit?id=${exp.id}`} style={{ background: '#67AE6E', color: '#fff', padding: '6px 12px', borderRadius: 6, marginRight: 8, textDecoration: 'none', display: 'inline-block' }}>Edit</Link>
                  <button onClick={() => handleDelete(exp.id)} style={{ background: '#E53E3E', color: '#fff', padding: '6px 12px', borderRadius: 6 }}>Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
