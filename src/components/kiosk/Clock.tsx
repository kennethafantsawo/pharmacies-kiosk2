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

  const formattedDate = format(currentTime, 'EEEE d MMMM yyyy', { locale: fr });
  const formattedTime = format(currentTime, 'HH:mm:ss');
  const weekNumber = getWeek(currentTime, { locale: fr });

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
