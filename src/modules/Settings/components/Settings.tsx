import AppsContainer from '@/app/components/AppsContainer';
import UIFormSubmitButton from '@/components/custom/buttons/UIFormSubmitButton';
import { ColorPicker } from '@/components/custom/color-picker';
import UILoader from '@/components/custom/loaders/UILoader';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import PageTitle from '@/components/global/PageTitle';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { useListOption } from '@/hooks/use-select-option';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { useAuditLogList } from '@/services/auditlog/auditlog.hook';
import { VITE_SCHOOL_LOGO_URL } from '@/services/endpoints';
import {
  useCreateGeneralSetting,
  useDeleteLogo,
  useGetGeneralDetails,
} from '@/services/generalsetting/generalsetting.hook';
import { useInstituteList } from '@/services/management/institute/institute.hook';
import { QueryParams } from '@/services/types/params';
import { SettingsPayload } from '@/services/types/payload';
import useGlobalState from '@/store';
import { PlusOutlined } from '@ant-design/icons';
import { Image as AntdImage, Card, Form, Input, message, Tabs, Upload, UploadProps } from 'antd';
import { UploadFile } from 'antd/lib';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { auditLogColumns } from './auditlog.column';
import SupportLogs from './SupportLogs/SupportLogs';
import MasterSubjectlist from './mastersubject/mastersubjectlist';
import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import YearData from '@/modules/Master/year/list/YearData';
import UIText from '@/components/global/Text/UIText';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import { useUserroleList } from '@/services/userrole/userrole.actions';

const actionOPtions = [
  { label: 'CREATE', value: 'CREATE' },
  { label: 'UPDATE', value: 'UPDATE' },
  { label: 'DELETE', value: 'DELETE' },
];

export default function Settings() {
  const generalsetting = useGlobalState((state) => state.generalSettings);
  const location = useLocation();
  const [form] = Form.useForm();
  const setGenralSetting = useGlobalState((state) => state.setGeneralSettings);
  const [primaryColor, setPrimaryColor] = React.useState<string>('#000000');
  const [secondaryColor, setSecondaryColor] = React.useState<string>('#000000');
  const [selectedInstituteFilter, setInstituteSelectedFilter] = useState<string>();
  const [selectedRoleFilter, setRoleSelectedFilter] = useState<string>();
  const [selectedActionFilter, setActionSelectedFilter] = useState<string>();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  // const [previewImage, setPreviewImage] = useState('');

  const logoUrl = VITE_SCHOOL_LOGO_URL;

  const { data: GetDetailsGeneralSetings, isLoading: generalDetails, isError } = useGetGeneralDetails();

  const removeSchoolLogo = useDeleteLogo();

  const addGeneralsetting = useCreateGeneralSetting();

  const school_id = useRoleBasedSchoolId();

  const user = useGlobalState((state: any) => state.user);
  const isSuperAdmin = user.role_name == ROLE_NAME.SUPER_ADMIN;
  const isAdmin = user.role_name == ROLE_NAME.ADMIN;
  const instituteQuery = useInstituteList({
    sort: 'asc',
    school_id: selectedInstituteFilter ? selectedInstituteFilter : school_id,
  });

  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: 1,
    limit: 10,
  });

  const { data: auditLogList, isLoading } = useAuditLogList({
    ...pageQuery,
    sort: 'desc',
    school_id: selectedInstituteFilter ? selectedInstituteFilter : school_id,
    role_id: selectedRoleFilter ? selectedRoleFilter : undefined,
    action: selectedActionFilter ? selectedActionFilter : undefined,
  });

  useEffect(() => {
    const primaryColor = generalsetting?.primary_color
      ? generalsetting?.primary_color
      : user?.themePrimaryColor || '#92400e';
    const primaryLightColor = generalsetting?.secondory_color
      ? generalsetting?.secondory_color
      : user?.themeSecondaryColor || '#fff7ed';

    setPrimaryColor(primaryColor);
    setSecondaryColor(primaryLightColor);
  }, []);

  useEffect(() => {
    if (GetDetailsGeneralSetings) {
      form.setFieldsValue({
        support_email: GetDetailsGeneralSetings?.support_email,
      });
    }
    if (GetDetailsGeneralSetings?.logo != null) {
      const url = `${logoUrl}${GetDetailsGeneralSetings?.logo}`;
      setPreviewImage(url);
      setFileList([
        {
          uid: '-1',
          name: 'logo.png',
          status: 'done',
          url: url,
        },
      ]);
    } else {
      setPreviewImage('');
    }
  }, [GetDetailsGeneralSetings]);

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      limit: pageSize,
    }));
  };

  // Function to generate secondary color with 50% lighter shade
  const generateSecondaryColor = (primary: string): string => {
    const hex = primary?.replace('#', '');
    const r = parseInt(hex?.slice(0, 2), 16);
    const g = parseInt(hex?.slice(2, 4), 16);
    const b = parseInt(hex?.slice(4, 6), 16);

    // Lighten the color by 50%
    const lighten = (c: number) => Math.min(255, c + Math.floor((255 - c) * 0.9));

    const newR = lighten(r);
    const newG = lighten(g);
    const newB = lighten(b);

    return `#${newR.toString(16).padStart(2, '0')}${newG
      .toString(16)
      .padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };

  // Handle primary color change
  const handlePrimaryColorChange = (value: string) => {
    setPrimaryColor(value);
    const newSecondaryColor = generateSecondaryColor(value);
    setSecondaryColor(newSecondaryColor);
  };

  // Handle secondary color change
  const handleSecondaryColorChange = (value: string) => {
    setSecondaryColor(value);
  };

  const handleSubmit = async (values: SettingsPayload) => {
    const formData = new FormData();
    formData.append('theme_primary_color', primaryColor);
    formData.append('theme_secondary_color', secondaryColor);
    if (values?.support_email) {
      formData.append('support_email', values?.support_email);
    }
    for (const file of fileList) {
      if (file.originFileObj) {
        formData.append('logo', file.originFileObj); // Append the file directly (no Base64)
      }
    }
    addGeneralsetting.mutate(formData, {
      onSuccess: (data: any) => {
        setGenralSetting({
          primary_color: data?.data?.theme_primary_color.toString(),
          secondory_color: data?.data?.theme_secondary_color.toString(),
        });
        window.location.reload();

        // setItem('primaryColor', data?.data?.theme_primary_color.toString());
        // setItem('primaryLightColor', data?.data?.theme_secondary_color.toString());
        // window.location.reload();
      },
    });
  };

  const handleInstituteSelectChange = (value: string) => {
    setInstituteSelectedFilter(value);
    setPageQuery({
      ...pageQuery,
      page: 1,
    });
  };

  const handleRoleSelectChange = (value: string) => {
    setRoleSelectedFilter(value);
    setPageQuery({
      ...pageQuery,
      page: 1,
    });
  };

  const handleActionSelectChange = (value: string) => {
    setActionSelectedFilter(value);
    setPageQuery({
      ...pageQuery,
      page: 1,
    });
  };

  // Pass the list to useListOption
  const { options: instituteOptions } = useListOption({
    listData: instituteQuery?.data?.list || [],
    labelKey: 'school_name',
    valueKey: 'id',
  });

  const { data } = useUserroleList({});

  const { options: roleOptions } = useListOption({
    listData: data?.list || [],
    labelKey: 'role_name_show',
    valueKey: 'id',
  });

  const filters = [
    ...(user.role_name === ROLE_NAME.SUPER_ADMIN
      ? [
          {
            key: 'id',
            placeholder: 'Filter by School',
            options: instituteOptions,
            onSelectChange: handleInstituteSelectChange,
            value: selectedInstituteFilter ? selectedInstituteFilter : school_id,
            defaultValue: selectedInstituteFilter ? selectedInstituteFilter : school_id,
          },
        ]
      : []),
    {
      key: 'role',
      placeholder: 'Filter by Role',
      options: roleOptions,
      onSelectChange: handleRoleSelectChange,
      value: selectedRoleFilter,
      defaultValue: selectedRoleFilter,
    },
    {
      key: 'action',
      placeholder: 'Filter by Action',
      options: actionOPtions,
      onSelectChange: handleActionSelectChange,
      value: selectedActionFilter,
      defaultValue: selectedActionFilter,
    },
  ];

  // if (user.role_name != ROLE_NAME.SUPER_ADMIN) {
  //   filters.pop();
  // }

  const validateImageDimensions = (file: any) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        // if (img.width === 300 && img.height === 150) {
        URL.revokeObjectURL(objectUrl); // Cleanup object URL
        resolve(true);
        // } else {
        //   URL.revokeObjectURL(objectUrl); // Cleanup object URL
        //   displayError('Image dimensions must be 350 Width x 150 Height pixels.');
        //   reject(new Error('Invalid dimensions'));
        // }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        displayError('Invalid image file.');
        reject(new Error('Invalid image file.'));
      };

      img.src = objectUrl;
    });
  };

  const handleChange = async (info: any) => {
    const newFileList = info.fileList.slice(-1); // Keep only the latest file

    if (info.file.status === 'removed') {
      setFileList([]);
      setPreviewImage('');
      removeSchoolLogo.mutate({ school_id: school_id });
      return;
    }

    const file = newFileList[0];
    try {
      // Validate dimensions
      await validateImageDimensions(file.originFileObj);

      // Set preview image
      const previewUrl = URL.createObjectURL(file.originFileObj);
      setPreviewImage(previewUrl);

      // Update file list and send payload
      setFileList(newFileList);
      displaySuccess('Image uploaded successfully.');
    } catch (error) {
      // Clear file list if validation fails
      setFileList([]);
      setPreviewImage('');
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <>
      <PageTitle>Settings</PageTitle>
      <AppsContainer fullView={true}>
        <div className="px-5">
          <Tabs
            defaultActiveKey={location?.state?.key == 4 ? '4' : '1'}
            className="py-5"
            items={[
              {
                label: (
                  <div className="text-base">
                    <UIText>General</UIText>
                  </div>
                ),
                key: '1',
                children: (
                  <>
                    <Form onFinish={handleSubmit} layout="vertical" form={form}>
                      <div className="flex gap-4">
                        <Card className="w-4/6 bg-slate-200 rounded-lg">
                          {/* <p className="text-xl font-bold text-slate-600 mb-5">General</p> */}
                          {generalDetails || isError ? (
                            <UILoader />
                          ) : (
                            <div className="w-[500px] gap-4">
                              <CustomFormItem name={'themePrimaryColor'} label="Theme Color" className="w-full">
                                <Card>
                                  <div className="space-y-4">
                                    <div className="flex gap-4 items-center justify-between flex-wrap ">
                                      <div>
                                        <Label>
                                          <UIText>Primary</UIText>
                                        </Label>
                                        <p className="text-sm text-muted-foreground">{primaryColor}</p>
                                      </div>
                                      <ColorPicker onChange={handlePrimaryColorChange} value={primaryColor} />
                                    </div>
                                    <div className="flex gap-4 items-center justify-between flex-wrap">
                                      <div>
                                        <Label>
                                          <UIText>Secondary Color</UIText>
                                        </Label>
                                        <p className="text-sm text-muted-foreground">{secondaryColor}</p>
                                        <Button
                                          type="button"
                                          variant={'outline'}
                                          size={'sm'}
                                          className="text-muted-foreground"
                                          onClick={() => setSecondaryColor(generateSecondaryColor(primaryColor))}
                                        >
                                          <UIText>Suggested</UIText>: {generateSecondaryColor(primaryColor)}
                                        </Button>
                                      </div>
                                      <ColorPicker value={secondaryColor} onChange={handleSecondaryColorChange} />
                                    </div>
                                  </div>
                                </Card>
                              </CustomFormItem>
                              {isSuperAdmin && (
                                <CustomFormItem label="Support Email" name="support_email">
                                  <Input placeholder="Enter Support Email" />
                                </CustomFormItem>
                              )}
                              {isAdmin && (
                                <CustomFormItem label="Select School Logo" name="school logo">
                                  <Upload
                                    listType="picture-card"
                                    accept="image/*"
                                    fileList={fileList}
                                    maxCount={1}
                                    onPreview={(file) => {
                                      setPreviewImage(file.url || file.thumbUrl || null);
                                      setPreviewOpen(true);
                                    }}
                                    onChange={handleChange}
                                    beforeUpload={() => false}
                                  >
                                    {fileList.length < 1 && uploadButton}
                                  </Upload>
                                  {previewImage && (
                                    <AntdImage
                                      wrapperStyle={{ display: 'none' }}
                                      preview={{
                                        visible: previewOpen,
                                        onVisibleChange: (visible) => setPreviewOpen(visible),
                                        afterOpenChange: (visible) => !visible && setPreviewImage(''),
                                      }}
                                      src={previewImage}
                                    />
                                  )}
                                </CustomFormItem>
                              )}
                            </div>
                          )}
                        </Card>
                      </div>
                      <div className="flex justify-end">
                        <UIFormSubmitButton api={addGeneralsetting} type="submit">
                          Save
                        </UIFormSubmitButton>
                      </div>
                    </Form>
                  </>
                ),
              },
              {
                label: (
                  <div className="text-base">
                    <UIText>Year</UIText>
                  </div>
                ),
                key: '2',
                children: (
                  <>
                    <YearData />
                  </>
                ),
              },
              {
                label: (
                  <div className="text-base">
                    <UIText>Audit Log</UIText>
                  </div>
                ),
                key: '3',
                children: (
                  <>
                    <DynamicTable
                      data={Array.isArray(auditLogList?.list) ? auditLogList?.list || [] : []}
                      columns={auditLogColumns}
                      loading={isLoading}
                      totalCount={auditLogList?.totalCount || 0}
                      pageSize={pageQuery.limit}
                      pageIndex={(pageQuery.page ?? 1) - 1}
                      onPaginationChange={handlePaginationChange}
                      selectFilters={filters}
                    />
                  </>
                ),
              },

              ...(user.role_name == ROLE_NAME.SUPER_ADMIN
                ? [
                    {
                      label: (
                        <>
                          <UIText>Master Subject</UIText>
                        </>
                      ),
                      key: '4',
                      children: (
                        <>
                          <MasterSubjectlist />
                        </>
                      ),
                    },
                    {
                      label: (
                        <>
                          <UIText>Support Logs</UIText>
                        </>
                      ),
                      key: '5',
                      children: (
                        <>
                          <SupportLogs />
                        </>
                      ),
                    },
                  ]
                : []),
              // {
              //   label: 'Master Subject',
              //   key: '4',
              //   children: (
              //     <>
              //       <MasterSubjectlist />
              //     </>
              //   ),
              // },
            ]}
          />
        </div>
      </AppsContainer>
    </>
  );
}
