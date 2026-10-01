export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="text-5xl">📡</div>
      <h1 className="text-2xl font-bold">You&apos;re offline</h1>
      <p className="max-w-sm text-muted-foreground">
        No internet connection. Your expense data is safe — reconnect to sync
        and access all features.
      </p>
    </div>
  );
}
