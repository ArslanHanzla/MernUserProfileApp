import React, { useState } from 'react';

const LoginForm = ({handleLoginSuccess}) => { // setPage 
  const [formData,setFormData] = useState({
    email: '', 
    password: ''
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formData.email, password: formData.password })
    }).then(response=> {
      //console.log(response);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
     // window.alert(response.json());
      return response.json();
     
    }).then(data => {
      console.log(data);
      //window.alert(data);
      const token = data.token;
      localStorage.setItem('token', token);
      handleLoginSuccess(data.name);
      // Redirect the user to the dashboard
      window.alert('login successful');
      //setName(data.name);
    })
    .catch(error => {
      console.error('Error fetching user data:', error);
    });
   
  };
  
 

  return (
    <form onSubmit={handleSubmit}>
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
        value={formData.password}
        onChange={handleChange}
      />
      <br />
      <button type="submit">Submit</button>
     <button type="button"> 
        Reset Password
      </button>
    </form>
  );
};
//  onClick={handleResetPassword} on line 76 in curly braces in reset button
export default LoginForm;


// from line 8 to 12
 //const [email, setEmail] = useState('');
  //const [password, setPassword] = useState('');
  //const [error, setError] = useState(null);
  //const [email, setEmail] = React.useState('');
  //const [password, setPassword] = React.useState('');

// line 41 to 60 
 //.then(response => response.json())
    //.then(data => {
      // Handle the response from the server
       /* const data = response.json();
        if (data.success) {  // data.success
        const token = data.token;
        localStorage.setItem('token', token);
        handleLoginSuccess(data.name);
        // Redirect the user to the dashboard
        window.alert('login successful');
        //window.location.href = '/dashboard';
      } else {
        // Display an error message to the user
        window.alert('Invalid email or password');
      }*/
    //})
   /* .catch(error => {
      console.error(error);
      console.log('Something went wrong');
    });*/

// from line 46 to 49
// const handleResetPassword = () => {
   // setPage('resetpass');
 // };
  
  //const [email, setEmail] = useState('');
  //const [password, setPassword] = useState('');