import {Timestamp} from 'firebase/firestore/lite';

export interface HistoryDay {
  id: string;
  date: string;
  time: string;
  overtime: number;
}

export interface WorkedTime {
  lastChange: Date;
  workedMinutes: number;
}

export interface WorkingDay extends WorkedTime {
  stringDate: string;
  id: string;
}

export interface WorkingDayDB {
  stringDate: string;
  lastChange: Timestamp;
  workedMinutes: number;
  id: string;
}