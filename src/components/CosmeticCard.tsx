import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { X, ImageOff, Copy, Check } from 'lucide-react';
import { useState, useCallback, useMemo, memo } from 'react';
import { Cosmetic } from '@/types';
import { SetDialog } from './SetDialog';
import { fetchSetItems } from '@/lib/api';

type CosmeticProps = {
  cosmetic: {
    name: string;
    description: string;
    rarity: {
      value: string;
    };
    type: {
      value: string;
    };
    images: {
      icon: string;
      featured?: string;
    };
    introduction?: {
      text: string;
    };
    set?: {
      value: string;
    };
  };
};

const rarityColors = {
  common: 'bg-gray-500',
  uncommon: 'bg-green-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-orange-500',
  mythic: 'bg-yellow-500',
  gaminglegends: 'bg-indigo-500',
  marvel: 'bg-red-500',
  starwars: 'bg-yellow-400',
  dc: 'bg-blue-600',
  dark: 'bg-purple-900',
  frozen: 'bg-cyan-400',
  lava: 'bg-orange-600',
  shadow: 'bg-zinc-800',
  icon: 'bg-teal-400',
  default: 'bg-gray-500',
};

const InfoItem = ({ label, value, className, onClick }: { 
  label: string; 
  value: string; 
  className?: string;
  onClick?: () => void;
}) => (
  <div 
    className={cn(
      "space-y-1 rounded-xl bg-black/20 backdrop-blur-md p-3 border border-white/[0.05]",
      onClick && "cursor-pointer hover:bg-black/30 transition-colors",
      className
    )}
    onClick={onClick}
  >
    <h4 className="text-sm font-medium text-white/60">{label}</h4>
    <p className="text-sm text-white/90">{value}</p>
  </div>
);

export default memo(function CosmeticCard({ cosmetic }: CosmeticProps) {
  const rarityColor = rarityColors[cosmetic.rarity.value.toLowerCase() as keyof typeof rarityColors] || rarityColors.default;
  const [isZoomed, setIsZoomed] = useState(false);
  const [isSetDialogOpen, setIsSetDialogOpen] = useState(false);
  const [setItems, setSetItems] = useState<Cosmetic[]>([]);

  const handleViewSet = async () => {
    if (!cosmetic.set?.value) return;
    
    try {
      const items = await fetchSetItems(cosmetic.set.value);
      setSetItems(items);
      setIsSetDialogOpen(true);
    } catch (error) {
      console.error('Error loading set items:', error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="group relative h-[300px] overflow-hidden cursor-pointer bg-black/40 hover:bg-black/60 backdrop-blur-xl border-white/5 transition-all duration-500 hover:scale-[1.02]">
          {/* Glass Morphism Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
          
          {/* Rarity Indicator */}
          <div className={cn(
            "absolute bottom-0 inset-x-0 h-[3px] opacity-40 group-hover:opacity-100 transition-all duration-500",
            rarityColor
          )} />
          
          <CardContent className="p-4 h-full flex flex-col">
            {/* Image Container */}
            <div className="relative flex-1 flex items-center justify-center max-h-[180px]">
              <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <img
                src={cosmetic.images.icon}
                alt={cosmetic.name}
                className="w-auto h-full object-contain transform transition-all duration-500 group-hover:scale-110 group-hover:-rotate-2"
                loading="lazy"
                decoding="async"
                fetchpriority="low"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = '/placeholder.png';
                }}
              />
            </div>

            {/* Info Container */}
            <div className="relative mt-auto space-y-3 z-10">
              {/* Title with Blur Background */}
              <div className="relative">
                <div className="absolute inset-0 -m-2 bg-black/50 backdrop-blur-md rounded-xl" />
                <h3 className="relative font-medium text-lg text-white/90 truncate">
                  {cosmetic.name}
                </h3>
              </div>

              {/* Badges with Glass Effect */}
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "bg-black/30 backdrop-blur-md border border-white/10 text-white/80 shadow-lg",
                    rarityColor.replace('bg-', 'hover:bg-').replace('500', '500/20')
                  )}
                >
                  {cosmetic.rarity.value}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="bg-black/30 backdrop-blur-md border-white/10 text-white/70"
                >
                  {cosmetic.type.value}
                </Badge>
              </div>

              {/* Floating Description */}
              <div className="absolute -top-24 inset-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none">
                <div className="bg-black/70 backdrop-blur-xl rounded-xl p-3 border border-white/[0.02] shadow-xl">
                  <p className="text-sm text-white/70 line-clamp-2">
                    {cosmetic.description}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className={cn(
        "max-w-4xl bg-black/40 backdrop-blur-xl border-white/5",
        "shadow-[0_0_50px_-12px] shadow-black",
        "after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-br",
        "after:from-white/[0.08] after:to-transparent after:pointer-events-none",
        "before:absolute before:inset-0 before:rounded-lg before:opacity-10",
        rarityColor.replace('bg-', 'before:bg-')
      )}>
        <div className="relative p-4">
          {/* Ambient Glow */}
          <div className={cn(
            "absolute -inset-[150px] opacity-20 blur-[100px] -z-10",
            rarityColor
          )} />

          {/* Content Container */}
          <div className="relative z-10 space-y-6">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <DialogTitle className="text-2xl font-medium text-white/90">
                    {cosmetic.name}
                  </DialogTitle>
                  <DialogDescription className="text-white/70">
                    {cosmetic.description}
                  </DialogDescription>
                </div>
                <DialogClose className="rounded-full p-2 bg-black/20 hover:bg-black/40 transition-colors">
                  <X className="h-5 w-5 text-white/70" />
                </DialogClose>
              </div>

              {/* Badges */}
              <div className="flex gap-2 mt-4">
                <Badge 
                  className={cn(
                    "px-3 py-1 text-sm text-white bg-black/30 backdrop-blur-sm border-0",
                    rarityColor.replace('bg-', 'hover:bg-').replace('500', '500/30')
                  )}
                >
                  {cosmetic.rarity.value}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="px-3 py-1 text-sm text-white/70 bg-black/20 backdrop-blur-sm border-white/10"
                >
                  {cosmetic.type.value}
                </Badge>
              </div>
            </DialogHeader>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Section */}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-black/30 to-black/10 backdrop-blur-sm border border-white/[0.02]">
                <div 
                  className={cn(
                    "cursor-zoom-in h-full transition-transform duration-300 p-8",
                    isZoomed && "fixed inset-0 z-50 bg-black/95 cursor-zoom-out p-4"
                  )}
                  onClick={() => setIsZoomed(!isZoomed)}
                >
                  <img
                    src={cosmetic.images.featured || cosmetic.images.icon}
                    alt={cosmetic.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                    decoding="async"
                    fetchpriority="low"
                  />
                </div>
              </div>

              {/* Info Section */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <InfoItem 
                    label="Set" 
                    value={cosmetic.set?.value || 'No Set'} 
                    className="bg-black/20 backdrop-blur-sm border-white/[0.02]"
                    onClick={cosmetic.set?.value ? handleViewSet : undefined}
                  />
                  <InfoItem 
                    label="Rarity" 
                    value={cosmetic.rarity.value} 
                    className="bg-black/20 backdrop-blur-sm border-white/[0.02]"
                  />
                  <InfoItem 
                    label="Type" 
                    value={cosmetic.type.value} 
                    className="bg-black/20 backdrop-blur-sm border-white/[0.02]"
                  />
                  {cosmetic.series && (
                    <InfoItem 
                      label="Series" 
                      value={cosmetic.series.value} 
                      className="bg-black/20 backdrop-blur-sm border-white/[0.02]"
                    />
                  )}
                </div>

                {cosmetic.introduction && (
                  <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/[0.02]">
                    <h4 className="text-sm font-medium text-white/70 mb-1">Introduction</h4>
                    <p className="text-sm text-white/90">{cosmetic.introduction.text}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {cosmetic.set?.value && (
        <SetDialog
          isOpen={isSetDialogOpen}
          onOpenChange={setIsSetDialogOpen}
          setName={cosmetic.set.value}
          items={setItems}
        />
      )}
    </Dialog>
  );
}, (prevProps, nextProps) => prevProps.cosmetic.id === nextProps.cosmetic.id);

// Add this CSS to your global styles
const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
`;
