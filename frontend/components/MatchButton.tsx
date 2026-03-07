type MatchButtonProps = {
  loading: boolean;
  onClick: () => void;
};

export default function MatchButton({ loading, onClick }: MatchButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="mt-5 inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Matching...
        </>
      ) : (
        "Match Resume"
      )}
    </button>
  );
}
