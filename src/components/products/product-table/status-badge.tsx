export function StatusBadge({ available }: { available: boolean }) {
  return (
    <span
      className={`inline-flex min-h-5 items-center rounded-full px-2 text-xs font-medium ${available ? 'bg-catalog-green-bg text-catalog-green' : 'bg-catalog-red-bg text-catalog-red'}`}
    >
      {available ? 'Dostępny' : 'Niedostępny'}
    </span>
  );
}
