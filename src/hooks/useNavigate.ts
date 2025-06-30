// Simple navigation hook for demo purposes
// In a real app, this would use React Router or similar
export function useNavigate() {
  const navigate = (path: string) => {
    console.log(`Navigating to: ${path}`);
    // In a real app, this would use router.push(path) or similar
  };

  const goBack = () => {
    console.log('Navigating back');
    // In a real app, this would use router.back() or similar
  };

  return { navigate, goBack };
}