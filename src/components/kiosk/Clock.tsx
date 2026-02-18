"use client";

import { useState, useEffect } from 'react';
import { format, getWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

const Clock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
