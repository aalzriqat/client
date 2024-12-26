import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { reportIssues } from '../../redux/modules/reportIssues';

const ClientReportForm = () => {
  const [issue, setIssue] = useState('');
  const dispatch = useDispatch();
  const user = useSelector((state) => state.users.user); // Get the logged-in user from the Redux store

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(reportIssues({ user: user.id, issue })); // Use the logged-in user's username
    setIssue('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Issue:</label>
        <textarea
          placeholder='Describe the issue in as much detail as possible'
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          required
        />
      </div>
      <button type="submit">Submit Report</button>
    </form>
  );
};

export default ClientReportForm;