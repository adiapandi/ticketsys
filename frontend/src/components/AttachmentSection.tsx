import { useEffect, useRef, useState } from 'react';
import { attachmentsApi, Attachment } from '../api/tickets';
import { api } from '../api/client';

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mimetype: string) {
  if (mimetype.startsWith('image/')) return '🖼️';
  if (mimetype === 'application/pdf') return '📄';
  if (mimetype.includes('zip')) return '🗜️';
  if (mimetype.includes('word')) return '📝';
  if (mimetype.includes('sheet') || mimetype.includes('excel')) return '📊';
  return '📎';
}

export function AttachmentSection({ ticketId, canDelete }: { ticketId: string; canDelete: boolean }) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const { data } = await attachmentsApi.list(ticketId);
    setAttachments(data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      await attachmentsApi.upload(ticketId, file);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDownload(attachment: Attachment) {
    const res = await api.get(`/attachments/${attachment.id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', attachment.filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async function handleDelete(attachmentId: string) {
    await attachmentsApi.remove(attachmentId);
    await load();
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">
          Lampiran ({attachments.length})
        </h2>
        <label className="text-sm text-blue-600 hover:underline cursor-pointer">
          {uploading ? 'Mengunggah...' : '+ Upload File'}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>

      {error && <p className="px-5 py-2 text-xs text-red-600">{error}</p>}

      <div className="divide-y divide-slate-100">
        {attachments.length === 0 && (
          <p className="px-5 py-4 text-sm text-slate-400">Belum ada file dilampirkan.</p>
        )}
        {attachments.map((a) => (
          <div key={a.id} className="flex items-center justify-between px-5 py-2.5">
            <button
              onClick={() => handleDownload(a)}
              className="flex items-center gap-2 text-sm text-slate-700 hover:text-blue-600 text-left"
            >
              <span>{fileIcon(a.mimetype)}</span>
              <span className="truncate max-w-[220px]">{a.filename}</span>
              <span className="text-xs text-slate-400 shrink-0">{formatSize(a.size)}</span>
            </button>
            {canDelete && (
              <button
                onClick={() => handleDelete(a.id)}
                className="text-xs text-slate-400 hover:text-red-600"
              >
                Hapus
              </button>
            )}
          </div>
        ))}
      </div>
      <p className="px-5 py-2 text-xs text-slate-400 border-t border-slate-100">
        Maks. 10MB per file. Format: gambar, PDF, Word, Excel, teks, zip.
      </p>
    </div>
  );
}
