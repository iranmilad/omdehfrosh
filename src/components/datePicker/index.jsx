import { ActionIcon, Button, Modal, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React, { useEffect, useState } from "react";
import jalaali from "jalaali-js";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconArrowRight,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";

const jalaliMonths = [
  { label: "فروردین", value: 1 },
  { label: "اردیبهشت", value: 2 },
  { label: "خرداد", value: 3 },
  { label: "تیر", value: 4 },
  { label: "مرداد", value: 5 },
  { label: "شهریور", value: 6 },
  { label: "مهر", value: 7 },
  { label: "آبان", value: 8 },
  { label: "آذر", value: 9 },
  { label: "دی", value: 10 },
  { label: "بهمن", value: 11 },
  { label: "اسفند", value: 12 },
];

function DatePicker(props) {
  const { children, ...other } = props;
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [yearRange, setYearRange] = useState([]);
  const [view, setView] = useState("year"); // Default view is 'year'

  useEffect(() => {
    const currentJalaliDate = jalaali.toJalaali(new Date());
    const [defaultYear, defaultMonth, defaultDay] =
      other.value?.split("/").map(Number) || [];
    setSelectedYear(defaultYear);
    setSelectedMonth(defaultMonth);
    setSelectedDay(defaultDay);
    updateYearRange(defaultYear || currentJalaliDate.jy);
  }, [other.value]);

  const updateYearRange = (centerYear) => {
    const newYearRange = Array.from(
      { length: 9 },
      (_, i) => centerYear - 4 + i
    );
    setYearRange(newYearRange);
  };

  const animationProps = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
    transition: { type: "spring", stiffness: 300, damping: 30 },
  };

  const getDaysInJalaliMonth = (year, month) => {
    return jalaali.jalaaliMonthLength(year, month);
  };

  const renderBackButton = () => {
    if (view === "month") {
      return (
        <button
          onClick={() => setView("year")}
          className="flex items-center text-gray-600 hover:text-black transition-colors mb-2"
        >
          <IconArrowRight className="w-4 h-4 ml-1" />
          انتخاب سال
        </button>
      );
    } else if (view === "day") {
      return (
        <button
          onClick={() => setView("month")}
          className="flex items-center text-gray-600 hover:text-black transition-colors mb-2"
        >
          <IconArrowRight className="w-4 h-4 ml-1" />
          انتخاب ماه
        </button>
      );
    }
    return null;
  };

  const changeDate = (number) => {
    other.onChange(item => {
        return `${selectedYear || "_"}/${selectedMonth || "_"}/${
          number?.day || "_"
        }`
    })
  }

  return (
    <>
      <TextInput
        {...other}
        readOnly
        pointer
        onClick={() => open()}
        value={`${selectedYear || "_"}/${selectedMonth || "_"}/${
          selectedDay || "_"
        }`}
      />
      <Modal opened={opened} onClose={close} centered>
        {renderBackButton()}
        <AnimatePresence mode="wait">
          {view === "year" && (
            <YearSelection
              animationProps={animationProps}
              handleYearClick={(year) => {
                setSelectedYear(year);
                setView("month");
                changeDate({year})
              }}
              handleYearRangeChange={(direction) => {
                const centerYear = yearRange[4];
                const newCenterYear =
                  direction === "prev" ? centerYear - 9 : centerYear + 9;
                updateYearRange(newCenterYear);
              }}
              yearRange={yearRange}
              selectedYear={selectedYear}
            />
          )}
          {view === "month" && (
            <MonthSelection
              animationProps={animationProps}
              handleMonthClick={(month) => {
                setSelectedMonth(month);
                setView("day");
                changeDate({month})
              }}
              selectedMonth={selectedMonth}
              jalaliMonths={jalaliMonths}
            />
          )}
          {view === "day" && (
            <DaySelection
              animationProps={animationProps}
              handleDayClick={(day) => {
                setSelectedDay(day);
                changeDate({day})
                close();
              }}
              selectedDay={selectedDay}
              daysInMonth={getDaysInJalaliMonth(selectedYear, selectedMonth)}
            />
          )}
        </AnimatePresence>
      </Modal>
    </>
  );
}

const YearSelection = ({
  animationProps,
  handleYearClick,
  handleYearRangeChange,
  yearRange,
  selectedYear,
}) => {
  return (
    <motion.div key="year" {...animationProps} className="mb-4">
      <h3 className="text-lg font-semibold mb-2">انتخاب سال</h3>
      <div className="flex items-center justify-between mb-2">
        <ActionIcon radius={999} onClick={() => handleYearRangeChange("next")}>
          <IconChevronRight className="w-5 h-5" />
        </ActionIcon>
        <div className="flex-1 text-center font-semibold" dir="ltr">
          {yearRange[0]} - {yearRange[yearRange.length - 1]}
        </div>
        <ActionIcon radius={999} onClick={() => handleYearRangeChange("prev")}>
          <IconChevronLeft className="w-5 h-5" />
        </ActionIcon>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {yearRange.map((year) => (
          <Button
            variant={selectedYear === year ? "filled" : "light"}
            key={year}
            onClick={() => handleYearClick(year)}
          >
            {year}
          </Button>
        ))}
      </div>
    </motion.div>
  );
};

const MonthSelection = ({
  animationProps,
  handleMonthClick,
  selectedMonth,
  jalaliMonths,
}) => {
  return (
    <motion.div key="month" {...animationProps} className="mb-4">
      <h3 className="text-lg font-semibold mb-2">انتخاب ماه</h3>
      <div className="grid grid-cols-3 gap-2">
        {jalaliMonths.map((month) => (
          <Button
            key={month.value}
            onClick={() => handleMonthClick(month.value)}
            variant={selectedMonth === month.value ? "filled" : "light"}
          >
            {month.label}
          </Button>
        ))}
      </div>
    </motion.div>
  );
};

const DaySelection = ({
  animationProps,
  handleDayClick,
  selectedDay,
  daysInMonth,
}) => {
  return (
    <motion.div key="day" {...animationProps} className="mb-4">
      <h3 className="text-lg font-semibold mb-2">انتخاب روز</h3>
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
          <Button
            variant={selectedDay === day ? "filled" : "light"}
            key={day}
            onClick={() => handleDayClick(day)}
          >
            {day}
          </Button>
        ))}
      </div>
    </motion.div>
  );
};

export default DatePicker;
