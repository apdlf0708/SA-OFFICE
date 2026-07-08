"use client";

import { useMemo, useState } from "react";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MONTH_NAMES = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

export default function Calendar() {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const list: { date: number; current: boolean; key: string }[] = [];

    for (let i = startWeekday - 1; i >= 0; i--) {
      list.push({ date: daysInPrevMonth - i, current: false, key: `p${i}` });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      list.push({ date: d, current: true, key: `c${d}` });
    }
    while (list.length % 7 !== 0 || list.length < 42) {
      const nextIndex = list.length - (startWeekday + daysInMonth);
      list.push({ date: nextIndex + 1, current: false, key: `n${nextIndex}` });
      if (list.length >= 42) break;
    }
    return list;
  }, [year, month]);

  const isToday = (date: number, current: boolean) =>
    current && date === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const goPrev = () => setCursor(new Date(year, month - 1, 1));
  const goNext = () => setCursor(new Date(year, month + 1, 1));
  const goToday = () => setCursor(new Date(today.getFullYear(), today.getMonth(), 1));

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-800">
            {year}년 {MONTH_NAMES[month]}
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={goPrev}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100"
          >
            ‹
          </button>
          <button
            onClick={goToday}
            className="px-3 h-8 flex items-center justify-center rounded-md border border-gray-300 text-sm text-gray-600 hover:bg-gray-100"
          >
            오늘
          </button>
          <button
            onClick={goNext}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100"
          >
            ›
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {WEEKDAYS.map((w, i) => (
            <div
              key={w}
              className={`text-center text-xs font-medium py-2.5 ${
                i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"
              }`}
            >
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((cell, i) => (
            <div
              key={cell.key}
              className={`h-24 border-b border-r border-gray-100 p-2 ${
                i % 7 === 6 ? "border-r-0" : ""
              } ${!cell.current ? "bg-gray-50/50" : ""}`}
            >
              <span
                className={`inline-flex items-center justify-center text-sm w-6 h-6 rounded-full ${
                  isToday(cell.date, cell.current)
                    ? "bg-slate-800 text-white font-medium"
                    : cell.current
                    ? i % 7 === 0
                      ? "text-red-500"
                      : i % 7 === 6
                      ? "text-blue-500"
                      : "text-gray-700"
                    : "text-gray-300"
                }`}
              >
                {cell.date}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
