"use client";

import { format, getWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ClockProps {
  currentTime: Date | null;
}

const Clock = ({ currentTime }: ClockProps) => {
  // Render placeholders on the server and during initial client render
  if (!currentTime) {
    return (
      <div className="text-right">
        <p className="text-4xl font-bold tracking-wider">--:--:--</p>
        <p className="text-lg text-muted-foreground capitalize">
          Chargement...
        </p>
        <p className="text-lg text-primary font-semibold">Semaine --</p>
      </div>
    );
  }

  // To display GMT time, date-fns needs to be "tricked" as it formats in local time.
  // We create a new Date object adjusted by the timezone offset.
  // This makes date-fns format the date as if it were in GMT.
  const userTimezoneOffset = currentTime.getTimezoneOffset() * 60000;
  const gmtEquivalentDate = new Date(currentTime.getTime() + userTimezoneOffset);

  const formattedDate = format(gmtEquivalentDate, 'EEEE d MMMM yyyy', { locale: fr });
  const formattedTime = format(gmtEquivalentDate, 'HH:mm:ss');
  const weekNumber = getWeek(gmtEquivalentDate, { locale: fr });

  return (
    <div className="text-right">
      <p className="text-4xl font-bold tracking-wider">{formattedTime}</p>
      <p className="text-lg text-muted-foreground capitalize">
        {formattedDate}
      </p>
      <p className="text-lg text-primary font-semibold">Semaine {weekNumber}</p>
    </div>
  );
};

export default Clock;
