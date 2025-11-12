'use client'

import { useState } from "react"



export default function ProductCard({ plan, highlight }) {
    const [error, setError] = useState('')
    
    const handleSubmit = async(e, data) => {
            e.preventDefault()
            if(data, highlight?.id) {
                throw new Error("Already subscripted to chosen plan")
            }

            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify({planName: data})
            })

            const ontvangst = await res.json()
            if(ontvangst?.error) setError(ontvangst.error)
            if(ontvangst?.url) return window.location.href = ontvangst?.url

    }
    return (
        <div
            className={`flex flex-col flex-1 rounded-2xl mx-2 my-1.5 shadow-[2px_2px_1px_rgba(0,0,0,0.2)] p-5 border ${
            highlight ? 'border-purple-600' : 'border-gray-200'
            } bg-white transition-all hover:scale-[1.02] hover:border-purple-400`}
        >
            {/* Titel */}
            <h3
            className={`font-bold text-[clamp(1rem,1.5vw,1.25rem)] leading-tight ${
                highlight ? 'text-purple-600' : 'text-gray-800'
            }`}
            >
            {`${plan.name[0].toUpperCase()}${plan.name.slice(1)}`}
            </h3>

            {/* Prijs */}
            <p className="mt-2 text-[clamp(1.5rem,2vw,2rem)] font-extrabold text-gray-900 leading-tight">
                € {plan.price / 100}
                <span className="text-[clamp(0.8rem,1vw,0.9rem)] font-medium text-gray-500">
                    {' '}
                    /month
                </span>
            </p>

            {/* Featurelijst */}
            <ul className="my-3 space-y-1.5 text-[clamp(0.8rem,1vw,0.9rem)] text-gray-700 leading-snug">
            {Object.entries(plan.features).map(([feature, func]) => {
                if (feature === 'version')
                return (
                    <li key={feature} className="flex items-start">
                    <span className="mr-2 text-green-500 mt-[1px]">✔</span>
                    {func}
                    </li>
                );

                if (func.enabled)
                return (
                    <li key={feature} className="flex items-start">
                    <span className="mr-2 text-green-500 mt-[1px]">✔</span>
                    {feature} - {func.description}
                    </li>
                );
            })}
            </ul>

            {/* Knop */}
            <button
            className={`mt-auto w-full py-1.5 rounded-lg font-semibold text-[clamp(0.85rem,1vw,0.95rem)] transition ${
                highlight
                ? 'bg-purple-500 text-white hover:bg-purple-600'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={(e) => handleSubmit(e, plan.name)}
            >
                Choose
            </button>
        </div>
    );
}