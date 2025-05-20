import { useMemo } from "react";
import { APISchedule, BackendUser, APIShift } from "../../apiServiceTypes"; 

// This hook's original purpose was to filter schedules available for a direct swap.
// With the new matchmaking system, its direct applicability has changed.
// It might be repurposed or its logic heavily adapted if a "browse potential direct swaps" feature is still needed.
// For now, updating types to resolve errors. The filtering logic will likely be incorrect.

const useAvailableSchedules = (
    allSchedules: APISchedule[],         
    mySchedules: APISchedule[],          
    currentUser: BackendUser | null      
): APISchedule[] => {                     

  return useMemo(() => {
    if (!allSchedules || allSchedules.length === 0 || !mySchedules || mySchedules.length === 0 || !currentUser) {
      return [];
    }

    const requesterPrimarySchedule = mySchedules.find(s => (typeof s.user === 'string' ? s.user : s.user._id) === currentUser._id);

    if (!requesterPrimarySchedule) {
      return [];
    }
    
    const latestSchedulesMap = allSchedules.reduce((map: Record<string, APISchedule>, schedule) => {
      const userId = typeof schedule.user === 'object' ? schedule.user._id : schedule.user;
      if (userId) {
        if (!map[userId] || new Date(schedule.createdAt) > new Date(map[userId].createdAt)) {
          map[userId] = schedule;
        }
      }
      return map;
    }, {});


    return allSchedules.filter((schedule: APISchedule) => {
      if (typeof schedule.user !== 'object' || !schedule.user?._id) {
        return false; 
      }
      const scheduleOwner = schedule.user as BackendUser; 

      if (scheduleOwner._id === currentUser._id) return false;
      
      // User-level isOpenForSwap was removed. Now only check schedule-level.
      if (!schedule.isOpenForSwap) { 
        return false;
      }
      if (scheduleOwner.role !== "employee") {
        return false;
      }
      
      if (requesterPrimarySchedule.skill && schedule.skill && requesterPrimarySchedule.skill !== schedule.skill) {
          // return false; 
      }
      if (requesterPrimarySchedule.marketPlace && schedule.marketPlace && requesterPrimarySchedule.marketPlace !== schedule.marketPlace) {
          // return false; 
      }

      const latestForThisUser = latestSchedulesMap[scheduleOwner._id];
      if (!latestForThisUser || schedule._id !== latestForThisUser._id) {
        return false;
      }
      
      return true; 
    });
  }, [allSchedules, mySchedules, currentUser]);
};

export default useAvailableSchedules;