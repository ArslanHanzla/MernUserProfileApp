import React, { useState } from 'react';

const ResetPasswordForm = ({ handleResetSuccess }) => {
  console.log(handleResetSuccess);
  const [formData, setFormData] = useState({
    email: '',
    oldPassword: '',
    newpassword: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async(event) => {
    event.preventDefault();
    
    try {
      const {email,oldPassword,newpassword} = formData;
      const response = await fetch('http://localhost:5000/api/resetpassword',{
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({email,oldPassword,newpassword})
      });
       const data = await response.json();
       if (data.status === 400 || !data){
         window.alert("password didn't reset successfully");
         console.log("password didn't reset successfully");
       }else{
         window.alert("password reset successfully");
         console.log("password reset successfully");
         handleResetSuccess();
         //setPage('login');
       }
 
       //const response = await axios.post('/api/signup', formData);
       console.log(response);
       
     } catch (error) {
       console.error(error);
     }
  };

  return (
    <form onSubmit={handleSubmit} method="POST">
      <label htmlFor="email">Email:</label>
      <input
        type="email"
        id="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
      />
      <br />
      <label htmlFor="oldPassword">Previous Password:</label>
      <input
        type="password"
        id="oldPassword"
        name="oldPassword"
        value={formData.oldPassword}
        onChange={handleChange}
      />
      <br />
      <label htmlFor="newPassword">New Password:</label>
      <input
        type="password"
        id="newpassword"
        name="newassword"
        value={formData.newPassword}
        onChange={handleChange}
      />
      <br />
      <button type="submit">Reset Password</button>
    </form>
  );
};

export default ResetPasswordForm;
