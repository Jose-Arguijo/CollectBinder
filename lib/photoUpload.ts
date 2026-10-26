import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

type PickResult = {
  uri: string;
} | null;

async function blobFromUri(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return response.blob();
}

export async function takePhoto(): Promise<PickResult> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Camera permission was denied. Please enable it in your settings.');
  }
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [3, 4],
    quality: 0.8,
  });
  if (result.canceled || !result.assets?.[0]) return null;
  return { uri: result.assets[0].uri };
}

export async function pickFromLibrary(): Promise<PickResult> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Photo library permission was denied. Please enable it in your settings.');
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [3, 4],
    quality: 0.8,
  });
  if (result.canceled || !result.assets?.[0]) return null;
  return { uri: result.assets[0].uri };
}

export async function uploadCardPhoto(localUri: string): Promise<string | null> {
  const filename = `card-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

  const blob = await blobFromUri(localUri);

  const { error } = await supabase.storage
    .from('card-photos')
    .upload(filename, blob, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error.message);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('card-photos')
    .getPublicUrl(filename);

  return urlData.publicUrl;
}

export async function deleteCardPhoto(url: string): Promise<void> {
  try {
    const parts = url.split('/card-photos/');
    if (parts.length < 2) return;
    let filename = parts[parts.length - 1];
    const queryIdx = filename.indexOf('?');
    if (queryIdx >= 0) filename = filename.substring(0, queryIdx);
    await supabase.storage.from('card-photos').remove([filename]);
  } catch {
    // best-effort cleanup
  }
}
