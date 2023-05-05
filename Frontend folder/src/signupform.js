import  React, { useState } from 'react';

const SignupForm = ({handleSignupSuccess}) => { //setPage
  console.log(handleSignupSuccess);    // Check if setPage is defined
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    password2: ''
  });

  const handleChange = (event) => {
    console.log("Handle change input",event);
    let { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
     const {firstname,lastname,email,password,password2} = formData;
     const response = await fetch('http://localhost:5000/api/register',{
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({firstname,lastname,email,password,password2})
     });
      const data = await response.json();
      if (data.status === 400 || !data){
        window.alert("registration failded");
        console.log("registration failded");
      }else{
        window.alert("registration successful");
        console.log("registration successful");
        handleSignupSuccess();
        //setPage('login');
      }

      //const response = await axios.post('/api/signup', formData);
      console.log(response);
      
    } catch (error) {
      console.error(error);
    }
  };
  //console.log(postdata);
   //
  return (

<form onSubmit={handleSubmit} method = "POST">
<label htmlFor="firstname">First Name:</label>
<input
  type="text"
  id="firstname"
  name="firstname"
  value={formData.firstName}
  onChange={handleChange}
/>
<br />
<label htmlFor="lastname">Last Name:</label>
<input
  type="text"
  id="lastname"
  name="lastname"
  value={formData.lastName}
  onChange={handleChange}
/>
<br />
<label htmlFor="email">Email:</label>
<input
  type="email"
  id="email"
  name="email"
  value={formData.email}
  onChange={handleChange}
/>
<br />
<label htmlFor="password">Password:</label>
<input
  type="password"
  id="password"
  name="password"
  placeholder='max. 8 characters'
  value={formData.password}
  onChange={handleChange}
/>
<br />
<label htmlFor="password2">Confirm Password:</label>
<input
  type="password2"
  id="password2"
  name="password2"
  placeholder='max. 8 characters'
  value={formData.confirmPassword}
  onChange={handleChange}
/>
<br />
<button type="submit">Submit</button>
</form>
  );
};
export default SignupForm;
