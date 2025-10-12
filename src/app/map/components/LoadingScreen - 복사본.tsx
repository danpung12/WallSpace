export default function LoadingScreen() {
  return (
    <div className="w-full h-full bg-theme-brown-lightest flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-brown-dark"></div>
      <p className="mt-4 text-theme-brown-darkest font-semibold">
        지도를 불러오는 중...
      </p>
    </div>
  );
}
