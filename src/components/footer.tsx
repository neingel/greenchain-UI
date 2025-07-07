import React from "react";
export default function Footer() {
  return (
    <footer className="bg-white border-t mt-12 py-6 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-gray-600">&copy; 2025 GreenChain. All rights reserved.</p>
        <div className="flex gap-4 items-center">
        <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" className="h-6" />
        <img src="https://img.icons8.com/color/48/mastercard-logo.png" alt="MasterCard" className="h-6" />
        <img src="https://img.icons8.com/color/48/apple-pay.png" alt="Apple Pay" className="h-6" />
        <img src="https://img.icons8.com/color/48/google-pay.png" alt="Google Pay" className="h-6" />
        </div>
      </div>
    </footer>
  );
}