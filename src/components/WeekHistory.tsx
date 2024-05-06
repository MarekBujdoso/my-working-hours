import { convertMinutesToTimeWithSign } from "../utils/conversions"
import { HistoryDay } from "../utils/types"


const WeekHistory: React.FC<{weekHistory: HistoryDay[]}> = ({weekHistory}) => {

  return (
    <div className="time">
     {weekHistory
      .sort((a, b) => (a.date > b.date ? 1 : -1))
      .map((day) => (
        <div className="time_item" key={day.id}>
          {day.date}:{' '}
          <i className={day.overtime >= 0 ? 'time_ok' : 'time_not_good'}>
            {day.time
              ? `${day.time} (${convertMinutesToTimeWithSign(
                  day.overtime
                )})`
              : 'NOT WORKED'}
          </i>
        </div>
      ))}
    </div>
  )
}

export default WeekHistory