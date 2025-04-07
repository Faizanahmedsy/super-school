import { ChevronDown, School } from 'lucide-react';

const MasterSchoolSelector = ({ school, onOpenSchoolModal }: { school: string; onOpenSchoolModal: () => void }) => {
  // if (JSON.parse(school)?.name && school) console.log('MasterSchoolSelector', JSON.parse(school).name);
  return (
    <div className="flex justify-center items-center">
      <button
        onClick={onOpenSchoolModal}
        className="flex items-center space-x-2 px-4 py-2 rounded-full 
                   bg-gray-100 text-black 
                   hover:bg-gray-100 transition-all duration-300"
      >
        <School className="w-4 h-4 text-black" strokeWidth={2} />
        <span className="font-medium text-sm">
          {school ? school : 'Select School'}
          {/* {school && JSON.parse(school)?.name ? JSON.parse(school).name : 'Select School'} */}
        </span>
        <ChevronDown className="w-4 h-4 text-black" strokeWidth={2} />
      </button>
    </div>
  );
};

export default MasterSchoolSelector;
