import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TooltipButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  tooltip: string;
  variant?: 'secondary' | 'ghost' | 'outline';
  className?: string;
}

export const TooltipButton = ({ 
  onClick, 
  icon, 
  tooltip,
  variant = 'secondary',
  className = ''
}: TooltipButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={onClick}
          variant={variant}
          size="icon"
          className={`shadow-elevated backdrop-blur-strong gradient-card border-border/50 
                     h-7 w-7 transition-bounce hover:shadow-glow hover:border-primary/30 hover:scale-105 ${className}`}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p className="text-[10px]">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};
