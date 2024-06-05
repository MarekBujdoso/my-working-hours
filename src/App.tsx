import { signInWithEmailAndPassword, User } from 'firebase/auth';
import React, { useState } from 'react';
import './App.css';
import WeekHistory from './components/WeekHistory';
import WorkingTimeControls from './components/WorkingTimeControls';
import { auth, formatISODate, getWeekHistoryFrom } from './utils/dbUtils';
import { HistoryDay } from './utils/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
// import { useAuthState } from 'react-firebase-hooks/auth';


function App() {
  // const [user] = useAuthState(auth);
  // console.log(user);
  const todayDate = React.useMemo(
    () => formatISODate(new Date()),
    []
  );
  const [user, setUser] = useState<User | null | undefined>(undefined);

  // load last week
  const [weekHistory, setWeekHistory] = useState<HistoryDay[]>([]);
  const [weekOvertime, setWeekOvertime] = useState(0);
  const isEffectRunning = React.useRef(false);


  React.useEffect(() => {
    const userEmail = localStorage.getItem('user_email');
    const userPassword = localStorage.getItem('user_password');
    if (userEmail && userPassword) {
      signInWithEmailAndPassword(
        auth,
        userEmail,
        userPassword
      )
        .then((credentials) => {
          // Signed in..
          // console.log("signed in", { credentials });
          setUser(credentials.user);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error(errorCode, errorMessage);
          setUser(null);
          // ...
        });
    } else {
      setUser(null);
    }
  }, []);
  
  React.useEffect(() => {
    const func = async (user: User): Promise<void> => {
      const { history, weekOvertime } = await getWeekHistoryFrom(user);
      setWeekHistory(history);
      setWeekOvertime(weekOvertime);
    };
    if (!isEffectRunning.current && user != null) {
      isEffectRunning.current = true;
      void func(user);
    }
  }, [user]);

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userEmail = (event.target as HTMLFormElement).user_email.value;
    const userPassword = (event.target as HTMLFormElement).user_password.value;
    const {user} = await signInWithEmailAndPassword(
      auth,
      userEmail,
      userPassword
    )
    if (user) {
      setUser(user);
      localStorage.setItem('user_email', userEmail);
      localStorage.setItem('user_password', userPassword);
    }
  }

  if (user === undefined) {
    return <div>Loading...</div>;
  }
  
  if (user === null) {
    return (
      <Card className="card">
        <form onSubmit={signIn}>
          <input type="email" placeholder="email" name="user_email" />
          <input type="password" placeholder="password" name="user_password" />
          <button>Sign in</button>
        </form>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-red shadow-md flex flex-col items-center">
        <CardHeader>
          <CardTitle>Working hours</CardTitle>
          <CardDescription>This week - work times in the format <i>hh:mm</i></CardDescription>
        </CardHeader>
        <CardContent className='w-full'>
          <WeekHistory weekHistory={weekHistory} />
        </CardContent>
      </Card>
      <WorkingTimeControls todayDate={todayDate} weekOvertime={weekOvertime} user={user} />
    </>
  );
}

export default App;
