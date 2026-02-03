interface WishlistItem {
  id: string | number;
  name: string;
  price: number;
  urgent?: boolean;
  bought?: boolean;
  product_id?: string;
  quantity?: number;
  purchasedQuantity?: number;
}

interface WishlistProgressBarProps {
  wishlist: WishlistItem[];
  compact?: boolean;
  minimal?: boolean;
}

const WishlistProgressBar = ({ wishlist, compact = false, minimal = false }: WishlistProgressBarProps) => {
  // Calculate progress based on actual quantities purchased vs needed
  // This gives a more accurate "belly full" percentage
  const totalNeeded = wishlist.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalPurchased = wishlist.reduce((sum, item) => {
    const purchased = item.purchasedQuantity || 0;
    const needed = item.quantity || 1;
    // Cap at needed to prevent overflow (e.g., 10 purchased when only 5 needed)
    return sum + Math.min(purchased, needed);
  }, 0);
  
  const progressPercent = totalNeeded > 0 ? Math.round((totalPurchased / totalNeeded) * 100) : 0;
  
  // Dynamic gradient based on progress (red → yellow → green)
  const getProgressGradient = (percent: number) => {
    if (percent < 33) return 'from-red-500 via-red-400 to-orange-400';
    if (percent < 66) return 'from-orange-500 via-yellow-400 to-yellow-300';
    return 'from-green-500 via-emerald-400 to-green-400';
  };

  // Minimal version - just a thin bar without text
  if (minimal) {
    return (
      <div className="w-full bg-black/20 backdrop-blur-sm rounded-full h-1.5 overflow-hidden">
        <div 
          className={`h-1.5 rounded-full transition-all duration-700 bg-gradient-to-r ${getProgressGradient(progressPercent)}`}
          style={{ width: `${Math.max(progressPercent, 5)}%` }}
        />
      </div>
    );
  }

  return (
    <div className={`bg-white/95 backdrop-blur-sm rounded-2xl p-${compact ? '3' : '4'} shadow-soft`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`${compact ? 'text-sm' : 'text-sm'} font-semibold text-foreground`}>
          Brzuszek pełny na {progressPercent}%
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
        <div 
          className={`h-3 rounded-full transition-all duration-700 bg-gradient-to-r ${getProgressGradient(progressPercent)} relative overflow-hidden`}
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {totalPurchased} z {totalNeeded} produktów zakupionych
      </p>
    </div>
  );
};

export default WishlistProgressBar;
