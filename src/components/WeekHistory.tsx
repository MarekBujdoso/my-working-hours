import { convertMinutesToTimeWithSign } from "../utils/conversions"
import { HistoryDay } from "../utils/types"


const WeekHistory: React.FC<{weekHistory: HistoryDay[]}> = ({weekHistory}) => {

  return (
    <div className="w-full flex flex-col font-weight-400 font-size-lg h-24">
     {weekHistory
      .sort((a, b) => (a.date > b.date ? 1 : -1))
      .map((day) => (
        <div className="flex gap-2 justify-between items-start" key={day.id}>
          {day.date}:{' '}
          <i className={day.overtime >= 0 ? 'text-green-400' : 'text-orange-600'}>
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