import { House } from "lucide-react";
import { Link } from "react-router-dom";

export default function Error() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 text-center">
        <div className="relative w-full h-64">
          <h1 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl font-extrabold text-[#8B5CF6] tracking-widest font-sans">
            404
          </h1>
        </div>
        <div className="relative">
          <p className="text-3xl font-semibold text-gray-800 mb-2">
            Oops! Page not found
          </p>
          <p className="text-gray-600 text-lg mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={"/"}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 bg-[#8B5CF6] text-white hover:bg-[#7C3AED]  duration-300"
            >
              {/* <Home className="mr-2 h-4 w-4" /> */}
              Go Home
              <House />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
