// trietcmce180982_sprint3
"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/src/lib/supabase';
import CompactSearchBar from "@/src/components/search/CompactSearchBar";

interface Experience {
  id: number;
  title: string;
  description: string;
  price_per_person?: number;
  created_at?: string;
  end_time?: string;
  max_attendees?: number;
  image_url?: string;
}

export default function ExperienceListingsPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperiences = async () => {
      // Join experiences with experience_slots and experience_activities to get image_url
      const { data, error } = await supabase
        .from('experiences')
        .select('*, experience_slots(end_time, max_attendees), experience_activities(image_url)');
      if (!error && data) {
        // Map end_time, max_attendees, image_url from joined tables
        const mapped = data.map((exp: any) => ({
          ...exp,
          end_time: exp.experience_slots?.[0]?.end_time,
          max_attendees: exp.experience_slots?.[0]?.max_attendees,
          image_url: exp.experience_activities?.[0]?.image_url,
        }));
        setExperiences(mapped);
      }
      setLoading(false);
    };
    fetchExperiences();
    const interval = setInterval(fetchExperiences, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="wishlist-page" style={{ minHeight: '100vh', background: '#fff' }}>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 mb-6">
        <div className="max-w-[1920px] mx-auto flex items-center justify-center gap-4">
          <Suspense fallback={<div className="h-10 w-full animate-pulse bg-gray-200 rounded-full max-w-2xl"></div>}>
            <CompactSearchBar isExperience={true} />
          </Suspense>
        </div>
      </header>

      <h2 style={{ fontSize: 32, fontWeight: 700, margin: '32px 0 16px', textAlign: 'center' }}>
        Experience Listings <span style={{ color: '#E53E3E' }}>❤️</span>
      </h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', padding: '0 24px' }}>
        {loading ? (
          <div>Loading...</div>
        ) : experiences.length === 0 ? (
          <div>No experiences found.</div>
        ) : (
          experiences.map((exp: Experience) => (
            <div key={exp.id} style={{ width: 340, background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #eee', padding: 24, marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {exp.image_url ? (
                <img src={exp.image_url} alt={exp.title} width={320} height={200} style={{ borderRadius: 16, objectFit: 'cover', marginBottom: 16, display: 'block' }} />
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
                <p style={{ color: '#888', fontSize: 14 }}>End time: {exp.end_time ? new Date(exp.end_time).toLocaleString() : 'Chưa có'}</p>
                <p style={{ color: '#888', fontSize: 14 }}>Max attendees: {exp.max_attendees !== undefined ? exp.max_attendees : 'Chưa có'}</p>
                <p style={{ color: '#888', fontSize: 14 }}>Added: {exp.created_at ? new Date(exp.created_at).toLocaleDateString() : ''}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

