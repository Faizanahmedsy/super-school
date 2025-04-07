import UILoader from '@/components/custom/loaders/UILoader';
import UIText from '@/components/global/Text/UIText';
import { Card, CardContent } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JANGO_PDF_ENDPOINT } from '@/services/endpoints';
import { Tabs } from 'antd';
import { useEffect, useState } from 'react';

export default function MemoAndAnswerSheetTabContent({
  answersheet,
  memo,
  questionpaper,
}: {
  answersheet: any;
  memo: any;
  questionpaper: any;
}) {
  const fileUrl = JANGO_PDF_ENDPOINT;
  const [questionSheetUrl, setQuestionSheetUrl] = useState<string | null>(null);
  const [memoUrl, setMemoSheetUrl] = useState<string | null>(null);
  const [questionPaperUrl, setQuestiopPaperUrl] = useState<string | null>(null);

  // Fetch the PDF URL dynamically for both tabs on component mount
  useEffect(() => {
    if (answersheet) {
      // Fetch Question Sheet PDF
      fetch(`${answersheet}`, {
        method: 'GET',
        headers: {
          language_code: 'en',
          'Content-Type': 'application/pdf',
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to load Question Sheet PDF');
          }
          return response.blob();
        })
        .then((blob) => {
          const objectURL = URL.createObjectURL(blob);
          setQuestionSheetUrl(objectURL);
        })
        .catch((error) => {
          console.error('Error fetching Question Sheet PDF:', error);
        });

      // Fetch Memo Sheet PDF
      fetch(`${fileUrl}${memo}`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': '69420',
          language_code: 'en',
          'Content-Type': 'application/pdf',
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to load Memo Sheet PDF');
          }
          return response.blob();
        })
        .then((blob) => {
          const objectURL = URL.createObjectURL(blob);
          setMemoSheetUrl(objectURL);
        })
        .catch((error) => {
          console.error('Error fetching Memo Sheet PDF:', error);
        });

      fetch(`${fileUrl}${questionpaper}`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': '69420',
          language_code: 'en',
          'Content-Type': 'application/pdf',
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to load Question Paper');
          }
          return response.blob();
        })
        .then((blob) => {
          const objectURL = URL.createObjectURL(blob);
          setQuestiopPaperUrl(objectURL);
        })
        .catch((error) => {
          console.error('Error fetching Question Paper:', error);
        });
    }
  }, [answersheet, memo, questionpaper]);

  return (
    <Card className="h-full w-full rounded-t-none">
      <Tabs
        className="py-5 mx-5 answersheet-tabs"
        items={[
          {
            label: (
              <div className="flex items-center">
                <UIText>Answer Sheet</UIText>
              </div>
            ),
            key: '1',
            children: (
              <CardContent className="flex justify-center h-[80vh] w-full">
                {questionSheetUrl ? (
                  <object data={questionSheetUrl} type="application/pdf" width="100%" height="100%">
                    <p>
                      Unable to display PDF file.{' '}
                      <a href={questionSheetUrl} target="_blank" rel="noopener noreferrer">
                        Download
                      </a>{' '}
                      instead.
                    </p>
                  </object>
                ) : (
                  <p className="flex justify-center align-items-center">
                    <UILoader />
                  </p>
                )}
              </CardContent>
            ),
          },
          {
            label: (
              <div className="text-base flex justify-center items-center">
                <UIText>Question Paper</UIText>
              </div>
            ),
            key: '2',
            children: (
              <CardContent className="flex justify-center h-[70vh] w-full">
                {questionPaperUrl ? (
                  <object data={questionPaperUrl} type="application/pdf" width="100%" height="100%">
                    <p>
                      Unable to display PDF file.{' '}
                      <a href={questionPaperUrl} target="_blank" rel="noopener noreferrer">
                        Download
                      </a>{' '}
                      instead.
                    </p>
                  </object>
                ) : (
                  <p className="flex justify-center align-items-center">
                    <UILoader />
                  </p>
                )}
              </CardContent>
            ),
          },
          {
            label: (
              <div className="text-base flex justify-center items-center">
                <UIText>Memo</UIText>
              </div>
            ),
            key: '3',
            children: (
              <CardContent className="flex justify-center h-[70vh] w-full">
                {memoUrl ? (
                  <object data={memoUrl} type="application/pdf" width="100%" height="100%">
                    <p>
                      Unable to display PDF file.{' '}
                      <a href={memoUrl} target="_blank" rel="noopener noreferrer">
                        Download
                      </a>{' '}
                      instead.
                    </p>
                  </object>
                ) : (
                  <p className="flex justify-center align-items-center">
                    <UILoader />
                  </p>
                )}
              </CardContent>
            ),
          },
        ]}
      />
    </Card>
  );
}
