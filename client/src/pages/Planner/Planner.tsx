import './Planner.css';
import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function Planner() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [mealPlan, setMealPlan] = useState<MealPlan>({});

  interface MealPlan {
    [day: string]: {
      [time: string]: string;
    };
  }

  const handleMealChange = (day: string, time: string, meal: string): void => {
    setMealPlan((prev: MealPlan) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [time]: meal,
      },
    }));
  };

  const renderTable = () => {
    const times = ['Breakfast', 'Lunch', 'Dinner'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
      <table className="meal-table">
        <thead>
          <tr>
            <th>Time</th>
            {days.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {times.map((time) => (
            <tr key={time}>
              <td>{time}</td>
              {days.map((day) => (
                <td key={day}>
                  <input
                    type="text"
                    value={mealPlan[day]?.[time] || ''}
                    onChange={(e) => handleMealChange(day, time, e.target.value)}
                    placeholder="Add meal"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="planner-page">
      <h1>Wochenplaner</h1>
      <p>Hier kannst du deine Mahlzeiten für die Woche planen.</p>
      <Calendar
        onChange={(date) => {
          if (Array.isArray(date)) {
            if (date[0] instanceof Date) {
              setSelectedDate(date[0]); // Use the first date if it's an array
            }
          } else if (date instanceof Date) {
            setSelectedDate(date); // Use the date directly if it's a single Date
          }
        }}
        value={selectedDate}
        className="planner-calendar"
      />
      <div className="meal-planner">{renderTable()}</div>
    </div>
  );
}

export default Planner;
