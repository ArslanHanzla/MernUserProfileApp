import React, { useState } from 'react';

const ForgetPassForm = ({handleForgetPassEnter}) => { // setPage 
const [formData,setFormData] = useState({token:'',password:'' });

const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
};

const handleSubmit = (event) => {
    event.preventDefault();
    fetch('http://localhost:5000/api/forgetpasswordenter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: formData.token, password: formData.password})
    }).then(response=> {
      console.log(response);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
     // window.alert(response.json());
      return response.json();
    }).then(data => {
      //console.log(data);
      window.alert('Password reseted successfully now you can login with new password');
      handleForgetPassEnter();
    })
    .catch(error => {
      console.error('Error fetching user data:', error);
    }); 
  };
  // this form only takes email as input 
  return (
    <form onSubmit={handleSubmit} method='POST'> 
      <label htmlFor="token">Token</label>
      <input 
        placeholder='token given in email'
        type="text"
        id="token"
        name="token"
        value={formData.token}
        onChange={handleChange}/>
      <br/>
      <label htmlFor="password">New Password:</label>
      <input
        type="password"
        id="password"
        name="password"
        value={formData.password}
        onChange={handleChange}/>
      <br/>
      <button type="submit">Submit</button>
    </form>
  );
};

export default ForgetPassForm;