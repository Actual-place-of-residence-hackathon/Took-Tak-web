export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center text-zinc-400">
      <p>{message}</p>
    </div>
  );
}
