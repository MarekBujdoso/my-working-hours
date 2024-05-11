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

  const updateWorkingDay = async (workingDay: WorkingDay) => {
    setWorkingDay(workingDay);
    updateDay(workingDay.id, {lastChange: new Date(), workedMinutes: workingDay.workedMinutes});
  }

  const saveWorkingTime = (workedMinutes: number) => {
    const finalTimeInMinutes = workingDay.workedMinutes + workedMinutes;
    updateWorkingDay({...workingDay, lastChange: new Date(), workedMinutes: finalTimeInMinutes});
  };

  const clearToday = React.useCallback(() => {
    updateWorkingDay({...workingDay, lastChange: new Date(), workedMinutes: 0})
  }, [workingDay])


  const fromNow = React.useCallback(() => {
    updateWorkingDay({...workingDay, lastChange: new Date()});
  }, [workingDay]);

  return (
    <>
      <Today workingDay={workingDay} currentOvertime={currentOvertime} clearToday={clearToday} todayEnd={todayEnd} />
      <div className="time_controls">
        <button onClick={fromNow}>from now</button>
        <WorkingTimeForm lastChange={workingDay.lastChange} saveWorkingTime={saveWorkingTime} />
      </div>
    </>
  )
  
}

export default WorkingTimeControls