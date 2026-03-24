import { supabase } from '../../lib/supabase';

export async function getBanners() {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('is_active', true);

  if (error) throw error;
  return data;
}
