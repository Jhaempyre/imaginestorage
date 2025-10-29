import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { queryClient, useIsAuthenticated, authApi } from "@/api";

export function PrivateLayout() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useIsAuthenticated();

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      navigate("/auth/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated, render the protected content
  // return (
  //   <div className="min-h-screen bg-gray-50">
  //     {/* Header/Navigation */}
  //     <header className="bg-white shadow-sm border-b">
  //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  //         <div className="flex justify-between items-center h-16">
  //           <div className="flex items-center">
  //             <h1 className="text-xl font-semibold text-gray-900">
  //               Welcome, {user?.firstName} {user?.lastName}
  //             </h1>
  //           </div>
  //           <div className="flex items-center space-x-4">
  //             <span className="text-sm text-gray-500">{user?.email}</span>
  //             <button
  //               onClick={async () => {
  //                 try {
  //                   await authApi.logout();
  //                   // Clear all queries from cache
  //                   queryClient.clear();
  //                   // Navigate to login
  //                   navigate("/auth/login", { replace: true });
  //                 } catch (error) {
  //                   console.error("Logout error:", error);
  //                   // Even if logout fails, clear cache and redirect
  //                   queryClient.clear();
  //                   navigate("/auth/login", { replace: true });
  //                 }
  //               }}
  //               className="text-sm text-red-600 hover:text-red-800"
  //             >
  //               Logout
  //             </button>
  //           </div>
  //         </div>
  //       </div>
  //     </header>

  //     {/* Main Content */}
  //     <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
  //       <Outlet />
  //     </main>
  //   </div>
  // );

  return <Outlet />;
}
