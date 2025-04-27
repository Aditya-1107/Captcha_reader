import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertCircle, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/30 to-secondary/50 relative overflow-hidden">
      {/* Abstract background elements */}
      <div className="absolute top-40 left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-60 h-60 bg-secondary/20 rounded-full blur-3xl"></div>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 max-w-md w-full mx-4 border border-white/50 relative z-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary rounded-t-2xl"></div>
        
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-100 p-3 rounded-full mb-6">
            <AlertCircle className="h-12 w-12 text-primary" />
          </div>
          
          <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">404</h1>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Page Not Found</h2>
          
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button 
              className="flex items-center justify-center bg-primary hover:bg-primary/90 text-white w-full"
              onClick={() => window.location.href = '/'}
            >
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Button>
            
            <Button 
              variant="outline"
              className="flex items-center justify-center border-primary/30 hover:bg-primary/10 w-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-0 w-full text-center text-gray-500 text-sm">
        CAPTCHA Predictor — For educational purposes only
      </div>
    </div>
  );
};

export default NotFound;