import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { HistoricalEvent } from '@/types/event';
import { exportToCSV, exportToJSON } from '@/utils/exportData';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ExportButtonProps {
  events: HistoricalEvent[];
  filteredEvents: HistoricalEvent[];
}

export const ExportButton = ({ events, filteredEvents }: ExportButtonProps) => {
  const { toast } = useToast();

  const handleExport = (format: 'csv' | 'json', useFiltered: boolean) => {
    const data = useFiltered ? filteredEvents : events;
    const prefix = useFiltered ? 'filtered-' : '';
    
    if (format === 'csv') {
      exportToCSV(data, `${prefix}evid-events.csv`);
    } else {
      exportToJSON(data, `${prefix}evid-events.json`);
    }
    
    toast({
      title: "Export successful",
      description: `Exported ${data.length} events as ${format.toUpperCase()}`,
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="shadow-elevated backdrop-blur-strong gradient-card border-border/50 
                           h-9 w-9 transition-bounce hover:shadow-glow hover:border-primary/30 hover:scale-105"
              >
                <Download className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Export data</p>
          </TooltipContent>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => handleExport('csv', true)}>
              Export Filtered as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('json', true)}>
              Export Filtered as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('csv', false)}>
              Export All as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('json', false)}>
              Export All as JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>
    </TooltipProvider>
  );
};
