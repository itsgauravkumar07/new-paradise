import { ChevronLeft, ChevronRight } from "lucide-react";

const RecentlyBooked = () => {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Recently Booked</h2>
            <div className="flex space-x-2">
              <button className="w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center hover:bg-yellow-400 transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-700" />
              </button>
              <button className="w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center hover:bg-yellow-400 transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>
  
          {/* Empty state with illustration */}
          <div className="text-center py-12">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <div className="text-4xl">🧳</div>
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-gray-800">Sorry!</h3>
            <p className="text-gray-600 text-lg">No Package Found</p>
          </div>
        </div>
      </section>
    );
  };
  
  export default RecentlyBooked;