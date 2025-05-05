'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form submitted:', data);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              {...register('email')}
              className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
              placeholder="doctor@hospital.com"
            />
            {errors.email && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.email.message}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              {...register('password')}
              className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
              placeholder="••••••••"
            />
            {errors.password && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.password.message}</span>
              </label>
            )}
            <label className="label">
              <a href="#" className="label-text-alt link link-primary">Forgot password?</a>
            </label>
          </div>

          <div className="form-control mt-6">
            <button 
              type="submit" 
              className={`btn btn-primary w-full ${isSubmitting ? 'loading' : ''} active:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="divider">OR</div>

          <div className="text-center text-sm">
            <span className="text-base-content/60">Need an account? </span>
            <a href="#" className="link link-primary">Contact IT Support</a>
          </div>
        </form>
      </div>
    </div>
  );
}
