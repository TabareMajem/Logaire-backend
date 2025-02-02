export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner />
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="w-full h-32 bg-white rounded-lg shadow-sm animate-pulse">
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    </div>
  );
}