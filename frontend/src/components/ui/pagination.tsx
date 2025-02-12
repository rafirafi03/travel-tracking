import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function pagination() {
  return (
    <div className="flex items-center justify-center gap-1 mt-6 mb-4">
          <button className="p-2 border border-gray-200 rounded">
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center border border-blue-500 rounded text-blue-500 text-sm">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded text-gray-600 text-sm">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded text-gray-600 text-sm">
            3
          </button>
          <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded text-gray-600 text-sm">
            4
          </button>
          <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded text-gray-600 text-sm">
            5
          </button>
          <button className="p-2 border border-gray-200 rounded">
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </div>
  )
}
