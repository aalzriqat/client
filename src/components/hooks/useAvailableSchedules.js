import { useMemo, useCallback } from "react";

const useAvailableSchedules = (schedules, users, user, selectedWeek) => {
  const parseStartTime = useCallback((timeRange) => {
    if (!timeRange) {
      console.error("Time range is undefined or null:", timeRange);
      return 0;
    }
    const [start] = timeRange.split("-").map(time => time.trim());
    if (!start) {
      console.error("Invalid time range format:", timeRange);
      return 0;
    }
    const [startHours, startMinutes] = start.split(":").map(Number);
    if (isNaN(startHours) || isNaN(startMinutes)) {
      console.error("Invalid time values in time range:", timeRange);
      return 0;
    }
    return startHours * 60 + startMinutes;
  }, []);

  const isStartTimeGreaterOrEqual = useCallback((range1, range2) => {
    const start1 = parseStartTime(range1);
    const start2 = parseStartTime(range2);
    const result = start1 >= start2;
    return result;
  }, [parseStartTime]);

  return useMemo(() => {

    if (!schedules.length || !users.length || !user || !selectedWeek) {
      return [];
    }

    const requesterSchedule = schedules.find(schedule => schedule.user._id === user._id && schedule.week === selectedWeek);

    if (!requesterSchedule) {
      return [];
    }

    const eligibleSchedules = [];

    schedules.forEach(schedule => {
      if (schedule.week !== selectedWeek) {
        return;
      }

      const scheduleUser = users.find(u => u._id === schedule.user._id);

      if (!scheduleUser) {
        return;
      }

      if (scheduleUser._id === user._id) {
        return;
      }

      if (!scheduleUser.isOpenForSwap) {
        return;
      }

      if (scheduleUser.role !== "employee") {
        return;
      }

      if (!schedule.skill || schedule.skill !== requesterSchedule.skill) {
        return;
      }

      if (schedule.marketPlace !== requesterSchedule.marketPlace) {
        return;
      }

      const scheduleWorkingHours = schedule.workingHours;
      const requesterScheduleWorkingHours = requesterSchedule.workingHours;

      if (!scheduleWorkingHours || !requesterScheduleWorkingHours) {
        return;
      }

      const result = isStartTimeGreaterOrEqual(scheduleWorkingHours, requesterScheduleWorkingHours);

      if (result) {
        eligibleSchedules.push(schedule);
      }
    });

    return eligibleSchedules;
  }, [schedules, users, user, selectedWeek, isStartTimeGreaterOrEqual]);
};

export default useAvailableSchedules;