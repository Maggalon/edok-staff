import { useContext, useEffect, useState } from 'react';
import { Company, CompanyUser } from '@/lib/types';
import { TWAContext } from '@/context/twa-context';

export function useCompanyAuth(companySlug: string) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [companyUser, setCompanyUser] = useState<CompanyUser | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        const context = useContext(TWAContext)
        const webapp = context?.webApp
        // @ts-ignore - Telegram WebApp is injected globally
        const initData = webapp.initData;
        
        const response = await fetch(`/api/companies/${companySlug}/verify`, {
          method: 'POST',
          headers: {
            'x-telegram-init-data': initData
          }
        });

        if (!response.ok) {
          throw new Error('Unauthorized');
        }

        const data = await response.json();
        setIsAuthorized(true);
        setCompanyUser(data.companyUser);
        setCompany(data.company);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (companySlug) {
      verifyAccess();
    }
  }, [companySlug]);

  return { isAuthorized, isLoading, error, company, companyUser };
}