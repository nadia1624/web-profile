/**
 * Client-side helper specifically for uploading document files (PDF, DOC, DOCX).
 * Does NOT compress or convert the file — sends it as-is to the server.
 * Returns the server relative URL or Data URL (if server is read-only).
 */
export async function uploadDocumentFile(file: File): Promise<string> {
  // Only allow document MIME types
  const ALLOWED_DOC_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const ALLOWED_DOC_EXTENSIONS = ['.pdf', '.doc', '.docx'];

  const extension = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
  const isValidType = ALLOWED_DOC_TYPES.includes(file.type) || ALLOWED_DOC_EXTENSIONS.includes(extension);

  if (!isValidType) {
    throw new Error('Format file tidak didukung. Harap gunakan format PDF, DOC, atau DOCX.');
  }

  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB for documents
  if (file.size > MAX_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(`Ukuran file terlalu besar (${sizeMB} MB). Maksimal ukuran file dokumen adalah 10 MB.`);
  }

  // Send raw file as multipart/form-data — no compression
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(result.error || 'Gagal mengunggah file dokumen ke server.');
  }

  if (!result.url) {
    throw new Error('Server tidak mengembalikan URL file yang valid.');
  }

  return result.url;
}
