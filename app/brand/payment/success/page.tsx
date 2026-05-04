import Link from "next/link";

export const dynamic = "force-dynamic";

export default function BrandPaymentSuccess({
  searchParams,
}: {
  searchParams: { invoice?: string };
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full glass-card rounded-2xl p-10 text-center border border-white/10 bg-slate-900/50">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <span className="material-symbols-outlined text-emerald-400 text-3xl">
            check_circle
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Payment received</h1>
        <p className="text-slate-400 text-sm mb-6">
          Thanks! Your payment has been recorded. The creator will see funds in
          escrow within a few seconds and can request an instant advance against
          this deal.
        </p>
        {searchParams.invoice && (
          <p className="text-xs text-slate-500 font-mono mb-6">
            Invoice ref: {searchParams.invoice}
          </p>
        )}
        <Link
          href="/"
          className="inline-block bg-primary-container text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
