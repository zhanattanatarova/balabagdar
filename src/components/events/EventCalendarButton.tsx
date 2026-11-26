import { CalendarPlus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/hooks/useLanguage";
import { buildEventCalendar, googleCalendarUrl, type CalendarEvent } from "@/lib/eventCalendar";

const labels = {
  ru: { save: "В календарь", file: "Apple / другой календарь (.ics)" },
  kz: { save: "Күнтізбеге қосу", file: "Apple / басқа күнтізбе (.ics)" },
  en: { save: "Add to calendar", file: "Apple / other calendar (.ics)" },
};

export default function EventCalendarButton({ event }: { event: CalendarEvent }) {
  const { lang } = useLanguage();
  const ui = labels[lang];
  const url = `${window.location.origin}/publication/${event.id}`;
  const googleUrl = googleCalendarUrl(event, url);
  if (!googleUrl) return null;

  const download = () => {
    const content = buildEventCalendar(event, url);
    if (!content) return;
    const objectUrl = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `balahub-event-${event.id}.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="max-w-full text-xs whitespace-normal h-auto min-h-9">
          <CalendarPlus size={16} className="shrink-0" />{ui.save}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-w-[calc(100vw-2rem)]">
        <DropdownMenuItem asChild><a href={googleUrl} target="_blank" rel="noopener noreferrer"><CalendarPlus size={16} />Google Calendar</a></DropdownMenuItem>
        <DropdownMenuItem onSelect={download}><Download size={16} />{ui.file}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}