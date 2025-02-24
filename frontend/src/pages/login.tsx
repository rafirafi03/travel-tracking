import React, { useState, ChangeEvent, FormEvent, useCallback } from "react";
import Card from "../components/ui/card";
import { useLoginMutation } from "../store/slices/apiSlices";
import {
  dismissToast,
  errorToast,
  loadingToast,
  successToast,
} from "../utils/toast";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface FormData {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  error?: string;
}

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [loginMutation] = useLoginMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      if(!formData.email) {
        errorToast('Email required!')
        return 
      } else if(!formData.password) {
        errorToast('Password required!')
        return 
      }
      
      const toastLoading = loadingToast("Signing in...");
      const response: LoginResponse = await loginMutation(formData).unwrap();
      dismissToast(toastLoading);

      if (response.success && response.token) {
        localStorage.setItem("userToken", response.token);
        successToast("Sign in successful");
        navigate("/");
      } else {
        errorToast(response?.error || "Login failed");
      }
    } catch (error) {
      toast.dismiss()
      console.log(error,"errrorororo")

      const err = error as { data?: { error?: string } };

      if (err?.data?.error) {
        errorToast(err.data.error);
      } else {
        errorToast("An error occurred during sign in");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-200 to-blue-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white">
        <div className="mb-8 flex justify-center">
          <div className="flex items-end gap-2">
            <img
              src="/icons/speedometer.svg"
              alt="Speedometer"
              className="w-9 h-9"
              width={36}
              height={36}
            />
            <span className="text-xl text-black font-bold font-squada">
              Speedo
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Example@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoComplete="email"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              minLength={8}
              required
              autoComplete="current-password"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </Card>
    </div>
  );
};

export default LoginForm;