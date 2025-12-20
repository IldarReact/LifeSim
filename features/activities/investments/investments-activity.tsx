"use client";

import { useState } from "react";
import { useGameStore } from "@/core/model/game-store";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { TrendingUp, Home, Coins, ChartLine, Plus, Minus } from "lucide-react";

const investmentCategories = {
  stocks: {
    title: "Акции",
    icon: ChartLine,
    items: [
      { id: "sp500", name: "S&P 500", price: 4500, change: 12.4, vol: 18, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600" },
      { id: "apple", name: "Apple Inc.", price: 178, change: -2.1, vol: 25, img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600" },
      { id: "tesla", name: "Tesla", price: 244, change: 45.8, vol: 62, img: "https://images.unsplash.com/photo-1617788138017-80ad6b56a8a8?w=600" },
      { id: "nvda", name: "NVIDIA", price: 875, change: 89.3, vol: 71, img: "https://images.unsplash.com/photo-1620288627223-6b7c4e1c0c6a?w=600" },
    ],
  },
  realEstate: {
    title: "Недвижимость",
    icon: Home,
    items: [
      { id: "moscow1", name: "1-комн. Москва", price: 12000000, change: 8.2, vol: 5, img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600" },
      { id: "sochi", name: "Дом в Сочи", price: 35000000, change: 15.6, vol: 12, img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600" },
    ],
  },
  metals: {
    title: "Драгоценные металлы",
    icon: Coins,
    items: [
      { id: "gold", name: "Золото", price: 2100, change: 12.4, vol: 8, img: "https://images.unsplash.com/photo-1610375461996-7caf9e7c9b0f?w=600" },
      { id: "silver", name: "Серебро", price: 28, change: -5.2, vol: 22, img: "https://images.unsplash.com/photo-1596495781824-70d5d1b9c7c9?w=600" },
    ],
  },
};

type Asset = typeof investmentCategories[keyof typeof investmentCategories]["items"][number];

export function InvestmentsActivity(): React.JSX.Element | null {
  const { player } = useGameStore();
  const [activeTab, setActiveTab] = useState<"stocks" | "realEstate" | "metals">("stocks");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (!player) return null;

  const currentItems = investmentCategories[activeTab].items;

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900/80 to-zinc-950" />
      <div className="fixed inset-0 backdrop-blur-2xl" />

      <div className="relative z-10 container mx-auto p-6 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-zinc-100 mb-3 flex items-center justify-center gap-4">
            <TrendingUp className="w-12 h-12 text-zinc-600" />
            Инвестиции
          </h1>
          <p className="text-zinc-500 text-lg">Выберите актив и начните приумножать капитал</p>
        </div>

        {/* Вкладки вручную */}
        <div className="flex justify-center gap-4 mb-10">
          {Object.entries(investmentCategories).map(([key, cat]) => {
            const Icon = cat.icon;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`px-8 py-4 rounded-2xl flex items-center gap-3 transition-all ${isActive
                    ? "bg-white/10 border border-white/20 text-zinc-100"
                    : "bg-white/5 text-zinc-500 hover:bg-white/8"
                  }`}
              >
                <Icon className="w-6 h-6" />
                {cat.title}
              </button>
            );
          })}
        </div>

        {/* Список активов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentItems.map((asset) => (
            <Card
              key={asset.id}
              className="bg-white/6 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden hover:bg-white/8 transition-all cursor-pointer"
              onClick={() => {
                setSelectedAsset(asset);
                setQuantity(1);
              }}
            >
              <div className="h-48 relative overflow-hidden">
                <img src={asset.img} alt={asset.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-2xl font-bold text-white">{asset.name}</h3>
                  <p className="text-4xl font-bold text-white mt-1">
                    ${asset.price.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Изменение</span>
                  <span className={`text-xl font-bold ${asset.change >= 0 ? "text-zinc-300" : "text-red-400"}`}>
                    {asset.change >= 0 ? "+" : ""}{asset.change}%
                  </span>
                </div>

                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[100, 102, 98, 110, 115, 118].map(v => ({ v }))}>
                      <Line type="monotone" dataKey="v" stroke="#525252" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <Button className="w-full bg-white/10 hover:bg-white/20 text-zinc-200 border border-white/20">
                  Купить
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Модалка покупки — широкая */}
        <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
          <DialogContent className="bg-zinc-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl max-w-6xl p-0 overflow-hidden">
            {selectedAsset && (
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-96 lg:h-full">
                  <img src={selectedAsset.img} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute bottom-8 left-8 text-white">
                    <h2 className="text-5xl font-bold">{selectedAsset.name}</h2>
                    <p className="text-6xl font-bold mt-4">${selectedAsset.price.toLocaleString()}</p>
                    <p className="text-2xl mt-2 opacity-90">
                      {selectedAsset.change >= 0 ? "+" : ""}{selectedAsset.change}% за год
                    </p>
                  </div>
                </div>

                <div className="p-10 space-y-8">
                  <DialogHeader>
                    <DialogTitle className="text-3xl text-zinc-100">Покупка актива</DialogTitle>
                  </DialogHeader>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[100, 102, 98, 110, 115, 118, 130, 125, 140].map(v => ({ v }))}>
                        <Line type="monotone" dataKey="v" stroke="#a3a3a3" strokeWidth={4} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-zinc-400 mb-2">Количество</p>
                      <div className="flex items-center gap-4">
                        <Button
                          size="icon"
                          variant="outline"
                          className="border-white/20"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                          <Minus className="w-5 h-5" />
                        </Button>
                        <div className="w-32 text-center text-3xl font-bold text-zinc-100 bg-white/5 rounded-xl py-3 border border-white/10">
                          {quantity}
                        </div>
                        <Button
                          size="icon"
                          variant="outline"
                          className="border-white/20"
                          onClick={() => setQuantity(quantity + 1)}
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      <p className="text-zinc-400">Итого к оплате</p>
                      <p className="text-5xl font-bold text-zinc-100">
                        ${(selectedAsset.price * quantity).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        className="flex-1 bg-white/10 hover:bg-white/20 text-zinc-200 border border-white/20 text-lg h-14"
                        onClick={() => setSelectedAsset(null)}
                      >
                        Отмена
                      </Button>
                      <Button className="flex-1 bg-white/10 hover:bg-white/20 text-zinc-200 border border-white/20 text-lg h-14">
                        Купить {quantity} шт.
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}