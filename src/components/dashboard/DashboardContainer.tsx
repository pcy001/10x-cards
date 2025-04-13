import React, { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import useDueCount from "@/hooks/useDueCount";
import WelcomeSection from "./WelcomeSection";
import DueCountSection from "./DueCountSection";
import QuickActionsSection from "./QuickActionsSection";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";

export default function DashboardContainer() {
  const [userName, setUserName] = useState<string>("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dueCountData, setDueCountData] = useState<any>(undefined);

  // Bezpieczne wywołanie hooków w bloku try-catch
  useEffect(() => {
    try {
      const fetchData = async () => {
        try {
          setIsLoading(true);

          // Bezpieczne użycie hooków React Query wewnątrz efektu
          const userResponse = await fetch('/api/auth/me');
          const userData = await userResponse.json();
          
          if (userData?.email) {
            const emailName = userData.email.split('@')[0];
            setUserName(emailName);
          }
          
          const dueCountResponse = await fetch('/api/learning/due-count');
          const dueCountData = await dueCountResponse.json();
          setDueCountData(dueCountData);
          
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
          setIsError(true);
          setIsLoading(false);
        }
      };
      
      fetchData();
    } catch (error) {
      console.error("Error in dashboard effect:", error);
      setIsError(true);
      setIsLoading(false);
    }
  }, []);

  const handleRetry = () => {
    setIsLoading(true);
    setIsError(false);
    // Efekt useEffect wykona się ponownie
    window.location.reload();
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState onRetry={handleRetry} />;
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Sekcja powitalna - pełna szerokość na mobilnych, 8/12 na większych ekranach */}
        <div className="md:col-span-8">
          <WelcomeSection userName={userName || "Użytkowniku"} />
        </div>

        {/* Layout na md i większych ekranach */}
        <div className="md:col-span-4 md:row-span-2 h-fit">
          <DueCountSection dueCount={dueCountData} />
        </div>

        {/* Sekcja szybkich akcji */}
        <div className="md:col-span-8">
          <QuickActionsSection />
        </div>
      </div>
    </div>
  );
} 