import AppPageMeta from '@/app/components/AppPageMeta';
import AppsContainer from '@/app/components/AppsContainer';
import UIPrimaryButton from '@/components/custom/buttons/UIPrimaryButton';
import PageTitle from '@/components/global/PageTitle';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { capitalizeFirstLetter } from '@/lib/common-functions';
import { useInstituteDetails } from '@/services/management/institute/institute.hook';
import { Card } from 'antd';
import { IoMdArrowBack } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';

export default function InstituteDetails() {
  const params = useParams();
  const { data: getDataById } = useInstituteDetails(params?.id ? parseInt(params?.id) : 0);

  const navigate = useNavigate();

  return (
    <>
      <AppPageMeta title="School Details" />
      <PageTitle
        extraItem={
          <>
            <UIPrimaryButton icon={<IoMdArrowBack size={18} />} onClick={() => navigate(-1)}>
              Back
            </UIPrimaryButton>
          </>
        }
        breadcrumbs={[{ label: 'School List', href: '/school/list' }, { label: 'School Details' }]}
      >
        School Details
      </PageTitle>

      <AppsContainer title={''} fullView={true} type="bottom">
        <div className="teacher-details-container">
          <Card
            className="teacher-details-card cursor-default"
            styles={{ body: { padding: '24px' } }}
            title="School Profile"
          >
            <div className="grid grid-cols-2 gap-4">
              <Card className="cursor-default">
                <CardHeader>
                  <CardTitle>School Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1  gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      {(getDataById as any)?.school_name && (
                        <p className="text-md font-semibold text-gray-900">
                          {' '}
                          School Name:{' '}
                          <span className="text-black text-opacity-30">{(getDataById as any)?.school_name}</span>
                        </p>
                      )}
                      {(getDataById as any)?.school_type && (
                        <p className="text-md font-semibold text-gray-900">
                          {' '}
                          School type:{' '}
                          <span className="text-black text-opacity-30">
                            {capitalizeFirstLetter((getDataById as any)?.school_type)}
                          </span>
                        </p>
                      )}
                      {(getDataById as any)?.medium_of_instruction && (
                        <p className="text-md font-semibold text-gray-900">
                          Medium Of Instruction:{' '}
                          <span className="text-black text-opacity-30">
                            {capitalizeFirstLetter((getDataById as any)?.medium_of_instruction)}
                          </span>
                        </p>
                      )}
                      {(getDataById as any)?.EMIS_number && (
                        <p className="text-md font-semibold text-gray-900">
                          EMIS Number:{' '}
                          <span className="text-black text-opacity-30">{(getDataById as any)?.EMIS_number}</span>
                        </p>
                      )}
                      {(getDataById as any)?.address && (
                        <p className="text-md font-semibold text-gray-900">
                          Address: <span className="text-black text-opacity-30">{(getDataById as any)?.address}</span>
                        </p>
                      )}
                      {(getDataById as any)?.current_users && (
                        <p className="text-md font-semibold text-gray-900">
                          Current Users:{' '}
                          <span className="text-black text-opacity-30">{(getDataById as any)?.current_users}</span>
                        </p>
                      )}
                      {(getDataById as any)?.max_users && (
                        <p className="text-md font-semibold text-gray-900">
                          Maximum Users:{' '}
                          <span className="text-black text-opacity-30">{(getDataById as any)?.max_users}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-default">
                <CardHeader>
                  <CardTitle>Principal Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1  gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      {(getDataById as any)?.contact_person && (
                        <p className="text-md font-semibold text-gray-900">
                          Name:{' '}
                          <span className="text-black text-opacity-30">{(getDataById as any)?.contact_person}</span>
                        </p>
                      )}
                      {(getDataById as any)?.contact_email && (
                        <p className="text-md font-semibold text-gray-900">
                          Email:{' '}
                          <span className="text-black text-opacity-30">{(getDataById as any)?.contact_email}</span>
                        </p>
                      )}
                      {(getDataById as any)?.contact_number && (
                        <p className="text-md font-semibold text-gray-900">
                          Contact Number:{' '}
                          <span className="text-black text-opacity-30">{(getDataById as any)?.contact_number}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* <Col span={8}>
                <div className="detail-item">
                  <strong>School Name:</strong> {(getDataById as any)?.school_name}
                </div>
              </Col>
              <Col span={8}>
                <div className="detail-item">
                  <strong>School Type: </strong>
                  {(getDataById as any)?.school_type.charAt(0).toUpperCase() +
                    (getDataById as any)?.school_type.slice(1).toLowerCase()}
                </div>
              </Col>
              <Col span={8}>
                <div className="detail-item">
                  <strong>EMIS Number:</strong> {capitalizeFirstLetter((getDataById as any)?.EMIS_number)}
                </div>
              </Col>
              <Col span={8}>
                <div className="detail-item">
                  <strong>Location Type:</strong> {capitalizeFirstLetter((getDataById as any)?.location_type)}
                </div>
              </Col>
              <Col span={8}>
                <div className="detail-item">
                  <strong>Maximum Users:</strong> {(getDataById as any)?.max_users}
                </div>
              </Col>

              <Col span={8}>
                <div className="detail-item">
                  <strong>Medium Of Instruction:</strong> {(getDataById as any)?.medium_of_instruction}
                </div>
              </Col>
              <Col span={8}>
                <div className="detail-item">
                  <strong>Contact Person:</strong> {(getDataById as any)?.contact_person}
                </div>
              </Col>
              <Col span={8}>
                <div className="detail-item">
                  <strong>Contact Number:</strong> {(getDataById as any)?.contact_number}
                </div>
              </Col>
              <Col span={8}>
                <div className="detail-item">
                  <strong>Contact Email:</strong> {(getDataById as any)?.contact_email}
                </div>
              </Col>
              <Col span={8}>
                <div className="detail-item">
                  <strong>Address:</strong> {(getDataById as any)?.address}
                </div>
              </Col> */}
          </Card>
        </div>
      </AppsContainer>
    </>
  );
}
