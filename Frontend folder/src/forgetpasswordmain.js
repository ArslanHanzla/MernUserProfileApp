import React, { useState } from 'react';

const ForgetPassForm = ({handleForgetPass}) => { // setPage 
const [formData,setFormData] = useState({email: '' });

const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
};

const handleSubmit = (event) => {
    event.preventDefault();
    fetch('http://localhost:5000/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formData.email})
    }).then(response=> {
      //console.log(response);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
     // window.alert(response.json());
      return response.json();
    }).then(data => {
      //console.log(data);
      window.alert('Email Sent check you email for further details');
      handleForgetPass.setPage('forgetpassenter');
    })
    .catch(error => {
      console.error('Error fetching user data:', error);
    }); 
  };
  // this form only takes email as input 
  return (
    <form onSubmit={handleSubmit}> 
      <label htmlFor="email">Email:</label>
      <input
        type="email"
        id="email"
        name="email"
        value={formData.email}
        onChange={handleChange}/>
      <br />
      <button type="submit">Submit</button>
    </form>
  );
};

export default ForgetPassForm;