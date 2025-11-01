import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Facebook, Twitter, Link2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ShareButtonsProps {
  title: string;
  description: string;
  url?: string;
}

export const ShareButtons = ({ title, description, url }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  // Use production domain instead of staging
  const getShareUrl = () => {
    if (url) return url;
    const currentPath = window.location.pathname;
    return `https://evid.world${currentPath}`;
  };
  
  const shareUrl = getShareUrl();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled share
      }
    }
  };

  const shareOnTwitter = () => {
    const text = `${title} - ${description}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=420');
  };

  // Use native share on mobile if available
  if (navigator.share && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    return (
      <Button
        onClick={handleNativeShare}
        variant="outline"
        size="sm"
        className="gap-2 hover-scale"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 hover-scale"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="end">
        <div className="space-y-2">
          <p className="text-sm font-semibold mb-3">Share this event</p>
          
          <Button
            onClick={shareOnTwitter}
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            <Twitter className="h-4 w-4" />
            Share on Twitter
          </Button>

          <Button
            onClick={shareOnFacebook}
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            <Facebook className="h-4 w-4" />
            Share on Facebook
          </Button>

          <Button
            onClick={handleCopyLink}
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4" />
                Copy Link
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
