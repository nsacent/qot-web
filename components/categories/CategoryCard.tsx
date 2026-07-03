type CategoryCardProps = {
    category: any;
};

export default function CategoryCard({ category }: CategoryCardProps) {
    const id = category.slug || category.id;
    return (
        <a
            href={`/listings?category=${id}`}
            className="block rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-md"
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-xl font-bold text-orange-600">
                {(category.name || category.title || "C").charAt(0)}
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900">
                {category.name || category.title || "Category"}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
                {category.listings_count || category.count || 0} listings
            </p>
        </a>
    );
}