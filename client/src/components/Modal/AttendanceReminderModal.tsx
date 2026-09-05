import { Link } from "react-router-dom";
import { CalendarClock, X } from "lucide-react";

interface AttendanceReminderModalProps {
  onDismiss: () => void;
}

const AttendanceReminderModal = ({ onDismiss }: AttendanceReminderModalProps) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-xl p-6 text-center">
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mx-auto w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
          <CalendarClock className="w-7 h-7 text-amber-600" />
        </div>

        <h2 className="mt-4 text-lg font-semibold text-gray-900">Start your day</h2>
        <p className="mt-1.5 text-sm text-gray-500">
          Please mark today's attendance to start your day.
        </p>

        <div className="mt-5 flex flex-col gap-2">
          <Link
            to="/attendance"
            onClick={onDismiss}
            className="w-full inline-flex items-center justify-center rounded-xl bg-blue-600 text-white text-sm font-semibold py-2.5 hover:bg-blue-700 transition-colors"
          >
            Mark attendance
          </Link>
          <button
            type="button"
            onClick={onDismiss}
            className="w-full text-sm font-medium text-gray-500 py-1.5 hover:text-gray-700 transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReminderModal;
