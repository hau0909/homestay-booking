"use client";
// trietcmce180982_sprint3
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchExperiences, updateExperience } from '@/src/services/experience/crud';
import { supabase } from '@/src/lib/supabase';

export default function EditExperiencePage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const id = Number(searchParams.get('id'));
	const [form, setForm] = useState({
		title: '',
		description: '',
		price_per_person: '',
		image_url: '',
		start_time: '',
		end_time: '',
		max_attendees: '',
	});
	const [loading, setLoading] = useState(true);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>('');

	useEffect(() => {
		const fetchData = async () => {
			const { data, error } = await supabase
				.from('experiences')
				.select('*, experience_slots(start_time, end_time, max_attendees), experience_activities(image_url)')
				.eq('id', id)
				.single();
			if (!error && data) {
				setForm({
					title: data.title || '',
					description: data.description || '',
					price_per_person: data.price_per_person?.toString() || '',
					image_url: data.experience_activities?.[0]?.image_url || '',
					start_time: data.experience_slots?.[0]?.start_time || '',
					end_time: data.experience_slots?.[0]?.end_time || '',
					max_attendees: data.experience_slots?.[0]?.max_attendees?.toString() || '',
				});
			}
			setLoading(false);
		};
		if (id) fetchData();
	}, [id]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImageFile(file);
			setPreviewUrl(URL.createObjectURL(file));
		}
	};

	const handleUpdate = async (e: React.FormEvent) => {
		e.preventDefault();
		let imageUrl = form.image_url;
		if (imageFile) {
			// Upload image to Supabase Storage
			const fileExt = imageFile.name.split('.').pop();
			const fileName = `experience_${id}_${Date.now()}.${fileExt}`;
			const { data: uploadData, error: uploadError } = await supabase.storage
				.from('experience-images')
				.upload(fileName, imageFile, { upsert: true });
			if (!uploadError && uploadData) {
				const { data: publicUrlData } = supabase.storage
					.from('experience-images')
					.getPublicUrl(fileName);
				imageUrl = publicUrlData?.publicUrl || imageUrl;
			}
		}
		await updateExperience(id, {
			title: form.title,
			description: form.description,
			price_per_person: form.price_per_person,
			image_url: imageUrl,
		});
		// Update experience_slots
		await supabase
			.from('experience_slots')
			.update({
				start_time: form.start_time ? new Date(form.start_time).toISOString() : null,
				end_time: form.end_time ? new Date(form.end_time).toISOString() : null,
				max_attendees: Number(form.max_attendees),
			})
			.eq('experience_id', id);
		router.push('/hosting/experience-manager');
	};

	if (loading) return <div>Loading...</div>;

	return (
		<div style={{ maxWidth: 600, margin: '40px auto', background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 2px 12px #eee' }}>
			<h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, color: '#328E6E', textAlign: 'center' }}>Edit Experience</h2>
			<form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
				<label style={{ fontWeight: 500, marginBottom: 4 }}>Tên trải nghiệm</label>
				<input name="title" value={form.title} onChange={handleInputChange} placeholder="Nhập tên trải nghiệm" style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: 16 }} required />
				<label style={{ fontWeight: 500, marginBottom: 4 }}>Mô tả</label>
				<textarea name="description" value={form.description} onChange={handleInputChange} placeholder="Nhập mô tả" style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: 16 }} required />
				<label style={{ fontWeight: 500, marginBottom: 4 }}>Giá tiền (VND/người)</label>
				<input name="price_per_person" value={form.price_per_person} onChange={handleInputChange} placeholder="Nhập giá tiền" type="number" style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: 16 }} required />
				{/* Bỏ phần chỉnh sửa ảnh trải nghiệm */}
				<label style={{ fontWeight: 500, marginBottom: 4 }}>Thời gian bắt đầu</label>
				<input name="start_time" value={form.start_time} onChange={handleInputChange} placeholder="Chọn thời gian bắt đầu" type="datetime-local" style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: 16 }} />
				<label style={{ fontWeight: 500, marginBottom: 4 }}>Thời gian kết thúc</label>
				<input name="end_time" value={form.end_time} onChange={handleInputChange} placeholder="Chọn thời gian kết thúc" type="datetime-local" style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: 16 }} />
				<label style={{ fontWeight: 500, marginBottom: 4 }}>Số lượng tối đa</label>
				<input name="max_attendees" value={form.max_attendees} onChange={handleInputChange} placeholder="Nhập số lượng tối đa" type="number" style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: 16 }} />
				<button type="submit" style={{ background: '#328E6E', color: '#fff', padding: '12px 0', borderRadius: 8, fontSize: 18, fontWeight: 600, marginTop: 8 }}>Cập nhật</button>
			</form>
		</div>
	);
}
