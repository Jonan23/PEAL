import { api } from "./client";
import type { ProgressCallback } from "./types";

export interface UploadResult {
  url: string;
  key: string;
  fileName: string;
  contentType: string;
}

export async function uploadFile(
  file: File,
  type: "video" | "image",
  onProgress?: ProgressCallback,
): Promise<UploadResult> {
  const contentType = file.type;
  const fileName = file.name;

  const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];

  if (type === "image" && !allowedImageTypes.includes(contentType)) {
    throw new Error("Invalid image type. Allowed: JPEG, PNG, GIF, WebP");
  }

  if (type === "video" && !allowedVideoTypes.includes(contentType)) {
    throw new Error("Invalid video type. Allowed: MP4, WebM, MOV");
  }

  const maxSize = type === "video" ? 500 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(
      `File too large. Max size: ${type === "video" ? "500MB" : "10MB"}`,
    );
  }

  const presignedResponse = await api.post<{
    uploadUrl: string;
    fileUrl: string;
    key: string;
    maxSize: number;
  }>("/api/uploads/presigned-url", {
    fileName,
    contentType,
  });

  const { uploadUrl, fileUrl, key } = presignedResponse;

  await uploadToUrl(uploadUrl, file, contentType, onProgress);

  const completeResponse = await api.post<UploadResult>(
    "/api/uploads/complete",
    {
      key,
      fileName,
      contentType,
    },
  );

  return {
    ...completeResponse,
    url: fileUrl,
  };
}

async function uploadToUrl(
  url: string,
  file: File,
  contentType: string,
  onProgress?: ProgressCallback,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed"));
    });

    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.send(file);
  });
}

export function validateVideoFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"];
  const maxSize = 500 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid video type. Allowed: MP4, WebM, MOV",
    };
  }

  if (file.size > maxSize) {
    return { valid: false, error: "Video too large. Max size: 500MB" };
  }

  return { valid: true };
}

export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const maxSize = 10 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid image type. Allowed: JPEG, PNG, GIF, WebP",
    };
  }

  if (file.size > maxSize) {
    return { valid: false, error: "Image too large. Max size: 10MB" };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${bytes} B`;
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

export function generateThumbnail(
  file: File,
  time: number = 0,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      video.currentTime = time;
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      URL.revokeObjectURL(video.src);
      resolve(dataUrl);
    };

    video.onerror = () => {
      reject(new Error("Failed to generate thumbnail"));
    };

    video.src = URL.createObjectURL(file);
  });
}

export async function dataUrlToFile(
  dataUrl: string,
  filename: string,
): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: "image/jpeg" });
}
