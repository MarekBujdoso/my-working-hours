import { convertMinutesToTimeString, convertMinutesToTimeWithSign, MINUTES } from "../utils/conversions"
import { WorkingDay } from "../utils/types"


const Today: React.FC<{workingDay: WorkingDay, currentOvertime: number, todayEnd: string}> = (
  {workingDay, currentOvertime, todayEnd}) => {
  return (
      <div className="flex justify-between items-center gap-5 mb-4">
        <div className="flex flex-col items-start gpa-1 text-xl font-medium">
          <div className={workingDay.workedMinutes >= MINUTES * 8 ? 'text-green-400' : 'text-orange-600'}>
              worked: {convertMinutesToTimeString(workingDay.workedMinutes)}
            <i className={currentOvertime >= 0 ? 'text-green-400' : 'text-orange-600'}>
              {` (${convertMinutesToTimeWithSign(currentOvertime)})`}
            </i>
          </div>
          <div className="text-blue-600"><span>finish at </span>{todayEnd}</div>
        </div>
      </div>
  )
}

export default Today