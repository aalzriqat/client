import React, { useState, useMemo, useCallback, useEffect, ChangeEvent } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  fetchAllEmployeePreferencesThunk,
  selectAllEmployeePreferences,
  selectAllPreferencesLoading,
  selectAllPreferencesError,
  clearPreferenceError,
} from '../../store/slices/preferenceSlice';
import LoadingMessage from '../common/LoadingMessage';
import ErrorMessage from '../common/ErrorMessage';
import SelectFilter from '../common/SelectFilter';
import * as XLSX from 'xlsx';
import { EmployeePreferenceRecord } from '../../apiServiceTypes';

const AllPreferences: React.FC = () => {
    const dispatch = useAppDispatch();
    const allPreferences = useAppSelector(selectAllEmployeePreferences);
    const isLoading = useAppSelector(selectAllPreferencesLoading);
    const error = useAppSelector(selectAllPreferencesError);

    const [searchQuery, setSearchQuery] = useState('');
    const [usernameFilter, setUsernameFilter] = useState('');
    const [preferredShiftFilter, setPreferredShiftFilter] = useState('');
    const [preferredOffDaysFilter, setPreferredOffDaysFilter] = useState('');
    const [weekFilter, setWeekFilter] = useState('');

    useEffect(() => {
        dispatch(fetchAllEmployeePreferencesThunk());
        return () => {
            dispatch(clearPreferenceError());
        }
    }, [dispatch]);

    const getUniqueValues = useCallback((path: string) => {
        const values = allPreferences.map((item) => {
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
            return String(value ?? 'N/A');
        });
        return [...new Set(values)].sort();
    }, [allPreferences]);
    
    const uniqueUsernames = useMemo(() => getUniqueValues('user.username'), [getUniqueValues]); // Changed employee to user
    const uniquePreferredShifts = useMemo(() => getUniqueValues('preferredShift'), [getUniqueValues]);
    const uniquePreferredOffDays = useMemo(() => getUniqueValues('preferredDaysOff'), [getUniqueValues]);
    const uniqueWeeks = useMemo(() => getUniqueValues('week'), [getUniqueValues]);

    const filteredPreferences = useMemo(() => {
        return allPreferences.filter((preference: EmployeePreferenceRecord) => {
            const username = typeof preference.user === 'object' ? preference.user?.username?.toLowerCase() || 'n/a' : String(preference.user).toLowerCase(); // Changed employee to user
            const preferredShift = preference.preferredShift?.toLowerCase() || 'n/a';
            const preferredOffDays = preference.preferredDaysOff?.toLowerCase() || 'n/a';
            const week = String(preference.week)?.toLowerCase() || 'n/a';
            const searchQueryLower = searchQuery.toLowerCase();

            return (
                (searchQueryLower === '' ||
                    username.includes(searchQueryLower) ||
                    preferredShift.includes(searchQueryLower) ||
                    preferredOffDays.includes(searchQueryLower) ||
                    week.includes(searchQueryLower)) &&
                (usernameFilter === '' || (typeof preference.user === 'object' && preference.user?.username === usernameFilter) || String(preference.user) === usernameFilter) && // Changed employee to user
                (preferredShiftFilter === '' || preference.preferredShift === preferredShiftFilter) &&
                (preferredOffDaysFilter === '' || preference.preferredDaysOff === preferredOffDaysFilter) &&
                (weekFilter === '' || String(preference.week) === weekFilter)
            );
        });
    }, [allPreferences, searchQuery, usernameFilter, preferredShiftFilter, preferredOffDaysFilter, weekFilter]);

    const exportDataToExcel = () => {
        try {
            const formattedData = filteredPreferences.map(preference => ({
                Username: typeof preference.user === 'object' ? preference.user.username : String(preference.user), // Changed employee to user
                'Preferred Shift': preference.preferredShift,
                'Preferred Days Off': preference.preferredDaysOff,
                Week: preference.week,
                Unavailability: preference.unavailability,
                Notes: preference.notes,
                'Last Updated': preference.lastUpdatedAt ? new Date(preference.lastUpdatedAt).toLocaleString() : 'N/A',
            }));
            const ws = XLSX.utils.json_to_sheet(formattedData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "AllPreferences");
            XLSX.writeFile(wb, `AllEmployeePreferences.xlsx`);
        } catch (err) {
            console.error('Error exporting to Excel:', err);
            alert('An error occurred while exporting to Excel. Please try again.');
        }
    };

    if (isLoading) return <LoadingMessage message="Loading all preferences..." />;
    if (error) return <ErrorMessage message={`Error fetching preferences: ${error}`} />;
    
    return (
        <div className='main all-preferences-container'>
            <h2 className='form-title'>All Employee Preferences</h2>
            <div className="controls-bar" style={{display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap'}}>
                <input 
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="search-input"
                    style={{padding: '8px', minWidth: '250px'}}
                />
                <SelectFilter label="Username:" value={usernameFilter} onChange={(e) => setUsernameFilter(e.target.value)} options={uniqueUsernames} />
                <SelectFilter label="Preferred Shift:" value={preferredShiftFilter} onChange={(e) => setPreferredShiftFilter(e.target.value)} options={uniquePreferredShifts} />
                <SelectFilter label="Preferred Off Days:" value={preferredOffDaysFilter} onChange={(e) => setPreferredOffDaysFilter(e.target.value)} options={uniquePreferredOffDays} />
                <SelectFilter label="Week:" value={weekFilter} onChange={(e) => setWeekFilter(e.target.value)} options={uniqueWeeks} />
                <button className='btn btn-primary' onClick={exportDataToExcel} style={{marginLeft: 'auto'}}>Download as Excel</button>
            </div>
            
            {filteredPreferences.length === 0 && !isLoading && <p>No preferences found matching your criteria.</p>}
            {filteredPreferences.length > 0 && (
                <table className="preferences-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Preferred Shift</th>
                            <th>Preferred Days Off</th>
                            <th>Week</th>
                            <th>Unavailability</th>
                            <th>Notes</th>
                            <th>Last Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPreferences.map((preference: EmployeePreferenceRecord) => (
                            <tr key={preference._id}>
                                <td>{typeof preference.user === 'object' ? preference.user.username : String(preference.user)}</td> {/* Changed employee to user */}
                                <td>{preference.preferredShift || 'N/A'}</td>
                                <td>{preference.preferredDaysOff || 'N/A'}</td>
                                <td>{preference.week || 'N/A'}</td>
                                <td>{preference.unavailability || 'N/A'}</td>
                                <td>{preference.notes || 'N/A'}</td>
                                <td>{preference.lastUpdatedAt ? new Date(preference.lastUpdatedAt).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AllPreferences;