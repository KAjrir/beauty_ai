'use client'


import ProductCard from "./ProductCard";
import { useEffect, useState } from "react";


const PlanContainer = ({plans, open, onClose, user}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const planToBeHiglited = user ? plans.filter(plan => plan.id === user.subscription.planId) : [] 

  

  useEffect(() => {
  if (open) {
    setIsVisible(true); // render de modal direct
    // Start animatie ietsje later zodat Tailwind transition zichtbaar wordt
    const timeout = setTimeout(() => {
      setShowAnimation(true);
    }, 20); // 10ms is genoeg voor een frame

    return () => clearTimeout(timeout);
  } else {
    setShowAnimation(false); // start sluitanimatie

    const timeout = setTimeout(() => {
      setIsVisible(false); // verwijder uit DOM na animatie
    }, 200); // matcht je Tailwind duration

    return () => clearTimeout(timeout);
  }
}, [open]);

  // Render altijd zolang animatie actief is
  if (!isVisible) return null;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay fade */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black transition-opacity duration-300 ease-in-out ${
          showAnimation ? 'opacity-50' : 'opacity-0'
        }`}
      />

      {/* Modal */}
      <div
        className={`relative z-10 p-4 mx-5 rounded-xl shadow-lg bg-white text-gray-900
          transition-all duration-300 ease-in-out transform max-md:h-[80vh] max-md:overflow-scroll
          ${showAnimation ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
        `}
      >
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-purple-700">
              Which plan do U need{user?.name ? `, ${user.name}` : ''} ?
            </h2>
            <button
              onClick={onClose}
              className=" text-gray-400 hover:text-gray-800 text-xl"
            >
              ✕
            </button>
        </div>

        <div className="flex max-md:grid overflow-y-auto gap-4 max-sm:gap-2">
          {plans.map(plan => {
              if (planToBeHiglited[0]?.id === plan?.id) return <ProductCard highlight={planToBeHiglited[0]} key={plan.id} plan={plan} />
              return  <ProductCard key={plan.id} plan={plan}/>
          })}
        </div>

      </div>
    </div>
  );
}

export default PlanContainer