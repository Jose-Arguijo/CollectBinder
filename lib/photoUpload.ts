import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';

export async function takePhoto(): Promise<ImagePicker.ImagePickerResult | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [3, 4],
    quality: 0.8,
  });
  return result.canceled ? null : result;
}

export async function pickFromLibrary(): Promise<ImagePicker.ImagePickerResult | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [3, 4],
    quality: 0.8,
  });
  return result.canceled ? null : result;
}

export async function uploadCardPhoto(localUri: string): Promise<string | null> {
  const filename = `card-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
  const formData = new FormData();
  formData.append('file', {
    uri: localUri,
    name: filename,
    type: 'image/jpeg',
  } as any);

  const { error } = await supabase.storage
    .from('card-photos')
    .upload(filename, formData);

  if (error) return null;

  const { data: urlData } = supabase.storage
    .from('card-photos')
    .getPublicUrl(filename);

  return urlData.publicUrl;
}

export async function deleteCardPhoto(url: string): Promise<void> {
  const parts = url.split('/card-photos/');
  if (parts.length < 2) return;
  const filename = parts[parts.length - 1];
  await supabase.storage.from('card-photos').remove([filename]);
}
