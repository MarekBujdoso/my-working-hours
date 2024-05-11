import { format } from "date-fns/format"
import { convertMinutesToTimeString, convertMinutesToTimeWithSign, MINUTES } from "../utils/conversions"
import { WorkingDay } from "../utils/types"


const Today: React.FC<{workingDay: WorkingDay, currentOvertime: number, clearToday: () => void, todayEnd: string}> = (
  {workingDay, currentOvertime, clearToday, todayEnd}) => {
  const lastEdit = format(workingDay.lastChange, " 'at' H:mm")
  return (
    <div className="time">
      <div className="top_border">
        <div className="left_column">
          <div>Today{lastEdit}</div>
          <div>
            <i
              className={workingDay.workedMinutes >= MINUTES * 8 ? 'time_ok' : 'time_not_good'}
            >
              {convertMinutesToTimeString(workingDay.workedMinutes)}
            </i>
            <i className={currentOvertime >= 0 ? 'time_ok' : 'time_not_good'}>
              {` (${convertMinutesToTimeWithSign(currentOvertime)})`}
            </i>
          </div>
          <div><span>Finish at </span>{todayEnd}</div>
        </div>
        <button onClick={clearToday}>x</button>
      </div>
    </div>
  )
}

export default Today