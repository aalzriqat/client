import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createPreference,
  updatePreference,
} from "../../redux/modules/preferences";

const PreferenceForm = ({ preference = {}, isEdit = false }) => {
  const [formData, setFormData] = useState(preference);
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.preferences);
  const user = useSelector((state) => state.users.user);

  useEffect(() => {
    if (user && user._id) {
      setFormData((prevFormData) => ({ ...prevFormData, user: user._id }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      dispatch(updatePreference(preference.id, formData));
    } else {
      dispatch(createPreference(formData));
    }
  };

  const getCurrentWeekNumber = () => {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), 0, 1);
    const days = Math.floor((currentDate - startDate) / (24 * 60 * 60 * 1000));
    return Math.ceil((currentDate.getDay() + 1 + days) / 7);
  };

  const generateWeekOptions = () => {
    const currentWeek = getCurrentWeekNumber();
    const weeks = [];
    for (let i = 1; i <= 10; i++) {
      weeks.push(currentWeek + i);
    }
    return weeks;
  };

  const weekOptions = generateWeekOptions();

  return (
    <div className="manage-leave-main register">
      <p align="center" className="form-title">
        Preference Form
      </p>
      <form className="form1" onSubmit={handleSubmit}>
        <select
          name="preferredShift"
          value={formData.preferredShift || ""}
          onChange={handleChange}
        >
          <option value="">Preferred Shift</option>
          <option value="06:00-15:00">06:00-15:00</option>
          <option value="07:00-16:00">07:00-16:00</option>
          <option value="08:00-17:00">08:00-17:00</option>
          <option value="09:00-18:00">09:00-18:00</option>
          <option value="11:00-20:00">11:00-20:00</option>
          <option value="13:00-22:00">13:00-22:00</option>
          <option value="14:00-23:00">14:00-23:00</option>
        </select>
        <select
          name="preferredOffDays"
          value={formData.preferredOffDays || ""}
          onChange={handleChange}
        >
          <option value="">Preferred Off Days</option>
          <option value="consecutive">Consecutive</option>
          <option value="split">Split</option>
        </select>
        <select
                className="input-text"
                name="OU"
                value={formData.OU}
                onChange={handleChange}
                required
              >
                <option value="">Select OU</option>
                <option value="AE">AE</option>
                <option value="SA">SA</option>
                <option value="EG">EG</option>
                <option value="specialty">Specialty</option>
              </select>
        <select
          name="week"
          value={formData.week || ""}
          onChange={handleChange}
        >
          <option value="" disabled>Select a week</option>
          {weekOptions.map((week) => (
            <option key={week} value={week}>
              Week {week}
            </option>
          ))}
        </select>
        <button
          align="center"
          className="btn btn-primary"
         
          type="submit"
          disabled={loading}
        >
          {isEdit ? "Update" : "Create"}
        </button>
        {error && <p>Error: {error}</p>}
      </form>
    </div>
  );
};

export default PreferenceForm;