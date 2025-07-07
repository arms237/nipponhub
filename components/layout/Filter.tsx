"use client";
import { useFilters } from "@/app/contexts/FilterContext";

export default function Filter() {
  const {maxPrice:maxPriceContext,setMaxPrice:setMaxPriceContext,isInStock,setIsInStock} = useFilters()
  return (
    <div className="flex flex-col gap-4 h-60 bg-base-100 rounded-lg p-4 m-4 min-w-[250px] ">
      <h1 className="text-xl font-bold">Filtres</h1>
      <div className="flex flex-col  justify-between">
        <h2 className="font-semibold">prix</h2>
        <input
          type="range"
          min={0}
          max={100000}
          value={maxPriceContext}
          onChange={(e) => setMaxPriceContext(Number(e.target.value))}
          className="range range-primary w-full my-3"
        />

        <div className="flex justify-between w-full text-sm">
          <label htmlFor="minPrice">0 FCFA</label>
          <label htmlFor="maxPrice">{maxPriceContext} FCFA</label>
        </div>
      </div>
      <div className="flex gap-2">
        <input
          type="checkbox"
          id="enStock"
          className="checkbox checkbox-primary checkbox-sm"
          checked={isInStock}
          onChange={(e) => setIsInStock(e.target.checked)}
        />
        <label htmlFor="enStock" className="cursor-pointer hover:text-primary text-sm ">En stock uniquement</label>
      </div>
    </div>
  );
}
