export default function TileNotFound({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center col-span-full min-h-72">
      <p className="text-lg font-medium text-gray-600">No {title} found</p>
    </div>
  );
}
