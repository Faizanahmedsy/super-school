'use client';
import AppPageMeta from '@/app/components/AppPageMeta';
import AppsContainer from '@/app/components/AppsContainer';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import PageTitle from '@/components/global/PageTitle';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParentGetDataById } from '@/services/management/parent/parent.hook';
import { Avatar, Card } from 'antd';
import { Mail, MapPin, Phone, User, Users } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { ChildrenColumns } from './ChildrenDetailsColumn';
import UILoader from '@/components/custom/loaders/UILoader';
import { capitalizeFirstLetter } from '@/lib/common-functions';

export default function ParentDetails() {
  const params = useParams();
  const { data: getDataById, isLoading } = useParentGetDataById(params?.id ? parseInt(params?.id, 10) : 0);

  return (
    <>
      <AppPageMeta title="Parent Details" />
      <PageTitle breadcrumbs={[{ label: 'Parent List', href: '/parent/list' }, { label: 'Parent Details' }]}>
        Parent Details
      </PageTitle>

      <AppsContainer title={''} fullView={true} type="bottom">
        <div className="teacher-details-container">
          {isLoading ? (
            <div className="py-10">
              <UILoader />
            </div>
          ) : (
            <Card className="teacher-details-card" styles={{ body: { padding: '20px' } }} title="Parent Profile">
              <CardContent className="p-6">
                <div className="flex items-center gap-8">
                  {getDataById?.profile_image && !getDataById.profile_image.includes('null') ? (
                    <img src={getDataById.profile_image} alt="Profile Picture" className="w-24 h-24 rounded-full" />
                  ) : (
                    <Avatar size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }} />
                  )}

                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {getDataById?.first_name + ' ' + getDataById?.last_name}
                      </h1>
                    </div>
                    <div className="flex justify-self-auto gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-full">
                          <Mail className="h-5 w-5 text-blue-500" />
                        </div>
                        <span>{getDataById?.email}</span>
                      </div>
                      {getDataById?.mobile_number && (
                        <div className="flex items-center gap-3">
                          <div className="bg-green-50 p-2 rounded-full">
                            <Phone className="h-5 w-5 text-green-500" />
                          </div>
                          <span>{getDataById?.mobile_number}</span>
                        </div>
                      )}
                      {getDataById?.gender && (
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-50 p-2 rounded-full">
                            <User className="h-5 w-5 text-purple-500" />
                          </div>
                          <span>
                            {getDataById?.gender === null ? 'N/A' : capitalizeFirstLetter(getDataById?.gender)}
                          </span>
                        </div>
                      )}
                      {getDataById?.city?.district_name && (
                        <div className="flex items-center gap-2">
                          <div className="bg-red-50 p-2 rounded-full">
                            <MapPin className="h-5 w-5 text-red-500" />
                          </div>
                          <span>{getDataById?.city?.district_name + ',' + getDataById?.state?.province_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <Card>
                <CardHeader>
                  <CardTitle>School Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {getDataById?.institute?.school_name as string}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-50 p-2 rounded-full">
                          <Mail className="h-5 w-5 text-blue-500" />
                        </div>
                        <span className="flex items-center gap-2">
                          <strong>Email:</strong>
                          <span>{getDataById?.institute?.contact_email}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-green-50 p-2 rounded-full">
                          <Phone className="h-5 w-5 text-green-500" />
                        </div>
                        <span className="flex items-center gap-2">
                          <strong>Phone:</strong>
                          <span>
                            {getDataById?.institute?.contact_number ? getDataById?.institute?.contact_number : '-'}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-red-50 p-2 rounded-full">
                          <MapPin className="h-5 w-5 text-red-500" />
                        </div>
                        <span className="flex items-center gap-2">
                          <strong>Address:</strong>{' '}
                          <span>{getDataById?.institute?.address ? getDataById?.institute?.address : '-'}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-purple-50 p-2 rounded-full">
                          <Users className="h-5 w-5 text-purple-500" />
                        </div>
                        <span className="flex items-center gap-2">
                          <strong>Curent User:</strong>{' '}
                          <span>
                            {getDataById?.institute?.current_users ? getDataById?.institute?.current_users : '-'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {Array.isArray(getDataById?.students) && getDataById?.students.length > 0 && (
                <>
                  <div className="flex justify-between items-center py-5 pb-0">
                    <div className="text-base font-semibold text-slate-500">Children List</div>
                  </div>
                  <DynamicTable
                    data={getDataById.students}
                    columns={ChildrenColumns}
                    totalCount={getDataById.students.length}
                    loading={isLoading}
                    showPagination={false}
                  />
                </>
              )}
            </Card>
          )}
        </div>
      </AppsContainer>
    </>
  );
}
