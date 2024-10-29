import { useEffect, useState, useMemo, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Sparkles, Crown, Sword, Shield, Music, Image, Clock, X, Brush } from 'lucide-react';
import CosmeticCard from './components/CosmeticCard';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from 'react-error-boundary';
import { Skeleton } from '@/components/ui/skeleton';
import { VirtualizedGrid } from './components/VirtualizedGrid';
import { Button } from '@/components/ui/button';
import { LoadingTimeout } from './components/LoadingTimeout';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { Shuffle } from 'lucide-react';
import { useInfiniteScroll } from './hooks/useInfiniteScroll';

type Cosmetic = {
  id: string;
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
};

const LoadingFallback = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
    {Array(12).fill(0).map((_, i) => (
      <Skeleton key={i} className="h-[400px] w-full rounded-xl bg-zinc-800/50" />
    ))}
  </div>
);

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="text-center p-8 bg-zinc-800/50 rounded-2xl backdrop-blur-xl">
    <h2 className="text-xl font-semibold mb-2 text-zinc-100">Something went wrong</h2>
    <p className="text-zinc-400 mb-4">{error.message}</p>
    <Button 
      onClick={() => {
        resetErrorBoundary();
        const controller = new AbortController();
        fetchCosmetics(controller.signal, setLoading, setError, setCosmetics);
      }}
      className="bg-purple-500 hover:bg-purple-600 text-white"
    >
      Try again
    </Button>
  </div>
);

const fetchCosmetics = async (signal: AbortSignal, setLoading: Function, setError: Function, setCosmetics: Function) => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await fetch(
      'https://fortnite-api.com/v2/cosmetics/br?language=en',
      { 
        signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.data) {
      setCosmetics(data.data);
      setLoading(false);
    } else {
      throw new Error('No data received from API');
    }
  } catch (error: any) {
    if (!signal.aborted) {
      console.error('Fetch error:', error);
      setError(error.message || 'Failed to fetch cosmetics');
      setLoading(false);
    }
  }
};

function App() {
  const [cosmetics, setCosmetics] = useState<Cosmetic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [activeRarity, setActiveRarity] = useState('all');
  const [activeSeason, setActiveSeason] = useState('all');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<Cosmetic[]>([]);
  const [retryCountdown, setRetryCountdown] = useState(15);
  const [selectedCosmetic, setSelectedCosmetic] = useState<Cosmetic | null>(null);
  const [isRandomDialogOpen, setIsRandomDialogOpen] = useState(false);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const filteredCosmetics = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    const filters = {
      tab: activeTab.toLowerCase(),
      rarity: activeRarity.toLowerCase(),
      season: activeSeason.toLowerCase()
    };

    return cosmetics.filter(cosmetic => {
      if (!cosmetic.name.toLowerCase().includes(searchLower)) return false;
      if (filters.tab !== 'all' && cosmetic.type.value.toLowerCase() !== filters.tab) return false;
      if (filters.rarity !== 'all' && cosmetic.rarity.value.toLowerCase() !== filters.rarity) return false;
      if (filters.season !== 'all' && !(cosmetic.introduction?.text || '').toLowerCase().includes(filters.season)) return false;
      return true;
    });
  }, [cosmetics, searchQuery, activeTab, activeRarity, activeSeason]);

  const { displayedItems, isLoading, hasMore } = useInfiniteScroll(filteredCosmetics, 20);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        if (!isMounted) return;
        await fetchCosmetics(controller.signal, setLoading, setError, setCosmetics);
      } catch (error) {
        console.error('Fetch failed:', error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (cosmetics.length > 0) {
      console.log('Cosmetics loaded:', cosmetics.length);
      setLoading(false);
    }
  }, [cosmetics]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        document.querySelector('input[type="text"]')?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (error && retryCountdown > 0) {
      timer = setInterval(() => {
        setRetryCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [error, retryCountdown]);

  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.getElementById('recent-searches');
      const searchInput = document.querySelector('input[type="text"]');
      
      if (searchContainer && 
          !searchContainer.contains(event.target as Node) && 
          !searchInput?.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rarityFilters = [
    { value: 'all', label: 'All Rarities', color: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500' },
    { value: 'common', label: 'Common', color: 'bg-gray-500' },
    { value: 'uncommon', label: 'Uncommon', color: 'bg-green-500' },
    { value: 'rare', label: 'Rare', color: 'bg-blue-500' },
    { value: 'epic', label: 'Epic', color: 'bg-purple-500' },
    { value: 'legendary', label: 'Legendary', color: 'bg-orange-500' },
    { value: 'mythic', label: 'Mythic', color: 'bg-yellow-500' },
    { value: 'gaminglegends', label: 'Gaming Legends', color: 'bg-indigo-500' },
    { value: 'marvel', label: 'Marvel', color: 'bg-red-500' },
    { value: 'starwars', label: 'Star Wars', color: 'bg-yellow-400' },
    { value: 'dc', label: 'DC', color: 'bg-blue-600' },
    { value: 'dark', label: 'Dark', color: 'bg-purple-900' },
    { value: 'frozen', label: 'Frozen', color: 'bg-cyan-400' },
    { value: 'lava', label: 'Lava', color: 'bg-orange-600' },
    { value: 'shadow', label: 'Shadow', color: 'bg-zinc-800' },
    { value: 'icon', label: 'Icon', color: 'bg-teal-400' },
  ];

  const seasonFilters = [
    { value: 'all', label: 'All Seasons', color: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500' },
    { value: 'chapter 1', label: 'Chapter 1', color: 'bg-blue-500' },
    { value: 'chapter 2', label: 'Chapter 2', color: 'bg-purple-500' },
    { value: 'chapter 3', label: 'Chapter 3', color: 'bg-pink-500' },
    { value: 'chapter 4', label: 'Chapter 4', color: 'bg-orange-500' },
    { value: 'chapter 5', label: 'Chapter 5', color: 'bg-emerald-500' },
  ];

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

  const handleViewItem = (cosmetic: Cosmetic) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(item => item.id !== cosmetic.id);
      return [cosmetic, ...filtered].slice(0, 10);
    });
  };

  const handleRandomItem = () => {
    if (filteredCosmetics.length === 0) return;
    
    setIsRandomizing(true);
    
    // Quick shuffle animation
    let shuffleCount = 0;
    const shuffleInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * filteredCosmetics.length);
      setSelectedCosmetic(filteredCosmetics[randomIndex]);
      shuffleCount++;
      
      if (shuffleCount >= 10) {
        clearInterval(shuffleInterval);
        setIsRandomizing(false);
        setIsRandomDialogOpen(true);
      }
    }, 50);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Only add to recent searches if query is not empty and user has stopped typing
    if (query.trim()) {
      const timeoutId = setTimeout(() => {
        setRecentSearches(prev => {
          const filtered = prev.filter(item => item !== query);
          const updated = [query, ...filtered].slice(0, 5);
          localStorage.setItem('recentSearches', JSON.stringify(updated));
          return updated;
        });
      }, 1000); // Wait 1 second after user stops typing

      return () => clearTimeout(timeoutId);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const showRecentSearches = () => {
    const dropdown = document.getElementById('recent-searches');
    if (dropdown) {
      dropdown.classList.remove('hidden');
      dropdown.classList.add('opacity-100', 'scale-100');
      dropdown.classList.remove('opacity-0', 'scale-95');
    }
  };

  const hideRecentSearches = () => {
    const dropdown = document.getElementById('recent-searches');
    if (dropdown) {
      dropdown.classList.add('opacity-0', 'scale-95');
      dropdown.classList.remove('opacity-100', 'scale-100');
      setTimeout(() => {
        dropdown.classList.add('hidden');
      }, 200);
    }
  };

  const deleteRecentSearch = (searchToDelete: string) => {
    setRecentSearches(prev => {
      const updated = prev.filter(search => search !== searchToDelete);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
        <div className="container mx-auto py-8 px-4">
          {/* Header Section */}
          <div className="relative space-y-8 pb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl -z-10" />
            <div className="flex flex-col items-center text-center space-y-4">
              <h1 className="text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
                Fortnite Cosmetics
              </h1>
              <p className="text-zinc-400 text-lg max-w-[600px]">
                Explore the latest Fortnite cosmetics in our immersive browser
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-xl" />
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                <Input
                  placeholder="Search cosmetics..."
                  className="pl-12 bg-zinc-800/50 border-zinc-700/50 h-14 rounded-2xl shadow-xl text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-purple-500/50"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setIsDropdownVisible(true)}
                />
                
                {/* Recent Searches Dropdown */}
                {recentSearches.length > 0 && (
                  <div
                    id="recent-searches"
                    className={`absolute w-full mt-2 bg-zinc-800/95 border border-zinc-700/50 rounded-xl shadow-xl backdrop-blur-xl z-50 
                    transition-all duration-200 ease-out
                    ${isDropdownVisible 
                      ? 'opacity-100 translate-y-0 pointer-events-auto' 
                      : 'opacity-0 -translate-y-2 pointer-events-none'}`}
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700/50">
                      <span className="text-sm font-medium text-zinc-300">Recent Searches</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearRecentSearches}
                        className="h-8 px-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 transition-colors duration-200"
                      >
                        Clear
                        <X className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                    <div className="p-2 space-y-1">
                      {recentSearches.map((search, index) => (
                        <div
                          key={index}
                          className="group relative flex items-center w-full rounded-lg hover:bg-zinc-700/50 transition-colors duration-200"
                        >
                          <button
                            onClick={() => {
                              handleSearch(search);
                              setIsDropdownVisible(false);
                            }}
                            className="flex-1 flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-100"
                          >
                            <Clock className="h-4 w-4 text-zinc-400 group-hover:text-purple-400 transition-colors duration-200" />
                            <span className="truncate group-hover:translate-x-1 transition-transform duration-200">
                              {search}
                            </span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteRecentSearch(search);
                            }}
                            className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-full
                            text-zinc-400 hover:text-red-400 hover:bg-red-400/10 
                            transition-all duration-200 ease-in-out"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <Button
                onClick={handleRandomItem}
                disabled={isRandomizing}
                className="relative group px-6 py-6 rounded-xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-pink-500/20 rounded-xl blur group-hover:blur-xl transition-all duration-300" />
                <div className="relative flex items-center space-x-2 text-zinc-100">
                  <Shuffle className={cn(
                    "w-5 h-5 transition-all duration-500",
                    isRandomizing ? "animate-spin" : "group-hover:rotate-180"
                  )} />
                  <span className="text-lg font-medium">Surprise Me!</span>
                </div>
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-7 gap-4 bg-transparent h-auto p-0">
              {[
                { value: 'all', icon: Sparkles, label: 'All' },
                { value: 'outfit', icon: Crown, label: 'Outfits' },
                { value: 'pickaxe', icon: Sword, label: 'Pickaxes' },
                { value: 'backpack', icon: Shield, label: 'Back Blings' },
                { value: 'emote', icon: Music, label: 'Emotes' },
                { value: 'loadingscreen', icon: Image, label: 'Loading Screens' },
                { value: 'wrap', icon: Brush, label: 'Wraps' },
              ].map(({ value, icon: Icon, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={cn(
                    "data-[state=active]:bg-zinc-800 data-[state=active]:shadow-lg h-24 rounded-2xl border border-zinc-800/50",
                    "bg-zinc-900/50 hover:bg-zinc-800/50 transition-all duration-300",
                    "group"
                  )}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon className="h-6 w-6 text-zinc-400 group-data-[state=active]:text-purple-400" />
                    <span className="text-zinc-400 group-data-[state=active]:text-purple-400">{label}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex flex-wrap gap-2 mt-6 px-4">
              {rarityFilters.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => setActiveRarity(value)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                    "border border-zinc-800/50 shadow-lg",
                    "hover:scale-105 hover:shadow-xl",
                    activeRarity === value
                      ? `${color} text-white shadow-lg shadow-${color}/20`
                      : "bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800/50"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mt-4 px-4 justify-center">
              {seasonFilters.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => setActiveSeason(value)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                    "border border-zinc-800/50 shadow-lg",
                    "hover:scale-105 hover:shadow-xl",
                    activeSeason === value
                      ? `${color} text-white shadow-lg shadow-${color}/20`
                      : "bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800/50"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <TabsContent value={activeTab} className="mt-6">
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                {loading ? (
                  <LoadingFallback />
                ) : error ? (
                  <ErrorFallback error={error} resetErrorBoundary={() => {
                    setError(null);
                    setLoading(true);
                    const controller = new AbortController();
                    fetchCosmetics(controller.signal, setLoading, setError, setCosmetics);
                  }} />
                ) : (
                  <div className="min-h-screen">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 p-6">
                      {displayedItems.map((cosmetic) => (
                        <CosmeticCard key={cosmetic.id} cosmetic={cosmetic} />
                      ))}
                    </div>
                    {hasMore && (
                      <div className="flex justify-center py-8">
                        <div className="animate-pulse space-y-2 text-center">
                          <div className="h-4 w-24 bg-white/10 rounded" />
                          <p className="text-sm text-white/50">
                            {isLoading ? "Loading more items..." : "Scroll to load more"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ErrorBoundary>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <LoadingTimeout loading={loading} timeout={15000} />
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 p-4 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-all duration-300 backdrop-blur-xl"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}
      {selectedCosmetic && (
        <>
          <Dialog open={isRandomDialogOpen} onOpenChange={setIsRandomDialogOpen}>
            <DialogContent className="sm:max-w-[700px] p-0 bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-zinc-800/50 backdrop-blur-xl shadow-xl overflow-hidden">
              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-zinc-100">Random Find!</h2>
                    <p className="text-sm text-zinc-400">Here's what we discovered for you</p>
                  </div>
                  <DialogClose className="rounded-full p-2 transition-colors hover:bg-zinc-800/50">
                    <X className="h-4 w-4 text-zinc-400 hover:text-zinc-100" />
                  </DialogClose>
                </div>

                {/* Content */}
                <div className="space-y-6">
                  {/* Clickable Item Display */}
                  <div 
                    onClick={() => {
                      setIsRandomDialogOpen(false);
                      setIsDetailsDialogOpen(true);
                    }}
                    className="relative group rounded-xl overflow-hidden bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-zinc-800/50 cursor-pointer"
                  >
                    <div className="aspect-[16/9]">
                      <img
                        src={selectedCosmetic.images.featured || selectedCosmetic.images.icon}
                        alt={selectedCosmetic.name}
                        className="w-full h-full object-contain p-4 transform group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Item Info Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                      <h3 className="text-xl font-bold text-zinc-100 mb-1">{selectedCosmetic.name}</h3>
                      <p className="text-sm text-zinc-400 line-clamp-2">{selectedCosmetic.description}</p>
                    </div>

                    {/* Click Indicator */}
                    <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-black/50 p-3 rounded-full">
                        <Search className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={handleRandomItem}
                      disabled={isRandomizing}
                      className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 text-zinc-100"
                    >
                      <Shuffle className={cn(
                        "w-4 h-4 mr-2",
                        isRandomizing && "animate-spin"
                      )} />
                      {isRandomizing ? "Finding..." : "Try Another"}
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={cn("text-white bg-zinc-800/50", rarityColors[selectedCosmetic.rarity.value.toLowerCase()])}
                      >
                        {selectedCosmetic.rarity.value}
                      </Badge>
                      <Badge variant="outline" className="bg-zinc-800/50 text-zinc-400 border-zinc-700">
                        {selectedCosmetic.type.value}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Details Dialog */}
          <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
            <DialogContent className="sm:max-w-[700px] bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 border-zinc-800/50 backdrop-blur-xl shadow-xl">
              <CosmeticCard cosmetic={selectedCosmetic} />
            </DialogContent>
          </Dialog>
        </>
      )}
    </ErrorBoundary>
  );
}

export default App;
