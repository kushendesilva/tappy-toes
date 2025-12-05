import { useEffect, useState } from 'react';
import { todayKey } from '../utils/dateUtils';

export function useTodayKey() {
  const [key, setKey] = useState(() => todayKey());

  useEffect(() => {
    const update = () => {
      const next = todayKey();
      setKey(k => (k === next ? k : next));
    };

    function msUntilNextMinute() {
      return 60000 - (Date.now() % 60000);
    }

    let timer: any = setTimeout(function tick() {
      update();
      timer = setTimeout(tick, msUntilNextMinute());
    }, msUntilNextMinute());

    return () => clearTimeout(timer);
  }, []);

  return key;
}