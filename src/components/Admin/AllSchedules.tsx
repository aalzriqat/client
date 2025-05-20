import React, { useEffect, useState, useMemo, useCallback, ChangeEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchAllSchedules,
  selectAllSchedulesForAdmin,
  selectAdminScheduleLoading,
  selectAdminScheduleError,
  clearAdminScheduleError
} from '../../store/slices/adminScheduleSlice';
import SelectFilter from '../common/SelectFilter';
import LoadingMessage from '../common/LoadingMessage';
import ErrorMessage from '../common/ErrorMessage';
import * as XLSX from 'xlsx';
import { APISchedule, APIShift } from '../../apiServiceTypes'; // APIShift is also needed for explicit typing

const AllSchedules: React.FC = () => {
  const dispatch = useAppDispatch();
  const allSchedules = useAppSelector(selectAllSchedulesForAdmin); 
  const isLoading = useAppSelector(selectAdminScheduleLoading);
  const error = useAppSelector(selectAdminScheduleError);

  const [searchQuery, setSearchQuery] = useState('');
  const [usernameFilter, setUsernameFilter] = useState('');
  const [workingHoursFilter, setWorkingHoursFilter] = useState(''); 
  const [offDaysFilter, setOffDaysFilter] = useState(''); 
  const [weekFilter, setWeekFilter] = useState('');

  useEffect(() => {
    dispatch(fetchAllSchedules());
    return () => {
        dispatch(clearAdminScheduleError());
    }
  }, [dispatch]);

  const getUniqueValues = useCallback((path: string) => {
    const values = allSchedules.map((item: APISchedule) => { 
      const keys = path.split('.');
      let value: any = item;
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          value = undefined;
          break;
        }
      }
      if (path === 'offDays' || path === 'workingHours') return 'N/A (Per Shift)'; 
      if (Array.isArray(value)) return value.join(', ');
      return String(value ?? 'N/A');
    });
    return [...new Set(values)].sort();
  }, [allSchedules]);

  const uniqueUsernames = useMemo(() => getUniqueValues('user.username'), [getUniqueValues]);
  const uniqueWorkingHours = useMemo(() => getUniqueValues('shifts.0.startTime'), [getUniqueValues]); 
  const uniqueOffDays = useMemo(() => [], []); 
  const uniqueWeeks = useMemo(() => getUniqueValues('week'), [getUniqueValues]);

  const filteredSchedules = useMemo(() => {
    return allSchedules.filter((schedule: APISchedule) => {
      const username = typeof schedule.user === 'object' ? schedule.user?.username?.toLowerCase() || 'n/a' : schedule.user?.toLowerCase() || 'n/a';
      const shiftsInfo = schedule.shifts?.map((s: APIShift) => `${s.dayOfWeek} ${s.startTime}-${s.endTime}`).join('; ').toLowerCase() || 'n/a'; // Typed 's'
      const week = String(schedule.week)?.toLowerCase() || 'n/a';
      const searchQueryLower = searchQuery.toLowerCase();

      return (
        (searchQueryLower === '' ||
          username.includes(searchQueryLower) ||
          shiftsInfo.includes(searchQueryLower) || 
          week.includes(searchQueryLower)) &&
        (usernameFilter === '' || (typeof schedule.user === 'object' ? schedule.user?.username === usernameFilter : schedule.user === usernameFilter)) &&
        (weekFilter === '' || String(schedule.week) === weekFilter)
      );
    });
  }, [allSchedules, searchQuery, usernameFilter, weekFilter]); 

  const exportSchedulesToExcel = () => {
    const worksheetData = filteredSchedules.map(schedule => ({
      Username: typeof schedule.user === 'object' ? schedule.user?.username : schedule.user,
      Week: schedule.week || 'N/A',
      Shifts: schedule.shifts?.map((s: APIShift) => `${s.dayOfWeek}: ${s.startTime}-${s.endTime}`).join(' | ') || 'N/A', // Typed 's'
      Skill: schedule.skill || 'N/A',
      'Market Place': schedule.marketPlace || 'N/A',
      'Is Open For Swap': schedule.isOpenForSwap ? 'Yes' : 'No',
      'Created At': schedule.createdAt ? new Date(schedule.createdAt).toLocaleString() : 'N/A',
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'AllSchedules');
    XLSX.writeFile(workbook, 'AllSchedules.xlsx');
  };

  if (isLoading) {
    return <LoadingMessage message="Loading all schedules..." />;
  }

  if (error) {
    return <ErrorMessage message={`Error fetching schedules: ${error}`} />;
  }

  return (
    <div className="main all-schedules-container">
      <h2 className="form-title">All Employee Schedules</h2>
      <div className="controls-bar" style={{display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap'}}>
        <input
          type="text"
          placeholder="Search (Username, Week, Shift Times)..."
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          className="search-input"
          style={{padding: '8px', minWidth: '250px'}}
        />
        <SelectFilter label="Username:" value={usernameFilter} onChange={(e) => setUsernameFilter(e.target.value)} options={uniqueUsernames} />
        <SelectFilter label="Week:" value={weekFilter} onChange={(e) => setWeekFilter(e.target.value)} options={uniqueWeeks} />
        <button className="btn btn-primary" onClick={exportSchedulesToExcel} style={{marginLeft: 'auto'}}>Download as Excel</button>
      </div>
      
      <table className="schedules-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Week</th>
            <th>Shifts</th> 
            <th>Skill</th>
            <th>Market Place</th>
            <th>Open for Swap?</th>
          </tr>
        </thead>
        <tbody>
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map((schedule: APISchedule) => ( 
              <tr key={schedule._id}>
                <td>{typeof schedule.user === 'object' ? schedule.user?.username : schedule.user || 'N/A'}</td>
                <td>{schedule.week || 'N/A'}</td>
                <td>
                  {schedule.shifts?.map((s: APIShift) => ( // Typed 's'
                    <div key={s._id}>{`${s.dayOfWeek}: ${s.startTime}-${s.endTime} (${s.isSwappable ? 'Swappable' : 'Not Swappable'})`}</div>
                  )) || 'N/A'}
                </td>
                <td>{schedule.skill || 'N/A'}</td>
                <td>{schedule.marketPlace || 'N/A'}</td>
                <td>{schedule.isOpenForSwap ? 'Yes' : 'No'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{textAlign: 'center'}}>No schedules found matching your criteria.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AllSchedules;