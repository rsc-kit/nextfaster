// What the stored shell shows for a subcategory until the products arrive:
// eight blank tiles the size of a product card.
export function SubcategorySkeleton() {
  return (
    <>
      <h1 className="mb-2 border-b-2 text-sm font-bold text-transparent">Products</h1>
      <div className="flex flex-row flex-wrap gap-2">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex h-[130px] w-full flex-row border px-4 py-2 sm:w-[250px]">
            <div className="py-2">
              <div className="h-12 w-12 bg-gray-100" />
            </div>
            <div className="px-2" />
            <div className="flex flex-grow flex-col gap-2 py-2">
              <div className="h-3 w-3/4 bg-gray-100" />
              <div className="h-2 w-full bg-gray-100" />
              <div className="h-2 w-5/6 bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
