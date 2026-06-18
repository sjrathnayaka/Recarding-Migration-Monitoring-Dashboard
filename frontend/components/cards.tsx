'use client';

import { CreditCard, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function Cards() {
  const [showCard, setShowCard] = useState(false);

  const cards = [
    {
      type: 'Visa',
      lastFour: '4829',
      name: 'John Doe',
      expiry: '12/26',
      balance: '$12,450.75',
      status: 'Active',
    },
    {
      type: 'Mastercard',
      lastFour: '5421',
      name: 'John Doe',
      expiry: '08/25',
      balance: '$8,230.50',
      status: 'Active',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Your Cards</h2>
        <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition-shadow text-sm font-semibold">
          + Add Card
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card, i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-primary to-accent rounded-xl p-6 text-primary-foreground shadow-lg hover:shadow-2xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-sm opacity-80">Card Type</p>
                <p className="text-lg font-semibold">{card.type}</p>
              </div>
              <CreditCard size={24} />
            </div>

            <div className="space-y-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-75 uppercase tracking-wide">Card Number</p>
                  <p className="text-xl font-mono tracking-widest mt-1">
                    •••• •••• •••• {card.lastFour}
                  </p>
                </div>
                <button
                  onClick={() => setShowCard(!showCard)}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  {showCard ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs opacity-75 uppercase tracking-wide">Cardholder</p>
                  <p className="font-semibold mt-1">{card.name}</p>
                </div>
                <div>
                  <p className="text-xs opacity-75 uppercase tracking-wide">Expires</p>
                  <p className="font-semibold mt-1">{card.expiry}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/20">
              <div>
                <p className="text-xs opacity-75">Available Balance</p>
                <p className="text-xl font-bold mt-1">{card.balance}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">
                {card.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
