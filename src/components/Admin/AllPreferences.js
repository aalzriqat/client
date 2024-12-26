import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAllPreferences } from '../../redux/modules/preferences';
import * as XLSX from 'xlsx';
import usePersistedState from '../hooks/usePersistedState';

const AllPreferences = () => {
    const [preferences, setPreferences] = usePersistedState('preferences', []);
    const [searchQuery, setSearchQuery] = useState('');

    const dispatch = useDispatch();
    const loading = useSelector((state) => state.preferences.loading);
    const error = useSelector((state) => state.preferences.error);
    const preferencesFromStore = useSelector((state) => state.preferences.preferences);

    useEffect(() => {
        dispatch(getAllPreferences()).catch(err => {
            console.error('Error fetching preferences:', err); // Error handling
        });
    }, [dispatch]);

    useEffect(() => {
        if (preferencesFromStore.length > 0) {
            setPreferences(preferencesFromStore);
        }
    }, [preferencesFromStore, setPreferences]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredPreferences = useMemo(() => {
        try {
            return preferences.filter((preference) => {
                const { user, preferredShift, preferredOffDays, week } = preference;
                const username = user?.username || 'N/A';
                const preferredOffDaysStr = Array.isArray(preferredOffDays) ? preferredOffDays.join(', ') : preferredOffDays || 'N/A';
                const weekStr = week || 'N/A';

                return (
                    username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    preferredShift.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    preferredOffDaysStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    weekStr.toLowerCase().includes(searchQuery.toLowerCase())
                );
            });
        } catch (error) {
            console.error('Error filtering preferences:', error);
            return [];
        }
    }, [preferences, searchQuery]);

    const exportToExcel = useCallback(() => {
        try {
            const worksheet = XLSX.utils.json_to_sheet(filteredPreferences.map(preference => ({
                Username: preference.user.username,
                'Preferred Shift': preference.preferredShift,
                'Preferred Off Days': Array.isArray(preference.preferredOffDays) ? preference.preferredOffDays.join(', ') : preference.preferredOffDays || 'N/A',
                'Creation Date': new Date(preference.createdAt).toLocaleDateString(),
                Week: preference.week
            })));
            const workbook = XLSX.utils.book_new();
            const weeks = [...new Set(filteredPreferences.map(preference => preference.week))].join('-');
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Preferences');
            XLSX.writeFile(workbook, `Preferences-Weeks${weeks}.xlsx`);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert('An error occurred while exporting to Excel. Please try again.');
        }
    }, [filteredPreferences]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!preferences.length) return <p>No preferences found.</p>;


    return (
        <div className='main'>
            <h2 className='form-title'>Schedule Preferences</h2>
            <input
                type="text"
                placeholder="Search by username, preferred shift, off days, or week..."
                value={searchQuery}
                onChange={handleSearch}
                className="search-input"
                aria-label="Search preferences"
            />
            <button className='btn-primary' onClick={exportToExcel}>Download as Excel</button>
            <table>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Preferred Shift</th>
                        <th>Preferred Off Days</th>
                        <th>Creation Date</th>
                        <th>Week</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPreferences.map((preference) => (
                        <tr key={preference._id}>
                            <td>{preference.user.username}</td>
                            <td>{preference.preferredShift}</td>
                            <td>{Array.isArray(preference.preferredOffDays) ? preference.preferredOffDays.join(', ') : preference.preferredOffDays || 'N/A'}</td>
                            <td>{new Date(preference.createdAt).toLocaleDateString()}</td>
                            <td>{preference.week}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AllPreferences;