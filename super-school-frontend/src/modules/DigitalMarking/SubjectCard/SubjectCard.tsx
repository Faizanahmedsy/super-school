// import UIPrimaryButton from "@/components/custom/buttons/UIPrimaryButton";
// import PageTitle from "@/components/global/PageTitle";
// import {
//     Card,
//     CardFooter,
//     CardHeader,
//     CardTitle
// } from "@/components/ui/card";
// import { MdOutlineRemoveRedEye } from "react-icons/md";

// export default function SubjectCard() {
// const data = [
//     {
//         subject: "Mathematics",
//         bgColor: "bg-blue-200",
//     },
//     {
//         subject: "History",
//         bgColor: "bg-green-200",
//     },
//     {
//         subject: "Science",
//         bgColor: "bg-red-200",
//     },
//     {
//         subject: "Literature",
//         bgColor: "bg-purple-200",
//     },
//     {
//         subject: "Technology",
//         bgColor: "bg-purple-200",
//     },
//     {
//         subject: "Gujarati",
//         bgColor: "bg-amber-200",
//     },
//     {
//         subject: "Hindi",
//         bgColor: "bg-lime-200",
//     },
// ];

//     return (
//         <>
//             <PageTitle
//                 breadcrumbs={[
//                     { label: "Dashboard", href: "/dashboard" },
//                     { label: "Batch List", href: "/memo" },
//                     { label: "Grade List", href: "/memo/grade" },
//                     { label: "Subject List", href: "/memo/subject" },
//                 ]}
//             >
//                 Subject List
//             </PageTitle>
//             <div className="grid md:grid-cols-4 gap-4">
//                 {data.map((item) => (
//                     <Card key={item.subject} className={`${item.bgColor} text-gray-800 shadow-md rounded-md transition-transform transform hover:scale-95 group`}>
//                         <CardHeader>
//                             <CardTitle className="flex items-center gap-3">
//                                 <img src="/icons/book.svg" alt="book" />
//                                 {item.subject}
//                             </CardTitle>
//                         </CardHeader>

//                         {/* <CardContent>
//                             <p>Card Content</p>
//                         </CardContent> */}
//                         <CardFooter>
//                             <UIPrimaryButton
//                                 icon={<MdOutlineRemoveRedEye size={18} />}
//                                 onClick={() => { }}
//                             >
//                                 Details
//                             </UIPrimaryButton>
//                         </CardFooter>
//                     </Card>
//                 ))}
//             </div>
//         </>
//     );
// }

import UiCardV2 from '@/components/global/Card/UiCardV2';
import PageTitle from '@/components/global/PageTitle';
import { useNavigate } from 'react-router-dom';

export default function GradeCard() {
  const navigate = useNavigate();
  const data = [
    {
      subject: 'Mathematics',
      bgColor: 'bg-blue-200',
    },
    {
      subject: 'History',
      bgColor: 'bg-green-200',
    },
    {
      subject: 'Science',
      bgColor: 'bg-red-200',
    },
    {
      subject: 'Literature',
      bgColor: 'bg-purple-200',
    },
    {
      subject: 'Technology',
      bgColor: 'bg-purple-200',
    },
    {
      subject: 'Gujarati',
      bgColor: 'bg-amber-200',
    },
    {
      subject: 'Hindi',
      bgColor: 'bg-lime-200',
    },
  ];

  return (
    <>
      <PageTitle
        breadcrumbs={[
          { label: 'Year List', href: '/memo' },
          { label: 'Grade List', href: '/memo/gradelist' },
          { label: 'Subject List', href: '/memo/subject' },
        ]}
      >
        Subject List
      </PageTitle>
      <div className="grid md:grid-cols-4 gap-4">
        {data.map((item) => (
          <UiCardV2
            key={item.subject}
            componentName="subjectList"
            grade={item.subject}
            bgColor={item.bgColor}
            onClick={() => navigate({})}
          />
        ))}
      </div>
    </>
  );
}
