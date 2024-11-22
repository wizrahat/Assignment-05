import { AlertCircle, Check, X } from "lucide-react";

export default function QuizSubmitModal({ handleSubmit, closeModal }) {
  return (
    <div className="flex fixed  justify-center items-center min-h-screen w-full px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div
        className="fixed inset-0 align-middle transition-opacity"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <span
        className="hidden sm:inline-block sm:align-middle sm:h-screen"
        aria-hidden="true"
      >
        &#8203;
      </span>

      <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-[#28194b]/20 rounded-full sm:mx-0 sm:h-10 sm:w-10">
              <AlertCircle className="w-6 h-6 text-[#28194b]" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Submit Quiz
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to submit your quiz? This action cannot
                  be undone.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center justify-center w-full px-4 py-2 text-base font-medium text-white bg-[#28194b] border border-transparent rounded-md shadow-sm hover:bg-[#28194b]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#28194b] sm:ml-3 sm:w-auto sm:text-sm transition-colors"
          >
            <Check className="w-4 h-4 mr-2" />
            Confirm
          </button>
          <button
            type="button"
            onClick={closeModal}
            className="inline-flex items-center justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#28194b] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
