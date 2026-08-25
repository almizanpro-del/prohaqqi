import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid place-items-center py-24 text-center">
      <p className="text-6xl font-extrabold text-brand-200">404</p>
      <h1 className="mt-4 text-xl font-bold text-stone-800">
        الصفحة غير موجودة — Page not found
      </h1>
      <Link href="/" className="btn-primary mt-6">
        ← حَقّي
      </Link>
    </div>
  );
}
