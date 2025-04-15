import "./ResetPasswordForm.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { get } from "lockr";
import { PasswordField } from "../../../Elements/Elements";
import useDispatchMessage from "../../../../../hooks/useDispatchMessage";

function ResetPasswordForm({ setResetSuccessful, type, email = null }) {
  const [status, setStatus] = useState("typing");
  const [formError, setFormError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState("");
  const dispatchMessage = useDispatchMessage();

  let initForm;

  if (type === "forgot-password") {
    initForm = {
      email,
      new_password: "",
      confirm_new_password: "",
    };
  } else if (type === "first-login") {
    initForm = {
      new_password: "",
      confirm_new_password: "",
    };
  } else if (type === "change-password") {
    initForm = {
      old_password: "",
      new_password: "",
      confirm_new_password: "",
    };
  }

  const [form, setForm] = useState(initForm);

  // Generate a strong password automatically
  const generateStrongPassword = () => {
    const length = 12;
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    // Use the same special characters as the validation pattern in AddNewUser.jsx
    const symbols = "!@#$%^&*(),.?\":{}|<>";
    
    // Ensure at least one of each required character type
    let password = "";
    // Add one lowercase
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    // Add one uppercase
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    // Add one number
    password += numbers[Math.floor(Math.random() * numbers.length)];
    // Add one special character from the validation-approved list
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest with random characters from all possible characters (no spaces)
    const allChars = lowercase + uppercase + numbers + symbols;
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password to ensure the required characters aren't always in the same position
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const checkPasswordStrength = (password) => {
    if (!password) return '';
    
    let score = 0;
    // Check length
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Check for numbers
    if (/\d/.test(password)) score++;
    
    // Check for lowercase
    if (/[a-z]/.test(password)) score++;
    
    // Check for uppercase
    if (/[A-Z]/.test(password)) score++;
    
    // Check for special characters
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    
    // Return strength based on score
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  };

  // Auto-generate password when component mounts
  useEffect(() => {
    if (!form.new_password) {
      const generatedPassword = generateStrongPassword();
      setForm(prevForm => ({
        ...prevForm,
        new_password: generatedPassword
      }));
      setPasswordStrength(checkPasswordStrength(generatedPassword));
    }
  }, []);

  function handleChange(event) {
    validationErrors[event.target.name] = null;
    setForm((prevForm) => ({
      ...prevForm,
      [event.target.name]: event.target.value,
    }));
    if (event.target.name === 'new_password') {
      setPasswordStrength(checkPasswordStrength(event.target.value));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // Using the same validation logic as in AddNewUser.jsx for consistency
    const validationErrors = {};

    if (type === "change-password" && !form.old_password) {
      validationErrors.old_password = "Please enter your current password";
    }

    if (!form.new_password)
      validationErrors.new_password = "Please enter your new password";

    if (!form.confirm_new_password)
      validationErrors.confirm_new_password = "Please confirm your new password";

    if (!validationErrors.new_password) {
      const hasNumber = /\d/.test(form.new_password);
      const hasLower = /[a-z]/.test(form.new_password);
      const hasUpper = /[A-Z]/.test(form.new_password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(form.new_password);
      const hasNoSpaces = !/\s/.test(form.new_password);
      const isLongEnough = form.new_password.length >= 8;

      if (!(hasNumber && hasLower && hasUpper && hasSpecial && hasNoSpaces && isLongEnough)) {
        validationErrors.new_password = "Password must contain at least one number, one lowercase letter, one uppercase letter, one special character, no spaces, and be at least 8 characters";
      }
    }

    if (!validationErrors.confirm_new_password && form.new_password !== form.confirm_new_password)
      validationErrors.confirm_new_password = "Passwords do not match";

    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors(validationErrors);
      return;
    }

    setStatus("submitting");
    try {
      let data;
      let endpoint;

      if (type === "change-password") {
        // For logged in users changing their password
        data = {
          old_password: form.old_password,
          new_password: form.new_password,
          confirm_new_password: form.confirm_new_password
        };
        endpoint = 'clarion_users/update-preferences/';
      } else if (type === "forgot-password") {
        // For forgot password reset
        data = {
          email: email,
          new_password: form.new_password,
          confirm_new_password: form.confirm_new_password
        };
        endpoint = 'clarion_users/change_forgot_password/';
      } else if (type === "first-login") {
        // For first login password change
        data = {
          new_password: form.new_password,
          confirm_new_password: form.confirm_new_password
        };
        endpoint = 'clarion_users/users/change-password-first-login/';
      }
      
      console.log('Sending password change request with data:', data);
      const response = type === "change-password" 
        ? await axios.put(endpoint, data)
        : await axios.post(endpoint, data);
      
      if (response.status === 200) {
        dispatchMessage('success', 'Password changed successfully!');
        // Wait for 1 second before redirecting
        await new Promise(resolve => setTimeout(resolve, 1000));
        setResetSuccessful(true);
      }
    } catch (error) {
      console.error('Password change error:', error.response?.data || error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Unable to change password. Please try again.";
      dispatchMessage('failed', errorMessage);
      setFormError(errorMessage);
    } finally {
      setStatus("typing");
    }
  }

  return (
    <div className={type === "change-password" ? "fixed top-0 left-0 w-full h-full bg-[#050505]/25 flex items-center justify-center z-30" : ""}>
      <form
        onSubmit={handleSubmit}
        className={type === "change-password" ? "w-full max-w-xl bg-white rounded-lg overflow-hidden" : "shadow-xl md:shadow-none w-full p-8 bg-white rounded-xl ring-4 ring-button-pink/50"}
      >
        {type === "change-password" && (
          <div className="py-[10px] px-6 bg-black text-white text-lg font-semibold flex justify-between items-center">
            <span>Change Password</span>
            <button type="button" onClick={() => setResetSuccessful(false)} className="text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={26} height={26}>
                <line x1="8" y1="8" x2="16" y2="16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                <line x1="16" y1="8" x2="8" y2="16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}

        <div className={type === "change-password" ? "p-6" : ""}>
          {!type === "change-password" && <div className="text-3xl">Reset Password</div>}

          <div className="space-y-4">
            {formError && (
              <div className="text-red-500 font-medium">{formError}</div>
            )}
            {type === "change-password" && (
              <PasswordField
                label="Current Password"
                name="old_password"
                placeholder="Enter current password"
                onChange={handleChange}
                value={form.old_password}
                error={validationErrors.old_password}
              />
            )}
            <div className="space-y-2">
              <PasswordField
                label="New Password"
                name="new_password"
                placeholder="Enter new password"
                onChange={handleChange}
                value={form.new_password}
                error={validationErrors.new_password}
              />
              {form.new_password && (
                <>
                  <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden mt-2">
                    <div className={`h-full transition-all duration-300 ${
                      passwordStrength === 'weak' ? 'w-1/3 bg-red-500' :
                      passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' :
                      'w-full bg-green-500'
                    }`} />
                  </div>
                  <p className={`text-xs mt-1 ${
                    passwordStrength === 'weak' ? 'text-red-500' :
                    passwordStrength === 'medium' ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                    Password strength: {passwordStrength}
                  </p>
                </>
              )}
            </div>
            <PasswordField
              label="Confirm New Password"
              name="confirm_new_password"
              placeholder="Re-enter new password"
              onChange={handleChange}
              value={form.confirm_new_password}
              error={validationErrors.confirm_new_password}
            />
          </div>

          <button
            type="submit"
            disabled={status === "submitting"}
            className={`font-bold w-full p-4 rounded-lg mt-6 text-white ${
              status === "submitting" ? "bg-button-pink/70" : "bg-button-pink"
            }`}
          >
            {status === "submitting" ? "Please wait..." : type === "change-password" ? "Change Password" : "Reset Password"}
          </button>

          <p className="text-text-gray text-sm mt-6">
            Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, one special character, and no spaces
          </p>
        </div>
      </form>
    </div>
  );
}

export default ResetPasswordForm;
