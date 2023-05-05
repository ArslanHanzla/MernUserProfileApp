import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


const Dashboard = ({ firstname, handleLogout }) => {
  const [userName, setUserName] = useState('');
  const [dob, setDob] = useState('');
  const [education, setEducation] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/profile');
        const data = await response.json();
        console.log(data);
        setUserName(data.name);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUser();
  }, []);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleDobChange = (date) => {
    setDob(date);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!dob || !education || !selectedFile) {
      console.log('Please fill all fields');
      return;
    }

    const formData = new FormData();
    formData.append('dob', dob);
    formData.append('education', education);
    formData.append('file', selectedFile);

    fetch('http://localhost:5000/api/updateProfile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dob: formData.dob, education: formData.education,
      selectedFile: formData.selectedFile
      })
    }).then(response=> {
      //console.log(response);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
     // window.alert(response.json());
      return response.json();
     
    }).then(data => {
      window.alert("Profile Updated Successful");
    })

  /*  try {
      const response = await axios.post('http://localhost:5000/api/updateProfile', formData);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }*/
  };

  return (
    <div>
      <h1>Welcome to the Dashboard, {userName || firstname}!</h1>
      <button onClick={handleLogout}>Logout</button>

      <h2>Update Profile</h2>
      <h3>If you want to update your profile fill and submit this form</h3>
      <form onSubmit={handleSubmit}>
        <label>Date of Birth:</label>
        <DatePicker selected={dob} onChange={handleDobChange} />
        <br />
        <label>Education:</label>
        <input type="text" value={education} onChange={(e) => setEducation(e.target.value)} />
        <br />
        <label>Profile Picture:</label>
        <input type="file" onChange={handleFileChange} />
        <br />
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default Dashboard;
