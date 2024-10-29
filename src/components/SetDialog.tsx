import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Cosmetic } from '@/types';
import { useState, useEffect } from 'react';

type SetDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  setName: string;
  items: Cosmetic[];
};

export function SetDialog({ isOpen, onOpenChange, setName, items }: SetDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "max-w-7xl h-[90vh] backdrop-blur-2xl bg-black/40 border-white/5",
        "shadow-[0_0_50px_-12px] shadow-black",
        "after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-br",
        "after:from-white/[0.08] after:to-transparent after:pointer-events-none",
      )} closeButton={false}>
        <div className="relative p-6">
          {/* Ambient Glow */}
          <div className="absolute -inset-[150px] opacity-20 blur-[100px] -z-10 bg-purple-500" />

          {/* Content Container */}
          <div className="relative z-10 space-y-6">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <DialogTitle className="text-2xl font-medium text-white/90">
                    {setName} Set
                  </DialogTitle>
                  <DialogDescription className="text-white/70">
                    {items.length} items in this set
                  </DialogDescription>
                </div>
                <DialogClose className="rounded-full p-2 bg-black/20 hover:bg-black/40 transition-colors">
                  <X className="h-5 w-5 text-white/70" />
                </DialogClose>
              </div>
            </DialogHeader>

            <ScrollArea className="h-[calc(90vh-140px)] pr-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {items.map((item) => (
                  <div key={item.id} className="group relative h-[320px] overflow-hidden rounded-lg bg-black/20 backdrop-blur-xl border border-white/5">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    
                    <div className="p-4 h-full flex flex-col">
                      <div className="relative flex-1 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                        <img
                          src={item.images.icon}
                          alt={item.name}
                          className="w-full h-full object-contain transform transition-all duration-500 group-hover:scale-110 group-hover:-rotate-2"
                          loading="lazy"
                        />
                      </div>
                      
                      <div className="mt-auto space-y-3">
                        <div className="relative">
                          <div className="absolute inset-0 -m-2 bg-black/50 backdrop-blur-md rounded-xl" />
                          <div className="relative p-0.5">
                            <h3 className="text-base font-medium text-white/90 truncate">
                              {item.name}
                            </h3>
                            <p className="text-sm text-white/70 mt-1 line-clamp-2 min-h-[2.5rem]">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-black/30 backdrop-blur-md border border-white/10 text-white/70 text-xs">
                            {item.type.value}
                          </Badge>
                          <Badge className="bg-black/30 backdrop-blur-md border border-white/10 text-white/70 text-xs">
                            {item.rarity.value}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 