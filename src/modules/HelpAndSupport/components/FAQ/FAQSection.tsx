import { FaqSection } from '@/components/faq';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { generalFAQ, studentFAQ, teacherFAQ } from '@/modules/Settings/constants/faq.constants';
import useGlobalState from '@/store';

// const DEMO_FAQS = [
//   {
//     question: 'How much quiz can I generate using ai per subject?',
//     answer: 'You can generate 40 quizzes using AI for each subject.',
//   },
//   {
//     question: 'How does the pricing structure work?',
//     answer:
//       'We offer flexible, transparent pricing tiers designed to scale with your needs. Each tier includes a core set of features, with additional capabilities as you move up. All plans start with a 14-day free trial.',
//   },
//   {
//     question: 'What kind of support do you offer?',
//     answer:
//       'We provide comprehensive support through multiple channels. This includes 24/7 live chat, detailed documentation, video tutorials, and dedicated account managers for enterprise clients.',
//   },
//   {
//     question: 'What kind of support do you offer?',
//     answer:
//       'We provide comprehensive support through multiple channels. This includes 24/7 live chat, detailed documentation, video tutorials, and dedicated account managers for enterprise clients.',
//   },
//   {
//     question: 'What kind of support do you offer?',
//     answer:
//       'We provide comprehensive support through multiple channels. This includes 24/7 live chat, detailed documentation, video tutorials, and dedicated account managers for enterprise clients.',
//   },
//   {
//     question: 'What kind of support do you offer?',
//     answer:
//       'We provide comprehensive support through multiple channels. This includes 24/7 live chat, detailed documentation, video tutorials, and dedicated account managers for enterprise clients.',
//   },
//   {
//     question: 'What kind of support do you offer?',
//     answer:
//       'We provide comprehensive support through multiple channels. This includes 24/7 live chat, detailed documentation, video tutorials, and dedicated account managers for enterprise clients.',
//   },
//   {
//     question: 'What kind of support do you offer?',
//     answer:
//       'We provide comprehensive support through multiple channels. This includes 24/7 live chat, detailed documentation, video tutorials, and dedicated account managers for enterprise clients.',
//   },
//   {
//     question: 'What kind of support do you offer?',
//     answer:
//       'We provide comprehensive support through multiple channels. This includes 24/7 live chat, detailed documentation, video tutorials, and dedicated account managers for enterprise clients.',
//   },
//   {
//     question: 'What kind of support do you offer?',
//     answer:
//       'We provide comprehensive support through multiple channels. This includes 24/7 live chat, detailed documentation, video tutorials, and dedicated account managers for enterprise clients.',
//   },
//   {
//     question: 'What kind of support do you offer?',
//     answer:
//       'We provide comprehensive support through multiple channels. This includes 24/7 live chat, detailed documentation, video tutorials, and dedicated account managers for enterprise clients.',
//   },
//   {
//     question: 'What kind of support do you offer?',
//     answer:
//       'We provide comprehensive support through multiple channels. This includes 24/7 live chat, detailed documentation, video tutorials, and dedicated account managers for enterprise clients.',
//   },
//   {
//     question: 'What kind of support do you offer?',
//     answer:
//       'We provide comprehensive support through multiple channels. This includes 24/7 live chat, detailed documentation, video tutorials, and dedicated account managers for enterprise clients.',
//   },
//   {
//     question: 'What kind of support do you offer?',
//     answer:
//       'We provide comprehensive support through multiple channels. This includes 24/7 live chat, detailed documentation, video tutorials, and dedicated account managers for enterprise clients.',
//   },
//   {
//     question: 'What kind of support do you offer?',
//     answer:
//       'We provide comprehensive support through multiple channels. This includes 24/7 live chat, detailed documentation, video tutorials, and dedicated account managers for enterprise clients.',
//   },
//   {
//     question: 'What kind of support do you offer?',
//     answer:
//       'We provide comprehensive support through multiple channels. This includes 24/7 live chat, detailed documentation, video tutorials, and dedicated account managers for enterprise clients.',
//   },
//   {
//     question: 'What kind of support do you offer?',
//     answer:
//       'We provide comprehensive support through multiple channels. This includes 24/7 live chat, detailed documentation, video tutorials, and dedicated account managers for enterprise clients.',
//   },
// ];

export function FaqSectionDemo() {
  const user = useGlobalState((state) => state.user);
  const roleName = user?.role_name;

  let FAQ = [...generalFAQ];

  if (roleName === ROLE_NAME.STUDENT) {
    FAQ = [...FAQ, ...studentFAQ];
  } else if (roleName === ROLE_NAME.TEACHER) {
    FAQ = [...FAQ, ...teacherFAQ];
  } else if (roleName === ROLE_NAME.SUPER_ADMIN) {
    FAQ = [...FAQ, ...studentFAQ, ...teacherFAQ];
  }

  return (
    <>
      <div className="">
        <FaqSection
          title="Frequently Asked Questions"
          description="Everything you need to know about our platform"
          items={FAQ as any}
          contactInfo={{
            title: 'Still have questions?',
            description: "We're here to help you",
            buttonText: 'Contact Support',
            onContact: () => console.log('Contact support clicked'),
          }}
        />
      </div>
    </>
  );
}
