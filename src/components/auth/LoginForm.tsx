import React from 'react';
import { useLoginForm } from '@/hooks/useLoginForm';
import EmailInput from './EmailInput';
import PasswordInput from './PasswordInput';
import FormError from './FormError';
import RegisterLink from './RegisterLink';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function LoginForm() {
  const {
    formState,
    updateEmail,
    updatePassword,
    togglePasswordVisibility,
    handleSubmit,
    dismissRegistrationSuccess
  } = useLoginForm();

  return (
    <div className="space-y-6">
      {/* Powiadomienie o pomyślnej rejestracji */}
      {formState.showRegistrationSuccess && (
        <div className="flex items-center gap-2 p-3 rounded bg-green-50 border border-green-200 text-green-800">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-sm">Rejestracja zakończona pomyślnie</p>
            <p className="text-xs">Możesz teraz zalogować się używając utworzonego konta</p>
          </div>
          <button 
            type="button" 
            onClick={dismissRegistrationSuccess}
            className="text-green-700 hover:text-green-900"
            aria-label="Zamknij powiadomienie"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      )}

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
              <span>Logowanie...</span>
            </>
          ) : (
            'Zaloguj się'
          )}
        </button>
      </form>

      <RegisterLink />
    </div>
  );
} 