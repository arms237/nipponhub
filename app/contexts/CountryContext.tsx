'use client'
import { useEffect,useState,createContext, useContext } from "react"

interface CountryContextType {
    country: string;
    setCountry: (country: string) => void;
}
export const CountryContext = createContext<CountryContextType | undefined>(undefined)

export const CountryProvider = ({children}:{children:React.ReactNode}) => {
    const [country, setCountry] = useState('')
    useEffect(() => {
        const storedCountry = localStorage.getItem('country')
        if (storedCountry) {
            setCountry(storedCountry)
        }
    }, [])
    
    return (
        <CountryContext.Provider value={{country, setCountry}}>
            {children}
        </CountryContext.Provider>
    )
}

export function useCountry() {
    const context = useContext(CountryContext)
    if (!context) {
        throw new Error('useCountry must be used within a CountryProvider')
    }
    return context
}