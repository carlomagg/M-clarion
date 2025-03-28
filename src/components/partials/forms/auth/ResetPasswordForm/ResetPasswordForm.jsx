import "./ResetPasswordForm.css";
import { useState } from "react";
import axios from "axios";
import { get } from "lockr";
import { PasswordField } from "../../../Elements/Elements";
import useDispatchMessage from "../../../../../hooks/useDispatchMessage";

function ResetPasswordForm({ setResetSuccessful, type, email = null }) {
  const [status, setStatus] = useState("typing");
  const [formError, setFormError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
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

  function handleChange(event) {
    validationErrors[event.target.name] = null;
    setForm((prevForm) => ({
      ...prevForm,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,256}$/;
    const validationErrors = {};

    if (type === "change-password" && !form.old_password) {
      validationErrors.old_password = "Please enter your current password";
    }

    if (!form.new_password)
      validationErrors.new_password = "Please enter your new password";

    if (!form.confirm_new_password)
      validationErrors.confirm_new_password = "Please confirm your new password";

    if (!validationErrors.new_password && !passwordRegex.test(form.new_password))
      validationErrors.new_password = "Password must meet all criteria specified below";

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
        endpoint = 'clarion_users/change_first_login_password/';
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
            <PasswordField
              label="New Password"
              name="new_password"
              placeholder="Enter new password"
              onChange={handleChange}
              value={form.new_password}
              error={validationErrors.new_password}
            />
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
            Password must be between 8-256 characters and use a combination of at least uppercase, lowercase, numbers and symbols
          </p>
        </div>
      </form>
    </div>
  );
}

export default ResetPasswordForm;
