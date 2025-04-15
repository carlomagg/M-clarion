import React from 'react';
import openEyeIcon from '../../../assets/icons/open-eye.svg';
import closedEyeIcon from '../../../assets/icons/closed-eye.svg';

function PasswordEyeIcon({ showPassword, toggleShowPassword, className = "" }) {
  const icon = showPassword ? openEyeIcon : closedEyeIcon;
  
  return (
    <button
      type="button"
      onClick={toggleShowPassword}
      className={`text-gray-500 hover:text-gray-700 ${className}`}
    >
      <img 
        src={icon} 
        alt={showPassword ? "Hide password" : "Show password"} 
      />
    </button>
  );
}

export default PasswordEyeIcon; 