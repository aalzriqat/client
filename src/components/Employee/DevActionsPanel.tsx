import React, { useState } from 'react';
import { useAppDispatch } from '../../store/hooks'; // Assuming no specific Redux state needed for this panel itself
import {
    deleteAllSchedulesApi,
    deleteAllSwapsApi,
    deleteAllPreferencesApi,
    deleteAllLeaveRequestsApi,
    seedMockDataApi
} from '../../apiService'; // Assuming these are added to apiService.ts
// import styles from './DevActionsPanel.module.css'; // TODO: Create CSS module

const DevActionsPanel: React.FC = () => {
    // const dispatch = useAppDispatch(); // If needed for dispatching feedback/loading states
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
    const [results, setResults] = useState<Record<string, { message: string; error?: boolean }>>({});

    const handleAction = async (actionName: string, apiCall: () => Promise<any>) => {
        if (!window.confirm(`Are you sure you want to perform: ${actionName}? This can be destructive.`)) {
            return;
        }
        setIsLoading(prev => ({ ...prev, [actionName]: true }));
        setResults(prev => ({ ...prev, [actionName]: { message: 'Processing...' } }));
        try {
            const response = await apiCall();
            setResults(prev => ({ ...prev, [actionName]: { message: response.message || response.msg || `${actionName} successful.`, error: false } }));
            // Optionally, dispatch actions to refresh data in other parts of the app if needed
            // e.g., dispatch(fetchAllSchedulesForAdmin());
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.response?.data?.msg || error.message || `${actionName} failed.`;
            setResults(prev => ({ ...prev, [actionName]: { message: errorMessage, error: true } }));
            console.error(`Error during ${actionName}:`, error);
        } finally {
            setIsLoading(prev => ({ ...prev, [actionName]: false }));
        }
    };

    const actions = [
        { name: "Delete All Schedules", apiCall: deleteAllSchedulesApi },
        { name: "Delete All Swaps", apiCall: deleteAllSwapsApi },
        { name: "Delete All Preferences", apiCall: deleteAllPreferencesApi },
        { name: "Delete All Leave Requests", apiCall: deleteAllLeaveRequestsApi },
        { name: "Seed Mock Data", apiCall: seedMockDataApi },
    ];

    return (
        <div className="dev-actions-panel" style={{ padding: '20px', border: '1px solid #eee', margin: '20px' }}> {/* Replace with styles.container */}
            <h2>Developer Actions Panel</h2>
            <p style={{color: 'red', fontWeight: 'bold'}}>Warning: These actions directly modify the database. Use with caution.</p>
            
            {actions.map(action => (
                <div key={action.name} style={{ margin: '10px 0' }}>
                    <button
                        onClick={() => handleAction(action.name, action.apiCall)}
                        disabled={isLoading[action.name]}
                        style={{ padding: '10px 15px', marginRight: '10px', minWidth: '200px' }}
                    >
                        {isLoading[action.name] ? 'Processing...' : action.name}
                    </button>
                    {results[action.name] && (
                        <span style={{ color: results[action.name].error ? 'red' : 'green' }}>
                            {results[action.name].message}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
};

export default DevActionsPanel;