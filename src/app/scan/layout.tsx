export default function ScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No nav/footer — full IDE chrome handled by IDELayout
  return children;
}
