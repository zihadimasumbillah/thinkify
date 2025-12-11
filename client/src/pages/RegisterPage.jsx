import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiMail, HiLockClosed, HiUser } from 'react-icons/hi';
import toast from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import useAuthStore from '../stores/authStore';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { register, checkUsername, checkEmail } = useAuthStore();
  const navigate = useNavigate();

  const validateForm = async () => {
    const newErrors = {};

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    } else {
      const isAvailable = await checkUsername(formData.username);
      if (!isAvailable) {
        newErrors.username = 'Username is already taken';
      }
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    } else {
      const isAvailable = await checkEmail(formData.email);
      if (!isAvailable) {
        newErrors.email = 'Email is already registered';
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const isValid = await validateForm();

    if (!isValid) {
      setIsLoading(false);
      return;
    }

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });

    setIsLoading(false);

    if (result.success) {
      toast.success('Welcome to Thinkify! 🎉');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-100 mb-2">Create Account</h1>
        <p className="text-gray-400">Join the conversation on Thinkify</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Username"
          type="text"
          name="username"
          placeholder="johndoe"
          icon={HiUser}
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
        />

        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="you@example.com"
          icon={HiMail}
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Create a strong password"
          icon={HiLockClosed}
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="Confirm your password"
          icon={HiLockClosed}
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <div className="text-sm text-gray-400">
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="link">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" className="link">Privacy Policy</Link>.
        </div>

        <Button 
          type="submit" 
          fullWidth 
          isLoading={isLoading}
        >
          Create Account
        </Button>
      </form>

      {/* Sign In Link */}
      <p className="mt-8 text-center text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="link font-medium">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
};

export default RegisterPage;
