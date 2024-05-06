import { format } from "date-fns/format";
import { sub } from "date-fns/sub";
import { User } from "firebase/auth";
import React from "react";
import { MINUTES } from "../utils/conversions";
import { getToday, updateDay } from "../utils/dbUtils";
import { WorkingDay } from "../utils/types";
import Today from "./Today";
import WorkingTimeForm from "./WorkingTimeForm";


const WorkingTimeControls: React.FC<{todayDate: string, weekOvertime: number, user: User | null}> = ({todayDate, weekOvertime, user}) => {
  const [workingDay, setWorkingDay] = React.useState<WorkingDay>({
    stringDate: todayDate,
    lastChange: new Date(),
    workedMinutes: 0,
    id: 'empty'
  });
  const currentOvertime = weekOvertime + workingDay.workedMinutes - 8 * MINUTES;
  const todayEnd = format(sub(workingDay.lastChange, {minutes: currentOvertime}), "H:mm");

  React.useEffect(() => {
    const func = async (user: User): Promise<void> => {
    const workDay = await getToday(user);
    console.log("todayData", workDay);
    setWorkingDay(workDay);
    }
    if (user !== null) {
      void func(user);
    }
  }, [user]);

  const saveWorkingTime = async (workedMinutes: number) => {
    const finalTimeInMinutes = workingDay.workedMinutes + workedMinutes;

    const newWorkday = {
      ...workingDay,
      stringDate: todayDate,
      lastChange: new Date(),
      workedMinutes: finalTimeInMinutes,
    };
    setWorkingDay(newWorkday);
    updateDay(workingDay.id, {lastChange: new Date(),
        workedMinutes: finalTimeInMinutes});
  };

  const setNow = () => {
    const { id, workedMinutes } = workingDay;
    updateDay(id, {lastChange: new Date(), workedMinutes});
    setWorkingDay({...workingDay, lastChange: new Date()});
  };

  return (
    <div className="time">
      <Today workingDay={workingDay} currentOvertime={currentOvertime} />
      <div className="time_item top_border"><span>Finish at </span>{todayEnd}</div>
      <button onClick={setNow}>set now</button>
        <div className="timer">
          <WorkingTimeForm lastChange={workingDay.lastChange} saveWorkingTime={saveWorkingTime} />
        </div>
        <button onClick={() => {
          updateDay(workingDay.id, { lastChange: new Date(), workedMinutes: 0})
          setWorkingDay({...workingDay, workedMinutes: 0})
        }}>clear today</button>
    </div>
  )
  
}

export default WorkingTimeControls