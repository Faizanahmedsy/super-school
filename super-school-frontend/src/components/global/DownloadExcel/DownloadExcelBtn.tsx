import BtnLoader from '@/components/custom/buttons/btn-loader';
import { Button } from '@/components/ui/button';
import { getItem } from '@/lib/localstorage';
import { JANGO_API_ENDPOINT } from '@/services/endpoints';
import { DownloadIcon } from 'lucide-react';
import { useState } from 'react';
import UIText from '../Text/UIText';

export default function DownloadExcelBtn({ apiEndPoint, fileName }: any) {
  const [isLoading, setIsLoading] = useState(false);

  function downloadFile() {
    fetch(`${JANGO_API_ENDPOINT}${apiEndPoint}`, {
      headers: {
        Authorization: `Bearer ${getItem('access_token')}`,
      },
    })
      .then((response) => {
        let filename = `${fileName}`;
        setIsLoading(true);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob().then((blob) => ({ blob, filename })); // Get the response as a Blob
      })
      .then(({ blob, filename }) => {
        // Create a link element
        const link = document.createElement('a');
        // Create a URL for the Blob and set it as the href
        const url = window.URL.createObjectURL(blob);

        link.href = url;
        link.download = filename;
        // Set the filename from the content-disposition header
        // link.download = 'school_report.xlsx';
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
    <Button onClick={downloadFile}>
      {isLoading ? <BtnLoader /> : <DownloadIcon size={20} className="text-white mx-2" />}
      <UIText>Download Excel</UIText>
    </Button>
  );
}
