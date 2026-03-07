// trietcmce180982_sprint3
import { supabase } from '@/src/lib/supabase';

export interface Experience {
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

export async function fetchExperiences() {
  const { data, error } = await supabase
    .from('experiences')
    .select('*, experience_slots(start_time, end_time, max_attendees), experience_activities(image_url)');
  if (!error && data) {
    return data.map((exp: any) => ({
      ...exp,
      start_time: exp.experience_slots?.[0]?.start_time,
      end_time: exp.experience_slots?.[0]?.end_time,
      max_attendees: exp.experience_slots?.[0]?.max_attendees,
      image_url: exp.experience_activities?.[0]?.image_url,
    }));
  }
  return [];
}

interface ExperienceForm {
  title: string;
  description: string;
  price_per_person: string | number;
  image_url: string;
}

export async function createExperience(form: ExperienceForm) {
  const { data, error } = await supabase
    .from('experiences')
    .insert([
      {
        title: form.title,
        description: form.description,
        price_per_person: Number(form.price_per_person),
      },
    ])
    .select();
  if (!error && data && data[0]) {
    await supabase
      .from('experience_activities')
      .insert([
        {
          experience_id: data[0].id,
          image_url: form.image_url,
          title: form.title,
          description: form.description,
        },
      ]);
    return true;
  }
  return false;
}

export async function updateExperience(editingId: number, form: ExperienceForm) {
  await supabase
    .from('experiences')
    .update({
      title: form.title,
      description: form.description,
      price_per_person: Number(form.price_per_person),
    })
    .eq('id', editingId);

  // Lấy image_url cũ nếu không nhập ảnh mới
  let imageUrlToUse = form.image_url;
  if (!imageUrlToUse) {
    const { data } = await supabase
      .from('experience_activities')
      .select('image_url')
      .eq('experience_id', editingId)
      .limit(1);
    if (data && data[0] && data[0].image_url) {
      imageUrlToUse = data[0].image_url;
    }
  }
  // Update record cũ
  await supabase
    .from('experience_activities')
    .update({
      image_url: imageUrlToUse,
      title: form.title,
      description: form.description,
    })
    .eq('experience_id', editingId);
  return true;
}

export async function deleteExperience(id: number) {
  await supabase.from('experience_activities').delete().eq('experience_id', id);
  await supabase.from('experiences').delete().eq('id', id);
  return true;
}
