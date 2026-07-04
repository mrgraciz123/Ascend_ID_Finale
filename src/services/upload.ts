export class UploadService {
 /**
 * Securely uploads a file to Cloudinary via the Next.js API route.
 * @param file The File object to upload
 * @returns The secure URL of the uploaded file
 */
 static async uploadFile(file: File): Promise<string> {
 const formData = new FormData();
 formData.append("file", file);

 const response = await fetch("/api/upload", {
 method: "POST",
 body: formData,
 });

 const data = await response.json();

 if (!response.ok || !data.success) {
 throw new Error(data.error || "File upload failed");
 }

 return data.url;
 }
}
