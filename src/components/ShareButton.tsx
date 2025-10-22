import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Check, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ShareButtonProps {
  searchQuery?: string;
  selectedTypes?: string[];
  yearRange?: [number, number];
}

export const ShareButton = ({ searchQuery, selectedTypes, yearRange }: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateShareUrl = () => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('q', searchQuery);
    if (selectedTypes && selectedTypes.length > 0) params.set('types', selectedTypes.join(','));
    if (yearRange) params.set('years', `${yearRange[0]}-${yearRange[1]}`);
    
    url.search = params.toString();
    return url.toString();
  };

  const handleCopy = async () => {
    const shareUrl = generateShareUrl();
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share this link with others to show them your filters",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please try again",
      });
    }
  };

  const handleNativeShare = async () => {
    const shareUrl = generateShareUrl();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'EVID - Historical Events',
          text: 'Check out these historical events on EVID',
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed');
      }
    } else {
      handleCopy();
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <Popover>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="shadow-elevated backdrop-blur-strong gradient-card border-border/50 
                           h-9 w-9 transition-bounce hover:shadow-glow hover:border-primary/30 hover:scale-105"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Share map with filters</p>
          </TooltipContent>
          <PopoverContent className="w-64 p-3" align="end">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-3">
                Share this view with others
              </p>
              {navigator.share && (
                <Button
                  onClick={handleNativeShare}
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              )}
              <Button
                onClick={handleCopy}
                variant="secondary"
                size="sm"
                className="w-full justify-start"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </Tooltip>
    </TooltipProvider>
  );
};
