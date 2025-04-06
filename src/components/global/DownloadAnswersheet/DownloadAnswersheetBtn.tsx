import BtnLoader from '@/components/custom/buttons/btn-loader';
import { Button } from '@/components/ui/button';
import { getItem } from '@/lib/localstorage';
import { JANGO_API_ENDPOINT } from '@/services/endpoints';
import { Tooltip } from 'antd';
import { DownloadIcon } from 'lucide-react';
import { useState } from 'react';
import { FaFilePdf } from 'react-icons/fa';

export default function DownloadAnswersheetBtn({
  apiEndPoint,
  answersheetId,
  studentName,
  showType,
  pdfName,
}: {
  apiEndPoint: string;
  answersheetId: string;
  studentName: string;
  showType?: string;
  pdfName?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  function downloadFile() {
    setIsLoading(true);

    fetch(`${JANGO_API_ENDPOINT}${apiEndPoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getItem('access_token')}`,
      },
      body: JSON.stringify({ answersheet_id: answersheetId }), // Sending the payload
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        // Extract the filename from the Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `${studentName}_answersheet.pdf`; // Default filename
        if (contentDisposition && contentDisposition.includes('filename=')) {
          const matches = contentDisposition.match(/filename="?([^"]+)"?/);
          if (matches?.[1]) {
            filename = matches[1];
          }
        }

        return response.blob().then((blob) => ({ blob, filename })); // Return blob and filename
      })
      .then(({ blob, filename }) => {
        // Create a link element
        const link = document.createElement('a');
        // Create a URL for the Blob and set it as the href
        const url = window.URL.createObjectURL(blob);

        link.href = url;
        link.download = filename; // Use the dynamic filename
        // Append the link to the document and trigger a click to start the download
        document.body.appendChild(link);
        link.click();
        // Clean up the URL object
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error('There was an error with the download:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <>
      {/* <Button onClick={downloadFile} disabled={isLoading}>
        {isLoading ? <BtnLoader /> : <DownloadIcon size={20} className="text-white mx-2" />} Download
      </Button> */}
      {showType == 'table' ? (
        // <DownloadIcon size={20} className="text-primary mx-2" />
        <>
          {isLoading ? (
            <BtnLoader />
          ) : (
            <Tooltip title={`${pdfName}`}>
              <FaFilePdf size={24} onClick={downloadFile} />
            </Tooltip>
          )}
        </>
      ) : (
        <Button onClick={downloadFile} disabled={isLoading}>
          {isLoading ? <BtnLoader /> : <DownloadIcon size={20} className="text-white mx-2" />} Download
        </Button>
      )}
    </>
  );
}
