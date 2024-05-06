import { format } from "date-fns/format"
import { convertMinutesToTimeString, convertMinutesToTimeWithSign, MINUTES } from "../utils/conversions"
import { WorkingDay } from "../utils/types"


const Today: React.FC<{workingDay: WorkingDay, currentOvertime: number}> = ({workingDay, currentOvertime}) => {
  const lastEdit = format(workingDay.lastChange, " 'at' H:mm")
  return (
    <div className="time_item top_border">
      Today:{' '}
      <i
        className={workingDay.workedMinutes >= MINUTES * 8 ? 'time_ok' : 'time_not_good'}
      >
        {convertMinutesToTimeString(workingDay.workedMinutes)}
      </i>
      <i className={currentOvertime >= 0 ? 'time_ok' : 'time_not_good'}>
        {`(${convertMinutesToTimeWithSign(currentOvertime)}) ${lastEdit}`}
      </i>
    </div>
  )
}

export default Today