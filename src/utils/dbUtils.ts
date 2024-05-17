import { format } from "date-fns/format";
import { formatISO } from "date-fns/formatISO";
import { sub } from "date-fns/sub";
import { initializeApp } from "firebase/app";
import { getAuth, User } from "firebase/auth";
import { addDoc, and, collection, doc, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore/lite";
import { convertMinutesToTimeString, MINUTES } from "./conversions";
import { HistoryDay, WorkedTime, WorkingDay, WorkingDayDB } from "./types";

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
});

export const db = getFirestore(app);
export const auth = getAuth();

export const formatISODate = (date: Date) => formatISO(date, { representation: 'date' });

export const dayDoc = (dayId: string) => doc(db, "days", dayId)

export const updateDay = async (dayId: string, data: WorkedTime): Promise<void> => {
  return setDoc(dayDoc(dayId), data, { merge: true });
}

export async function getToday(user: User): Promise<WorkingDay> {
  const daysCol = collection(db, 'days');
  const daySnapshot = await getDocs(query(daysCol, and(where('stringDate', '==', formatISODate(new Date())), where('userId', '==', user?.uid))));
  const stringToday = formatISODate(new Date());
  const todaySnapshot = daySnapshot.docs.find((doc) => doc.data().stringDate === stringToday);
  const today = todaySnapshot?.data() as WorkingDayDB | undefined;
  const todayId = todaySnapshot?.id;
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
      userId: user?.uid ?? undefined,
    };
    
    const docRef = await addDoc(daysCol, newWorkday);
    return {...newWorkday, id: docRef.id};
  }
}

export async function getDays(user: User): Promise<WorkingDay[]> {
  const daysCol = collection(db, 'days');
  const daySnapshot = await getDocs(query(daysCol, where('userId', '==', user.uid)));
  const dayList: WorkingDay[] = daySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id} as WorkingDay));
  return dayList;
}

export async function getWeekHistoryFrom(user: User) {
  let someDay = sub(new Date(), { days: 1 });
  let weekOvertime = 0;
  const history: HistoryDay[] = [];
  const savedWorkDays = await getDays(user);

  while (format(someDay, 'ii') != '07') {
    const someDayString = formatISODate(someDay);

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
        userId: user?.uid ?? undefined,
      }
      const res = await addDoc(daysCol, newDate);
      history.push({
        id: res.id,
        date: newDate.stringDate,
        time: '00:00',
        overtime: 0 - 8 * MINUTES,
      });
    }
    someDay = sub(someDay, { days: 1 });

  }
  return { history, weekOvertime };
}