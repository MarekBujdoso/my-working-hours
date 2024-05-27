import { format } from "date-fns/format"
import { convertMinutesToTimeString, convertMinutesToTimeWithSign, MINUTES } from "../utils/conversions"
import { WorkingDay } from "../utils/types"
import { Button } from "./ui/button"


const Today: React.FC<{workingDay: WorkingDay, currentOvertime: number, clearToday: () => void, todayEnd: string}> = (
  {workingDay, currentOvertime, clearToday, todayEnd}) => {
  const lastEdit = format(workingDay.lastChange, " 'at' H:mm")
  return (
    <div className="time">
      <div className="flex justify-between items-center gap-5 border-solid border-t-2 border-slate-300 mb-4 pt-4">
        <div className="left_column text-xl">
          <div>Today{lastEdit}</div>
          <div className={workingDay.workedMinutes >= MINUTES * 8 ? 'text-green-400' : 'text-orange-600'}>
              {convertMinutesToTimeString(workingDay.workedMinutes)}
            <i className={currentOvertime >= 0 ? 'text-green-400' : 'text-orange-600'}>
              {` (${convertMinutesToTimeWithSign(currentOvertime)})`}
            </i>
          </div>
          <div className="text-slate-400"><span>Finish at </span>{todayEnd}</div>
        </div>
        <Button variant="destructive" className="text-lg" onClick={clearToday}>x</Button>
      </div>
    </div>
  )
}

export default Today