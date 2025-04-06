import UIText from '@/components/global/Text/UIText';

export const OLD_QuizLimitIndicator = ({
  totalQuizzes = 25,
  remainingQuizzes = 2,
}: {
  totalQuizzes?: number;
  remainingQuizzes?: number;
}) => {
  // const totalQuizzes: number = 25;
  // const remainingQuizzes: number = 2;
  const usedQuizzes = totalQuizzes - remainingQuizzes;
  const progressPercentage = (usedQuizzes / totalQuizzes) * 100;

  return (
    <div className=" w-full py-6 bg-white ">
      <div className="space-y-4">
        {/* Header */}
        {/* <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-gray-900">Quiz Generation Limit</h3>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Term Status</span>
          </div>
        </div> */}

        {/* Progress bar */}
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div className="text-xs font-semibold text-gray-600">{remainingQuizzes} remaining</div>
            <div className="text-right">
              <span className="text-xs font-semibold text-gray-600">
                {usedQuizzes}/{totalQuizzes} used
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 bg-gray-200 rounded">
            <div
              className="h-full bg-primary rounded transition-all duration-300 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-center">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-secondary text-primary">
              {remainingQuizzes === 0
                ? 'Limit reached for this term'
                : `${remainingQuizzes} quiz${remainingQuizzes === 1 ? '' : 'zes'} available`}
            </span>
          </div>

          {/* Term info */}
          <p className="text-sm text-gray-500 text-center">Limit resets each academic term</p>
        </div>
      </div>
    </div>
  );
};

export const QuizLimitIndicator = ({
  totalQuizzes = 25,
  remainingQuizzes = 2,
}: {
  totalQuizzes?: number;
  remainingQuizzes?: number;
}) => {
  // const totalQuizzes: number = 25;
  // const remainingQuizzes: number = 2;
  const usedQuizzes = totalQuizzes - remainingQuizzes;
  const progressPercentage = (usedQuizzes / totalQuizzes) * 100;

  return (
    <div className=" w-full bg-secondary text-gray-600 flex justify-center rounded-2xl mb-4">
      <div className="text-primary text-center">
        <p className="leading-7 [&:not(:first-child)]:mt-6 mt-3">
          <UIText>A maximum of 40 quizzes can be created per subject</UIText>
        </p>
      </div>
    </div>
  );
};
