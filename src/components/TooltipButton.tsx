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
                     h-8 w-8 md:h-9 md:w-9 transition-bounce hover:shadow-glow hover:border-primary/30 hover:scale-105 ${className}`}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};
