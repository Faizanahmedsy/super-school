import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import * as React from 'react';
import { FcLibrary } from 'react-icons/fc';
import Book from '../../../../public/icons/book';

interface GradeCardItemProps {
  grade: string;
  bgColor: string;
  componentName: string;
  onClick: () => void;
}

const UiCardV2: React.FC<GradeCardItemProps> = ({ grade, bgColor, componentName, onClick }) => {
  return (
    <Card
      className={`${bgColor} text-gray-800 shadow-md rounded-md transition-transform transform hover:scale-95 group cursor-pointer`}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          {componentName == 'subjectList' ? <Book /> : <FcLibrary size={35} />}
          {grade}
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

export default UiCardV2;
