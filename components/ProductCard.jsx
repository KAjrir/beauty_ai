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
        <div className={`flex flex-col flex-1 rounded-2xl mx-2 my-1.5 shadow-[2px_2px_1px_rgba(0,0,0,0.2)] p-6 border ${highlight ? 'border-purple-600' : 'border-gray-200'} bg-white transition-all hover:scale-[1.02] hover:border-purple-400`}>
            <h3 className={`text-xl font-bold ${highlight ? 'text-purple-600' : 'text-gray-800'}`}>
                {plan.name.split('').map(letter => plan.name[0] === letter ? letter.toUpperCase() : letter).join('')}
            </h3>
            <p className="mt-2 text-3xl font-extrabold text-gray-900">${plan.price / 100}<span className="text-base font-medium text-gray-500"> /month</span></p>

            <ul className="my-4 space-y-2 text-sm text-gray-700">
                {Object.entries(plan.features).map(([feature, func]) => {
                    if(feature === "version") return (
                        <li key={feature} className="flex items-start">
                            <span className="mr-2 text-green-500">✔</span> 
                            {func}
                        </li>
                    )
                    if(func.enabled) return (
                        <li key={feature} className="flex items-start">
                            <span className="mr-2 text-green-500">✔</span> {feature} - {func.description}
                        </li>
                    )
                })}
            </ul>

            <button
                className={`mt-auto w-full py-2 rounded-xl font-semibold ${highlight ? 'bg-purple-200 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                onClick={(e) => handleSubmit(e, plan.name)}
            >
                Choose
            </button>
        </div>
    );
}