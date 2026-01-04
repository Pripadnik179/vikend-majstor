import { Response } from "express";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, "uploads");
const PUBLIC_DIR = path.join(UPLOADS_DIR, "public");
const TEMP_DIR = path.join(UPLOADS_DIR, "temp");

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB max file size

function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

function sanitizePath(inputPath: string, baseDir: string): string | null {
  const cleanPath = inputPath.replace(/\.\./g, "").replace(/\/+/g, "/");
  const fullPath = path.join(baseDir, cleanPath);
  const normalizedPath = path.normalize(fullPath);
  
  if (!normalizedPath.startsWith(baseDir)) {
    return null;
  }
  return normalizedPath;
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDir(PUBLIC_DIR);
ensureDir(TEMP_DIR);

export class LocalNotFoundError extends Error {
  constructor() {
    super("File not found");
    this.name = "LocalNotFoundError";
    Object.setPrototypeOf(this, LocalNotFoundError.prototype);
  }
}

interface FileMetadata {
  contentType: string;
  size: number;
  owner?: string;
  createdAt: string;
}

export class LocalStorageService {
  constructor() {
    ensureDir(PUBLIC_DIR);
    ensureDir(TEMP_DIR);
  }

  async searchPublicObject(filePath: string): Promise<string | null> {
    const fullPath = path.join(PUBLIC_DIR, filePath);
    const normalizedPath = path.normalize(fullPath);
    
    if (!normalizedPath.startsWith(PUBLIC_DIR)) {
      return null;
    }
    
    if (fs.existsSync(normalizedPath)) {
      return normalizedPath;
    }
    return null;
  }

  async downloadObject(filePath: string, res: Response, cacheTtlSec: number = 3600): Promise<void> {
    try {
      const stats = fs.statSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      
      const mimeTypes: Record<string, string> = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
        ".pdf": "application/pdf",
      };
      
      const contentType = mimeTypes[ext] || "application/octet-stream";
      
      res.set({
        "Content-Type": contentType,
        "Content-Length": stats.size,
        "Cache-Control": `public, max-age=${cacheTtlSec}`,
      });

      const stream = fs.createReadStream(filePath);
      
      stream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });

      stream.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }

  generateUploadId(): string {
    return randomUUID();
  }

  getTempPath(uploadId: string): string {
    return path.join(TEMP_DIR, uploadId);
  }

  getPublicPath(uploadId: string): string {
    return path.join(PUBLIC_DIR, uploadId);
  }

  async saveUploadedFile(
    uploadId: string,
    fileBuffer: Buffer,
    contentType: string,
    userId: string
  ): Promise<string> {
    if (!isValidUUID(uploadId)) {
      throw new Error("Invalid upload ID format");
    }
    
    if (fileBuffer.length > MAX_FILE_SIZE) {
      throw new Error("File too large (max 10MB)");
    }
    
    const publicPath = sanitizePath(uploadId, PUBLIC_DIR);
    if (!publicPath) {
      throw new Error("Invalid file path");
    }
    
    fs.writeFileSync(publicPath, fileBuffer);
    
    const metadata: FileMetadata = {
      contentType,
      size: fileBuffer.length,
      owner: userId,
      createdAt: new Date().toISOString(),
    };
    fs.writeFileSync(`${publicPath}.meta.json`, JSON.stringify(metadata));
    
    return `/objects/uploads/${uploadId}`;
  }

  async getObjectEntityFile(objectPath: string): Promise<string> {
    if (!objectPath.startsWith("/objects/")) {
      throw new LocalNotFoundError();
    }

    const relativePath = objectPath.replace("/objects/", "");
    const fullPath = path.join(PUBLIC_DIR, relativePath);
    const normalizedPath = path.normalize(fullPath);
    
    if (!normalizedPath.startsWith(PUBLIC_DIR)) {
      throw new LocalNotFoundError();
    }
    
    if (!fs.existsSync(normalizedPath)) {
      throw new LocalNotFoundError();
    }
    
    return normalizedPath;
  }

  normalizeObjectEntityPath(rawPath: string): string {
    if (rawPath.startsWith("/objects/")) {
      return rawPath;
    }
    
    if (rawPath.startsWith("uploads/")) {
      return `/objects/${rawPath}`;
    }
    
    return rawPath;
  }

  async trySetObjectEntityAclPolicy(
    objectPath: string,
    _aclPolicy: { owner: string; visibility: string }
  ): Promise<string> {
    return this.normalizeObjectEntityPath(objectPath);
  }
}

export const localStorageService = new LocalStorageService();
