import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { setItem } from '@/lib/localstorage';
import UIText from '@/components/global/Text/UIText';

export const CustomToolbar = (toolbar: any) => {
  setItem('calendar-view', toolbar.view);
  // Format the date range
  const getFormattedRange = () => {
    if (toolbar.view === 'agenda') {
      // Format for Timeline View (Agenda)
      const start = format(toolbar.date, 'dd/MM/yyyy');
      const endDate = new Date(toolbar.date);
      endDate.setDate(toolbar.date.getDate() + 29); // Add 29 days for agenda view
      const end = format(endDate, 'dd/MM/yyyy');
      return `${start} - ${end}`;
    }

    // Format for other views
    const start = format(toolbar.date, 'MMM d, yyyy');
    let end = start;
    let endDate = new Date(toolbar.date);

    if (toolbar.view === 'month') {
      endDate = new Date(toolbar.date.getFullYear(), toolbar.date.getMonth() + 1, 0);
    } else if (toolbar.view === 'week') {
      endDate.setDate(toolbar.date.getDate() + 6);
    }

    if (toolbar.view !== 'day') {
      end = format(endDate, 'MMM d, yyyy');
    }

    if (toolbar.view == 'day') {
      return `${start}`;
    }

    return `${start} - ${end}`;
  };

  return (
    <div className="flex items-center justify-between p-2 flex-wrap">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <button
          onClick={() => toolbar.onNavigate('TODAY')}
          className="px-4 py-1.5 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
        >
          <UIText>Today</UIText>
        </button>
        <button
          onClick={() => toolbar.onNavigate('PREV')}
          className="px-4 py-1.5 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => toolbar.onNavigate('NEXT')}
          className="px-4 py-1.5 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
        >
          <ChevronRight size={16} />
        </button>
        <span className="ml-4 text-lg font-medium text-gray-800">{getFormattedRange()}</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => toolbar.onView('day')}
          className={`px-4 py-1.5 rounded ${
            toolbar.view === 'day'
              ? 'bg-primary text-white'
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <UIText>Day</UIText>
        </button>
        <button
          onClick={() => toolbar.onView('week')}
          className={`px-4 py-1.5 rounded ${
            toolbar.view === 'week'
              ? 'bg-primary text-white'
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <UIText>Week</UIText>
        </button>
        <button
          onClick={() => toolbar.onView('month')}
          className={`px-4 py-1.5 rounded ${
            toolbar.view === 'month'
              ? 'bg-primary text-white'
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <UIText>Month</UIText>
        </button>
        <button
          onClick={() => toolbar.onView('agenda')}
          className={`px-4 py-1.5 rounded ${
            toolbar.view === 'agenda'
              ? 'bg-primary text-white'
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <UIText>Timeline View</UIText>
        </button>
      </div>
    </div>
  );
};
