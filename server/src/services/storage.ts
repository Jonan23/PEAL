import { config } from "../config/env.js";

export interface UploadResult {
  url: string;
  key: string;
}

export interface StorageService {
  upload(file: Buffer, key: string, contentType: string): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresIn: number): Promise<string>;
}

export class LocalStorageService implements StorageService {
  private basePath: string;

  constructor(basePath: string = "./uploads") {
    this.basePath = basePath;
  }

  async upload(
    file: Buffer,
    key: string,
    _contentType: string,
  ): Promise<UploadResult> {
    const path = `${this.basePath}/${key}`;
    const dir = path.substring(0, path.lastIndexOf("/"));

    await Bun.file(dir)
      .exists()
      .then(async (exists) => {
        if (!exists) {
          await Bun.write(dir, "");
        }
      })
      .catch(() => {});

    await Bun.write(path, file);

    return {
      url: `/uploads/${key}`,
      key,
    };
  }

  async delete(key: string): Promise<void> {
    const path = `${this.basePath}/${key}`;
    await Bun.file(path).delete();
  }

  async getSignedUrl(key: string, _expiresIn: number): Promise<string> {
    return `/uploads/${key}`;
  }
}

export class S3StorageService implements StorageService {
  private bucket: string;
  private region: string;
  private accessKeyId: string;
  private secretAccessKey: string;
  private endpoint?: string;

  constructor() {
    this.bucket = process.env.STORAGE_BUCKET || "";
    this.region = process.env.STORAGE_REGION || "us-east-1";
    this.accessKeyId = process.env.STORAGE_ACCESS_KEY || "";
    this.secretAccessKey = process.env.STORAGE_SECRET_KEY || "";
    this.endpoint = process.env.STORAGE_ENDPOINT;
  }

  async upload(
    file: Buffer,
    key: string,
    contentType: string,
  ): Promise<UploadResult> {
    const baseUrl =
      this.endpoint || `https://${this.bucket}.s3.${this.region}.amazonaws.com`;
    const url = `${baseUrl}/${key}`;

    return {
      url,
      key,
    };
  }

  async delete(key: string): Promise<void> {
    console.log(`Would delete s3://${this.bucket}/${key}`);
  }

  async getSignedUrl(key: string, expiresIn: number): Promise<string> {
    const baseUrl =
      this.endpoint || `https://${this.bucket}.s3.${this.region}.amazonaws.com`;
    return `${baseUrl}/${key}?expires=${expiresIn}`;
  }
}

export class SupabaseStorageService implements StorageService {
  private url: string;
  private anonKey: string;
  private bucket: string;

  constructor() {
    this.url = process.env.SUPABASE_URL || "";
    this.anonKey = process.env.SUPABASE_ANON_KEY || "";
    this.bucket = process.env.SUPABASE_STORAGE_BUCKET || "uploads";
  }

  async upload(
    file: Buffer,
    key: string,
    contentType: string,
  ): Promise<UploadResult> {
    const response = await fetch(
      `${this.url}/storage/v1/object/${this.bucket}/${key}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.anonKey}`,
          "Content-Type": contentType,
          "x-upsert": "true",
        },
        body: file,
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Supabase upload failed: ${error}`);
    }

    const url = `${this.url}/storage/v1/object/public/${this.bucket}/${key}`;
    return { url, key };
  }

  async delete(key: string): Promise<void> {
    const response = await fetch(
      `${this.url}/storage/v1/object/${this.bucket}/${key}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.anonKey}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to delete file");
    }
  }

  async getSignedUrl(key: string, expiresIn: number): Promise<string> {
    const response = await fetch(
      `${this.url}/storage/v1/object/sign/${this.bucket}/${key}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.anonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expiresIn }),
      },
    );

    if (!response.ok) {
      return `${this.url}/storage/v1/object/public/${this.bucket}/${key}`;
    }

    const data = (await response.json()) as { signedURL?: string };
    return `${this.url}${data.signedURL}`;
  }

  getPublicUrl(key: string): string {
    return `${this.url}/storage/v1/object/public/${this.bucket}/${key}`;
  }
}

export function getStorageService(): StorageService {
  const provider = process.env.STORAGE_PROVIDER || "local";

  switch (provider) {
    case "s3":
      return new S3StorageService();
    case "supabase":
      return new SupabaseStorageService();
    default:
      return new LocalStorageService();
  }
}

export async function generateUploadUrl(
  userId: string,
  fileName: string,
  contentType: string,
): Promise<{ uploadUrl: string; fileUrl: string; key: string }> {
  const storage = getStorageService();
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `uploads/${userId}/${timestamp}-${sanitizedFileName}`;

  const uploadUrl = await storage.getSignedUrl(key, 3600);
  const fileUrl = `/uploads/${key}`;

  return {
    uploadUrl,
    fileUrl,
    key,
  };
}

export function getPublicUrl(key: string): string {
  const provider = process.env.STORAGE_PROVIDER || "local";

  if (provider === "supabase") {
    const url = process.env.SUPABASE_URL || "";
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "uploads";
    return `${url}/storage/v1/object/public/${bucket}/${key}`;
  }

  return `/uploads/${key}`;
}
