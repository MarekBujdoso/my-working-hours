import { differenceInMinutes } from "date-fns";
import React from "react";
import { convertMinutesToTimeString, getMinutesFromTimeString } from "../utils/conversions";
import { Button } from "./ui/button";
import { Input } from "./ui/input";


const WorkingTimeForm: React.FC<{lastChange: Date, saveWorkingTime: (time: number) => void}> = ({lastChange, saveWorkingTime}) => {
  const [worked, setWorked] = React.useState<string>('');

  const tillNow = React.useCallback(() => {
    const diff = differenceInMinutes(new Date(), lastChange);
    setWorked(convertMinutesToTimeString(diff));
  }, [lastChange]);

  
  const parseTimeFromString = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const timeInMinutes = getMinutesFromTimeString(worked);
    saveWorkingTime(timeInMinutes);
    setWorked('');
  };

  return (
    <>
      <Button variant="outline" className="text-lg h-12" onClick={tillNow}>till now</Button> 
      <form style={{width: "100%"}} onSubmit={parseTimeFromString}>
        <div className="flex gap-1 justify-center">
          <Input
            className="dark:bg-slate-800 justify-center text-lg h-12 text-center rounded-lg hover:border-[#646cff] hover:bg-slate-100 transition:border-color duration-300"
            value={worked}
            name="working_time"
            // className="time_input"
            placeholder="hh:mm"
            onChange={(e) => setWorked(e.target.value)}
            pattern=""
            type="time"
          />
          <Button className="text-lg w-1/3 h-12" variant="outline" type="submit">+</Button>
        </div>
      </form>
    </>
  )
}

export default WorkingTimeForm