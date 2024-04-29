import React, { useState } from 'react';
import { formatISO, format, sub, differenceInMinutes } from 'date-fns';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
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

async function getDays(db) {
  const daysCol = collection(db, 'days');
  const daySnapshot = await getDocs(daysCol);
  const dayList = daySnapshot.docs.map((doc) => doc.data());
  return dayList;
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

function getWeekHistoryFrom() {
  let someDay = sub(new Date(), { days: 1 });
  let weekOvertime = 0;
  const history = [];
  while (format(someDay, 'ii') != '07') {
    const storageName = `todays_time_${formatISO(someDay, {
      representation: 'date',
    })}`;

    const historyTime = localStorage.getItem(storageName);
    const workedMinutes = getMinutesFromTimeString(historyTime);
    const overtime = workedMinutes != 0 ? workedMinutes - 8 * MINUTES : 0;
    weekOvertime += overtime;
    history.push({
      id: crypto.randomUUID(),
      date: formatISO(someDay, {
        representation: 'date',
      }),
      time: historyTime,
      overtime,
    });
    someDay = sub(someDay, { days: 1 });
  }
  return { history, weekOvertime };
}

function App() {
  // const [user] = useAuthState(auth);
  const todayDate = React.useMemo(
    () => formatISO(new Date(), { representation: 'date' }),
    []
  );

  // load last week
  let { history, weekOvertime } = getWeekHistoryFrom();

  const todaysTime = localStorage.getItem(`todays_time_${todayDate}`);
  const lastStringDate = localStorage.getItem('todays_time_last_edit');
  const lastEdit =
    lastStringDate != null ? format(lastStringDate, " 'at' H:mm") : '';
  const [final, setFinal] = useState(todaysTime ?? '00:00');
  const todayWorked = React.useRef<HTMLInputElement>(null);
  const hasWorkedEnough = React.useRef(false);
  const finalInMinutes = getMinutesFromTimeString(final);
  weekOvertime += finalInMinutes - 8 * MINUTES;

  React.useEffect(() => {
    const func = async (): Promise<void> => {
      const days = await getDays(db);
      console.log(days);
    };
    void func();
  }, []);

  const parseTimeFromString = (event: any) => {
    event.preventDefault();
    const time = event.target.working_time.value;
    const timeInMinutes = getMinutesFromTimeString(time);
    const finalTimeInMinutes = getMinutesFromTimeString(final) + timeInMinutes;
    hasWorkedEnough.current = finalTimeInMinutes >= 8 * MINUTES;
    const finalFormated = convertMinutesToTimeString(finalTimeInMinutes);
    setFinal(finalFormated);
    localStorage.setItem(`todays_time_${todayDate}`, finalFormated);
    localStorage.setItem('todays_time_last_edit', new Date().toString());
    if (todayWorked.current != null) {
      todayWorked.current.value = '';
    }
  };

  const tillNow = () => {
    if (lastStringDate != null && todayWorked.current != null) {
      const diff = differenceInMinutes(new Date(), new Date(lastStringDate));
      todayWorked.current.value = convertMinutesToTimeString(diff);
    }
  };

  const setNow = () => {
    localStorage.setItem('todays_time_last_edit', new Date().toString());
  };

  return (
    <>
      <div className="card">
        <p>
          Last week - work times in the format <i>hh:mm</i>.
        </p>
        <div className="time">
          {history
            .sort((a, b) => (a.date > b.date ? 1 : -1))
            .map((day) => (
              <div className="time_item" key={day.id}>
                {day.date}:{' '}
                <i className={day.overtime > 0 ? 'time_ok' : 'time_not_good'}>
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
              className={hasWorkedEnough.current ? 'time_ok' : 'time_not_good'}
            >
              {final}
            </i>
            <i className={weekOvertime >= 0 ? 'time_ok' : 'time_not_good'}>
              {`(${convertMinutesToTimeWithSign(weekOvertime)}) ${lastEdit}`}
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
        <button onClick={() => setFinal('00:00')}>clear today</button>
      </div>
    </>
  );
}

export default App;
