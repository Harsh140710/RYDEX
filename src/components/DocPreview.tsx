function DocPreview({ label, url }: any) {
  const isImage = url?.match(/\.(jpg|png|webp)$/i);
  const isPdf = url?.endsWith(".pdf");

  return (
    <div className="bg-gray-50 rounded-2xl border overflow-hidden shadow-sm">
      <div className="px-4 py-2 border-b text-sm font-semibold">{label}</div>
      <div className="h-52 flex items-center justify-center bg-white">
        {!url && (
          <span className="text-xs text-gray-400">Image not Uploaded</span>
        )}

        {isImage && (
          <img src={url} alt="Image" className="w-full h-full object-cover" />
        )}

        {isPdf && <iframe src={url} className="w-full h-full" />}
      </div>
      {url && (
        <a
          href={url}
          target="_blank"
          className="block text-center text-sm py-2 font-medium hover:bg-gray-100"
        >
          Open Full Documents
        </a>
      )}
    </div>
  );
}

export default DocPreview;
