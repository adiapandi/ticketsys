import { useState } from 'react';
import { ticketsApi } from '../api/tickets';

export function CsatRating({
  ticketId,
  existingRating,
  existingComment,
  onSubmitted,
}: {
  ticketId: string;
  existingRating?: number | null;
  existingComment?: string | null;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (existingRating) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Rating Kamu</h2>
        <div className="flex gap-1 text-xl">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className={star <= existingRating ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-600'}>
              ★
            </span>
          ))}
        </div>
        {existingComment && (
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 italic">"{existingComment}"</p>
        )}
      </div>
    );
  }

  async function handleSubmit() {
    if (rating === 0) {
      setError('Pilih bintang dulu ya');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await ticketsApi.submitCsat(ticketId, { rating, comment: comment || undefined });
      onSubmitted();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengirim rating');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5">
      <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Puas dengan penanganan ticket ini?</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Kasih rating buat bantu kami tingkatkan layanan.</p>

      <div className="flex gap-1 text-2xl mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            className={star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-600'}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder="Komentar (opsional)..."
        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 mb-3"
      />

      {error && <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? 'Mengirim...' : 'Kirim Rating'}
      </button>
    </div>
  );
}
