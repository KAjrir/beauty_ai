'use client'


import ProductCard from "./ProductCard";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const PlanContainer = ({ plans, open, onClose, user }) => {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const planToBeHighlighted = user
    ? plans.filter((plan) => plan.id === user.subscription.planId)
    : [];

  // voorkomt SSR-fout in Next.js
  useEffect(() => {
    setMounted(true);
  }, []);

  // Open/close logica + animatie
  useEffect(() => {
    if (open) {
      setIsVisible(true); // render modal direct
      const timeout = setTimeout(() => setShowAnimation(true), 20);
      return () => clearTimeout(timeout);
    } else {
      setShowAnimation(false); // start sluitanimatie
      const timeout = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  if (!mounted || !isVisible) return null;

  const modal = (
    <div className="fixed z-50 inset-0 flex items-center justify-center">
      {/* Overlay fade */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black transition-opacity duration-300 ease-in-out ${
          showAnimation ? "opacity-50" : "opacity-0"
        }`}
      />

      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()} // voorkomt dat overlay sluit
        className={`relative p-4 mx-5 rounded-xl shadow-lg bg-white text-gray-900
          transition-all duration-300 ease-in-out transform max-md:h-[80vh] max-md:overflow-scroll
          ${
            showAnimation
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-4"
          }
        `}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-purple-700">
            Which plan do U need{user?.name ? `, ${user.name}` : ""} ?
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-800 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="flex max-md:grid overflow-y-auto gap-4 max-sm:gap-2">
          {plans.map((plan) => {
            if (planToBeHighlighted[0]?.id === plan?.id)
              return (
                <ProductCard
                  highlight={planToBeHighlighted[0]}
                  key={plan.id}
                  plan={plan}
                />
              );
            return <ProductCard key={plan.id} plan={plan} />;
          })}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default PlanContainer;
