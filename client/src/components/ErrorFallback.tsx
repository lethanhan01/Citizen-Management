import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import type { FallbackProps } from 'react-error-boundary';

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {

  const { reset } = useQueryErrorResetBoundary();
  return (
    <div role="alert" style={{ padding: '20px' }}>
      <h2>Đã có lỗi xảy ra!</h2>
      <p style={{ color: 'red' }}>{error.message || 'Lỗi không xác định'}</p>
      <button
        onClick={() => {
          reset(); 
          resetErrorBoundary(); 
        }}
      >
        Thử lại
      </button>
    </div>
  );
}