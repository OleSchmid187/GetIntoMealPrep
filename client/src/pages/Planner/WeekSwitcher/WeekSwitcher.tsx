import React from 'react';
import './WeekSwitcher.css';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { getWeekRange } from '../../../utils/dateUtils'; // <– Pfad ggf. anpassen

interface WeekSwitcherProps {
  weekOffset: number;
  setWeekOffset: (offset: number) => void;
}

const WeekSwitcher: React.FC<WeekSwitcherProps> = ({ weekOffset, setWeekOffset }) => {
  const handlePrevious = () => setWeekOffset(weekOffset - 1);
  const handleNext = () => setWeekOffset(weekOffset + 1);

  const weekText = weekOffset === 0 ? 'Woche aktuell' : `Woche +${weekOffset}`;
  const { label: dateRange } = getWeekRange(weekOffset);

  return (
    <div className="week-switcher">
      <button onClick={handlePrevious} className="week-button">
        <MdChevronLeft />
        Zurück
      </button>
      <span className="week-label">
        {weekText} · {dateRange}
      </span>
      <button onClick={handleNext} className="week-button">
        Weiter
        <MdChevronRight />
      </button>
    </div>
  );
};

export default WeekSwitcher;
