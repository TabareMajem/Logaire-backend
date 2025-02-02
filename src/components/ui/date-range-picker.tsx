// src/components/ui/date-range-picker.tsx

"use client";

import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import CSS for the date picker
import { Calendar } from "lucide-react"; // You can customize this icon
import { Input } from "./input"; // Assuming you have an Input component for consistent styling

export interface DateRange {
    start: Date;
    end: Date;
  }

interface DateRangePickerProps {
  value: { from: Date; to: Date } | undefined;
  onChange: (range: { from: Date; to: Date } | undefined) => void;
}

export const DateRangePicker = ({ value, onChange }: DateRangePickerProps) => {
  const handleChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    if (start && end) {
      onChange({ from: start, to: end });
    } else {
      onChange(undefined);
    }
  };

  return (
    <div className="relative">
      <DatePicker
        selected={value?.from}
        onChange={handleChange}
        startDate={value?.from}
        endDate={value?.to}
        selectsRange
        inline
        dateFormat="MM/dd/yyyy"
        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md"
        customInput={<Input />}
        renderCustomHeader={({
          date,
          changeYear,
          changeMonth,
          decreaseMonth,
          increaseMonth,
        }) => (
          <div className="flex items-center justify-between mb-2">
            <button onClick={decreaseMonth}>{"<"}</button>
            <span>{`${date.getMonth() + 1}/${date.getFullYear()}`}</span>
            <button onClick={increaseMonth}>{">"}</button>
          </div>
        )}
      />
      <div className="absolute top-1/2 left-3 -translate-y-1/2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
};
