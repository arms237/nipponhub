import React from 'react'
import TitleCategory from './TitleCategory'
import ProductList from './ProductList'
import { productType } from '@/app/types/types'

export default function ProductView({ productsList, title }: { productsList: productType[], title: string }) {
    return (
        <div className='flex flex-col'>
            <TitleCategory title={title} />
            <ProductList products={productsList} />
            <div className="text-center mt-4">
                <p className="text-gray-600">
                    {productsList.length} {productsList.length > 1 ? `${title} trouvées` : `${title} trouvée`}
                </p>
            </div>
        </div>
    )
}
