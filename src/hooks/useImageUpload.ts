import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File, userId: string, folder: string = "general"): Promise<string | null> => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${userId}/${folder}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("event-images").upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("event-images").getPublicUrl(fileName);
      return data.publicUrl;
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading };
}
