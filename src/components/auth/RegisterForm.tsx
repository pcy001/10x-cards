import React from 'react';
import { useRegisterForm } from '@/hooks/useRegisterForm';
import EmailInput from './EmailInput';
import PasswordInput from './PasswordInput';
import FormError from './FormError';
import LoginLink from './LoginLink';
import { Spinner } from '@/components/ui/spinner';

export default function RegisterForm() {
  const {
    formState,
    updateEmail,
    updatePassword,
    togglePasswordVisibility,
    handleSubmit
  } = useRegisterForm();

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <EmailInput
          value={formState.email}
          onChange={updateEmail}
          error={formState.errors.email}
        />

        <PasswordInput
          value={formState.password}
          onChange={updatePassword}
          isVisible={formState.isPasswordVisible}
          onToggleVisibility={togglePasswordVisibility}
          error={formState.errors.password}
          label="Hasło"
        />

        {formState.errors.form && (
          <FormError message={formState.errors.form} />
        )}

        <button
          type="submit"
          disabled={formState.isSubmitting}
          className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-md font-medium transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {formState.isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              <span>Rejestracja...</span>
            </>
          ) : (
            'Zarejestruj się'
          )}
        </button>
      </form>

      <LoginLink />
    </div>
  );
} 