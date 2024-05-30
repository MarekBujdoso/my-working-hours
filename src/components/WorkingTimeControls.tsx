import { format } from "date-fns/format";
import { sub } from "date-fns/sub";
import { User } from "firebase/auth";
import React from "react";
import { MINUTES } from "../utils/conversions";
import { getToday, updateDay } from "../utils/dbUtils";
import { WorkingDay } from "../utils/types";
import Today from "./Today";
import WorkingTimeForm from "./WorkingTimeForm";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const WorkingTimeControls: React.FC<{todayDate: string, weekOvertime: number, user: User | null}> = ({todayDate, weekOvertime, user}) => {
  const [workingDay, setWorkingDay] = React.useState<WorkingDay>({
    stringDate: todayDate,
    lastChange: new Date(),
    workedMinutes: 0,
    id: 'empty'
  });
  const isEffectRunning = React.useRef(false);
  const currentOvertime = weekOvertime + workingDay.workedMinutes - 8 * MINUTES;
  const todayEnd = format(sub(workingDay.lastChange, {minutes: currentOvertime}), "H:mm");

  React.useEffect(() => {
    const func = async (user: User): Promise<void> => {
    const workDay = await getToday(user);
    setWorkingDay(workDay);
    }
    if (isEffectRunning.current === false && user !== null) {
      void func(user);
      isEffectRunning.current = true;
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

  const lastEdit = format(workingDay.lastChange, " 'at' H:mm")

  return (
    <Card className="bg-red shadow-md flex flex-col items-center">
      <CardHeader className="w-full">
        <CardTitle className="flex justify-between items-center ">
          <div>Today <span className="text-slate-400 text-lg">{lastEdit}</span></div>
          <Button variant="destructive" className="text-lg h-12" onClick={clearToday}>clear</Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="w-full">
      <Today workingDay={workingDay} currentOvertime={currentOvertime} todayEnd={todayEnd} />
      <div className="flex flex-col justify-between gap-1">
        <Button variant="outline" className="text-lg h-12" onClick={fromNow}>from now</Button>
        <WorkingTimeForm lastChange={workingDay.lastChange} saveWorkingTime={saveWorkingTime} />
      </div>
      </CardContent>
    </Card>
  )
  
}

export default WorkingTimeControls