export default function AdSlot({ position }: { position: string }) {
  // Renders an HTML comment placeholder for AdSense slots.
  // Replace with actual <script> and <ins> tags after AdSense approval.
  return (
    <div
      className="w-full my-4"
      aria-hidden="true"
      data-ad-position={position}
      suppressHydrationWarning
    />
  );
}
