'use client';
import AppPageMeta from '@/app/components/AppPageMeta';
import AppsContainer from '@/app/components/AppsContainer';
import UILoader from '@/components/custom/loaders/UILoader';
import PageTitle from '@/components/global/PageTitle';
import { CardContent } from '@/components/ui/card';
import { capitalizeFirstLetter } from '@/lib/common-functions';
import { useDoeGetDataById } from '@/services/doe/doe.hook';
import { Avatar, Card } from 'antd';
import { Mail, MapPin, Phone, User } from 'lucide-react';
import { FaBusinessTime } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

export default function DepartmentAdminDetailsPage() {
  const params: any = useParams();

  const { data: getDataById, isLoading } = useDoeGetDataById(params?.id);

  const detailData = getDataById?.department_user;

  return (
    <>
      <AppPageMeta title="Parent Details" />
      <PageTitle
        breadcrumbs={[
          { label: 'Department Admin List', href: '/department-admin/list' },
          { label: 'Department Admin Details' },
        ]}
      >
        Department Admin Details
      </PageTitle>

      <AppsContainer title={''} fullView={true} type="bottom">
        <div className="teacher-details-container">
          {isLoading ? (
            <div className="py-10">
              <UILoader />
            </div>
          ) : (
            <Card className="teacher-details-card py-6" title="Department Admin Profile">
              {isLoading ? (
                <div className="py-10">
                  <UILoader />
                </div>
              ) : (
                <CardContent className="p-6">
                  <div className="flex items-center gap-8">
                    {detailData?.profile_image && !detailData.profile_image.includes('null') ? (
                      <img src={detailData.profile_image} alt="Profile Picture" className="w-24 h-24 rounded-full" />
                    ) : (
                      <Avatar size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }} />
                    )}

                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-4">
                        <h1 className="text-3xl font-bold text-gray-900">
                          {detailData?.first_name + ' ' + detailData?.last_name}
                        </h1>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-50 p-2 rounded-full">
                            <FaBusinessTime className="h-5 w-5 text-blue-500" />
                          </div>
                          <span>
                            <strong>Job Title:</strong> {detailData?.job_title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-50 p-2 rounded-full">
                            <Mail className="h-5 w-5 text-blue-500" />
                          </div>
                          <span>
                            <strong>Email:</strong> {detailData?.email}
                          </span>
                        </div>
                        {detailData?.mobile_number && (
                          <div className="flex items-center gap-3">
                            <div className="bg-green-50 p-2 rounded-full">
                              <Phone className="h-5 w-5 text-green-500" />
                            </div>
                            <span>
                              <strong>Mobile:</strong> {detailData?.mobile_number}
                            </span>
                          </div>
                        )}
                        {detailData?.gender && (
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-50 p-2 rounded-full">
                              <User className="h-5 w-5 text-purple-500" />
                            </div>
                            <span>
                              <strong>Gender:</strong> {detailData?.gender === 'male' ? 'Male' : 'Female'}
                            </span>
                          </div>
                        )}
                        {detailData?.city?.district_name && (
                          <div className="flex items-center gap-2">
                            <div className="bg-red-50 p-2 rounded-full">
                              <MapPin className="h-5 w-5 text-red-500" />
                            </div>
                            <span>
                              <strong>Location:</strong>{' '}
                              {detailData?.city?.district_name + ', ' + detailData?.state?.province_name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )}
        </div>
      </AppsContainer>
    </>
  );
}
