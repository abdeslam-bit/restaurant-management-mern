export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="spinner-container" style={{ flexDirection: 'column', gap: '16px' }}>
      <div className="spinner" />
      {message && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{message}</p>}
    </div>
  );
}
