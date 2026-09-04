export default function Template({ children }: { children: React.ReactNode }) {
  // Keep layout stable — avoid remount fade on every boards navigation.
  return <>{children}</>;
}
