import { differenceInMinutes } from "date-fns";
import React from "react";
import { convertMinutesToTimeString, getMinutesFromTimeString } from "../utils/conversions";


const WorkingTimeForm: React.FC<{lastChange: Date, saveWorkingTime: (time: number) => void}> = ({lastChange, saveWorkingTime}) => {
  const [worked, setWorked] = React.useState<string>('');

  const tillNow = () => {
    const diff = differenceInMinutes(new Date(), lastChange);
    setWorked(convertMinutesToTimeString(diff));
  }

  
  const parseTimeFromString = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const timeInMinutes = getMinutesFromTimeString(worked);
    saveWorkingTime(timeInMinutes);
    setWorked('');
  };

  return (
    <>
    <button onClick={tillNow}>till now</button>
    
    <form onSubmit={parseTimeFromString}>
      <input
        value={worked}
        name="working_time"
        className="time_input"
        placeholder="hh:mm"
        onChange={(e) => setWorked(e.target.value)}
        pattern=""
        type="time"
      />
      <button type="submit">+</button>
    </form>
    </>
  )
}

export default WorkingTimeForm