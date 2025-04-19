
/**
 * Get the public URL for a file in Supabase storage
 * @param bucket The storage bucket name
 * @param path The file path within the bucket
 * @returns The public URL for the file
 */
export const getPublicUrl = (bucket: string, path: string): string => {
  return `https://mlmibkkiunueyidehdbt.supabase.co/storage/v1/object/public/${bucket}/${path}`;
};

/**
 * Get the asset URL for a file in the public folder
 * @param path The file path within the public folder
 * @returns The URL for the asset
 */
export const getAssetUrl = (path: string): string => {
  return `/${path}`;
};
