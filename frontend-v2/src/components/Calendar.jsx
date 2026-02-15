import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns'
import './Calendar.css'

function Calendar({ selectedDate, onSelectDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="calendar-widget">
      <div className="calendar-header">
        <button 
          className="calendar-nav-btn"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="calendar-month">{format(currentMonth, 'MMMM yyyy')}</h3>
        <button 
          className="calendar-nav-btn"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="calendar-weekdays">
        {weekDays.map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {daysInMonth.map(day => (
          <button
            key={day.toString()}
            className={`calendar-day ${isSameDay(day, selectedDate) ? 'selected' : ''} ${isSameDay(day, new Date()) ? 'today' : ''}`}
            onClick={() => onSelectDate(day)}
          >
            {format(day, 'd')}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Calendar
