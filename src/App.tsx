import React, { useState } from 'react';
import { formatISO, format, sub, differenceInMinutes } from 'date-fns';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, Firestore, doc, setDoc, where, query, Timestamp } from 'firebase/firestore/lite';
// import { getAuth, signInAnonymously } from 'firebase/auth';
// import 'firebase/firestore';
// import 'firebase/auth';
import './App.css';
// import { useAuthState } from 'react-firebase-hooks/auth';
// import { useCollectionData } from 'react-firebase-hooks/firestore';

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
});

const formatISODate = (date: Date) => formatISO(date, { representation: 'date' });

// const auth = getAuth();
// signInAnonymously(auth)
//   .then(() => {
//     // Signed in..
//   })
//   .catch((error) => {
//     const errorCode = error.code;
//     const errorMessage = error.message;
//     // ...
//   });

const db = getFirestore(app);

async function getDays(db: Firestore): Promise<WorkingDay[]> {
  const daysCol = collection(db, 'days');
  const daySnapshot = await getDocs(daysCol);
  const dayList: WorkingDay[] = daySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id} as WorkingDay));
  return dayList;
}

async function getToday(db: Firestore): Promise<WorkingDay> {
  const daysCol = collection(db, 'days');
  const daySnapshot = await getDocs(query(daysCol, where('stringDate', '==', formatISODate(new Date()))));
  const stringToday = formatISODate(new Date());
  const todaySnapshot = daySnapshot.docs.find((doc) => doc.data().stringDate === stringToday);
  const today = todaySnapshot?.data() as WorkingDayDB | undefined;
  const todayId = todaySnapshot?.id;
  console.log(todayId);
  if (today && todayId) {
    return {
      ...today,
      lastChange: new Date(today.lastChange.seconds * 1000),
      id: todayId,
      };
  } else {
    const newWorkday = {
      stringDate: stringToday,
      lastChange: new Date(),
      workedMinutes: 0,
    };
    
    const docRef = await addDoc(daysCol, newWorkday);
    console.log(docRef.id);
    return {...newWorkday, id: docRef.id};
  }
}

const MINUTES = 60;

function convertToHourFormat(hours = 0, minutes = 0) {
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;
}

function convertMinutesToTimeString(minutes: number) {
  const timeHours = Math.floor(Math.abs(minutes) / MINUTES);
  const timeMinutes = Math.abs(minutes) - timeHours * MINUTES;
  return convertToHourFormat(timeHours, timeMinutes);
}

function convertMinutesToTimeWithSign(minutes: number) {
  return `${minutes >= 0 ? '+' : '-'}${convertMinutesToTimeString(minutes)}`;
}

function getMinutesFromTimeString(hoursFormat: string | null) {
  if (hoursFormat == null || hoursFormat === '') {
    return 0;
  }
  const [hours, minutes] = hoursFormat?.split(':') ?? ['0', '0'];
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0;
  }
  return Number(hours) * MINUTES + Number(minutes);
}

async function getWeekHistoryFrom() {
  let someDay = sub(new Date(), { days: 1 });
  let weekOvertime = 0;
  const history: HistoryDay[] = [];
  while (format(someDay, 'ii') != '07') {
    const someDayString = formatISODate(someDay);
    console.log(someDayString);
    // const storageName = `todays_time_${someDayString}`;

    // const historyTime = localStorage.getItem(storageName);
    // const workedMinutes = getMinutesFromTimeString(historyTime);
    // const overtime = workedMinutes != 0 ? workedMinutes - 8 * MINUTES : 0;
    // weekOvertime += overtime;
    // history.push({
    //   id: crypto.randomUUID(),
    //   date: someDayString,
    //   time: historyTime,
    //   overtime,
    // });
    const savedWorkDays = await getDays(db);
    const daysCol = collection(db, 'days');
    const workingDay = savedWorkDays.find((day) => day.stringDate === someDayString);
    if (workingDay != null) {
      const overtime = workingDay.workedMinutes - 8 * MINUTES;
      weekOvertime += overtime;
      // read data
      history.push({
        id: workingDay.id,
        date: workingDay.stringDate,
        time: convertMinutesToTimeString(workingDay.workedMinutes),
        overtime,
      });
    } else {
      const newDate = {
        stringDate: formatISODate(someDay),
        lastChange: new Date(),
        workedMinutes: 0,
      }
      const res = await addDoc(daysCol, newDate);
      history.push({
        id: res.id,
        date: newDate.stringDate,
        time: '00:00',
        overtime: 0 - 8 * MINUTES,
      });
      console.log(res.id);
    }
    someDay = sub(someDay, { days: 1 });

  }
  return { history, weekOvertime };
}

const dayDoc = (dayId: string) => doc(db, "days", dayId)

const updateDay = async (dayId: string, data: WorkedTime): Promise<void> => {
  return setDoc(dayDoc(dayId), data, { merge: true });
}

interface HistoryDay {
  id: string;
  date: string;
  time: string;
  overtime: number;
}

interface WorkedTime {
  lastChange: Date;
  workedMinutes: number;
}
interface WorkingDay extends WorkedTime {
  stringDate: string;
  id: string;
}

interface WorkingDayDB {
  stringDate: string;
  lastChange: Timestamp;
  workedMinutes: number;
  id: string;
}

function App() {
  // const [user] = useAuthState(auth);
  const todayDate = React.useMemo(
    () => formatISODate(new Date()),
    []
  );

  // load last week
  const [weekHistory, setWeekHistory] = useState<HistoryDay[]>([]);
  const [weekOvertime, setWeekOvertime] = useState(0);
  const isEffectRunning = React.useRef(false);
  // let { history, weekOvertime } = { history: [], weekOvertime: 0}


  const [workingDay, setWorkingDay] = useState<WorkingDay>({
    stringDate: todayDate,
    lastChange: new Date(),
    workedMinutes: 0,
    id: 'empty'
  });

  // const todaysTime = localStorage.getItem(`todays_time_${todayDate}`);
  const lastEdit = format(workingDay.lastChange, " 'at' H:mm");
  const todayWorked = React.useRef<HTMLInputElement>(null);
  // const finalInMinutes = workingDay.workedMinutes;
  const currentOvertime = weekOvertime + workingDay.workedMinutes - 8 * MINUTES;

  React.useEffect(() => {
    const func = async (): Promise<void> => {
      const { history, weekOvertime } = await getWeekHistoryFrom();
      setWeekHistory(history);
      setWeekOvertime(weekOvertime);
      // const days = await getDays(db);
      // console.log(days);
      const workDay = await getToday(db);
      console.log("todayData", workDay);
      setWorkingDay(workDay);
      // setFinal(convertMinutesToTimeString(todayData.workedMinutes));
    };
    if (!isEffectRunning.current) {
      console.log('useEffect');
      isEffectRunning.current = true;
      void func();
    }
  }, []);

  const parseTimeFromString = async (event: any) => {
    event.preventDefault();
    const time = event.target.working_time.value;
    const timeInMinutes = getMinutesFromTimeString(time);
    const finalTimeInMinutes = workingDay.workedMinutes + timeInMinutes;
    if (todayWorked.current != null) {
      todayWorked.current.value = '';
    }

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

  const tillNow = () => {
    if (todayWorked.current != null) {
      const diff = differenceInMinutes(new Date(), workingDay.lastChange);
      todayWorked.current.value = convertMinutesToTimeString(diff);
    }
  };

  const setNow = () => {
    const { id, workedMinutes } = workingDay;
    updateDay(id, {lastChange: new Date(), workedMinutes});
    setWorkingDay({...workingDay, lastChange: new Date()});
  };

  return (
    <>
      <div className="card">
        <p>
          Last week - work times in the format <i>hh:mm</i>.
        </p>
        <div className="time">
          {weekHistory
            .sort((a, b) => (a.date > b.date ? 1 : -1))
            .map((day) => (
              <div className="time_item" key={day.id}>
                {day.date}:{' '}
                <i className={day.overtime >= 0 ? 'time_ok' : 'time_not_good'}>
                  {day.time
                    ? `${day.time} (${convertMinutesToTimeWithSign(
                        day.overtime
                      )})`
                    : 'NOT WORKED'}
                </i>
              </div>
            ))}
          {/* </div>
        <div className="time"> */}
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
        </div>
        <button onClick={setNow}>set now</button>
        <div className="timer">
          <button onClick={tillNow}>till now</button>
          <form onSubmit={parseTimeFromString}>
            <input
              ref={todayWorked}
              name="working_time"
              className="time_input"
              placeholder="hh:mm"
              pattern=""
              type="time"
            />
            <button type="submit">+</button>
          </form>
        </div>
        <button onClick={() => {
          updateDay(workingDay.id, { lastChange: new Date(), workedMinutes: 0})
          setWorkingDay({...workingDay, workedMinutes: 0})
        }}>clear today</button>
      </div>
    </>
  );
}

export default App;
