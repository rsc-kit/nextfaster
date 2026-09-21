// What the stored shell shows for a product until it arrives: a blank
// picture and blank lines where the name, the copy and the price go.
export function ProductSkeleton() {
  return (
    <>
      <div className="mb-2 h-6 w-1/2 border-t-2 bg-gray-100" />
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <div className="h-56 w-56 flex-shrink-0 border-2 bg-gray-100 md:h-64 md:w-64" />
          <div className="flex flex-grow flex-col gap-2">
            <div className="h-3 w-full bg-gray-100" />
            <div className="h-3 w-5/6 bg-gray-100" />
            <div className="h-3 w-2/3 bg-gray-100" />
          </div>
        </div>
        <div className="h-6 w-20 bg-gray-100" />
        <div className="h-7 w-[150px] rounded-[2px] bg-gray-100" />
      </div>
    </>
  )
}
