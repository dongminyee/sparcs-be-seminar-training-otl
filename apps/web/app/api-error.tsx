export function ApiError({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="notice" role="status">
      <span>{message}</span>
      {retry && <button type="button" className="text-button" onClick={retry}>다시 시도</button>}
    </div>
  );
}
