interface WishlistItem {
  id: number;
  name: string;
  price: number;
  urgent?: boolean;
  bought?: boolean;
}

interface WishlistProgressBarProps {
  wishlist: WishlistItem[];
  compact?: boolean;
}

const WishlistProgressBar = ({ wishlist, compact = false }: WishlistProgressBarProps) => {
  const boughtCount = wishlist.filter(item => item.bought).length;
  const totalCount = wishlist.length;
  const progressPercent = totalCount > 0 ? Math.round((boughtCount / totalCount) * 100) : 0;
  
  // Dynamic gradient based on progress (red → yellow → green)
  const getProgressGradient = (percent: number) => {
    if (percent < 33) return 'from-red-500 to-red-400';
    if (percent < 66) return 'from-orange-500 to-yellow-400';
    return 'from-green-500 to-emerald-400';
  };

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
        {boughtCount} z {totalCount} produktów zakupionych
      </p>
    </div>
  );
};

export default WishlistProgressBar;
