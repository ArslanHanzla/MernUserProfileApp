import React, { useState } from 'react';
import SignupForm from './signupform';
import LoginForm from './loginpage';
import ResetPassForm from './resetpass';
import Dashboard from './dashboard';
import ForgetPassForm from './forgetpasswordmain';
import ForgetPassEnter from './forgetpassenter';

function App() {
  const [page, setPage] = useState('signup');
  const [firstname, setName] = useState('');
  
  const handleButtonClick = (page) => {
    setPage(page);
  };
  const handleSignupSuccess = () => {
    setPage('login');
  };
  const handleResetSuccess = () => {
    setPage('login');
  };
  const handleLoginSuccess = (firstname) => {
    setName(firstname);
    setPage('dashboard');
  };
  const handleForgetPass = ()=>{
    setPage('forgetpassenter');
  };
  const handleForgetPassEnter = ()=>{
    setPage('login');
  }

  const handleLogout = () => {
    //try to fetch the logout route here from index.js file 
    localStorage.removeItem('token');
    setName('');
    setPage('login');
  };

  const renderPage = () => {
    switch (page) {
      case 'signup':
        return <SignupForm handleSignupSuccess={handleSignupSuccess} />;
      case 'login':
        return <LoginForm handleLoginSuccess={handleLoginSuccess} />;
      case 'resetpass':
        return <ResetPassForm handleResetSuccess={handleResetSuccess}/>;
      case 'dashboard':
        return <Dashboard firstname={firstname} handleLogout={handleLogout} />;
      case 'forgetpass':
        return <ForgetPassForm handleForgetPass={handleForgetPass}/>;
      case 'forgetpassenter':
        return <ForgetPassEnter handleForgetPassEnter={handleForgetPassEnter}/>;
      default:
        return null;
    }
  };

  return (
    <div>
      <button onClick={() => handleButtonClick('signup')}>Signup</button> 
      <button onClick={() => handleButtonClick('login')}>Login</button>
      <button onClick={() => handleButtonClick('resetpass')}>
        Reset Password
      </button>
      <button onClick={() => handleButtonClick('forgetpass')}>
        Forget Password
      </button>
      <button onClick={() => handleButtonClick('forgetpassenter')}>
        Forget Password Reset
      </button>
      {renderPage()}
    

    </div>
  );  
}
export default App;

// code of line 29 to 34 
/*const ParentComponent = () => {
    const [page, setPage] = useState('signup');  
    return (
      <div></div>
    );
  };*/