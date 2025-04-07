import AppsContainer from '@/app/components/AppsContainer';
import CreateButton from '@/components/custom/buttons/CreateButton';
import UIFormSubmitButton from '@/components/custom/buttons/UIFormSubmitButton';
import TableDeleteBtn from '@/components/custom/Table/TableDeleteBtn';
import TableEditBtn from '@/components/custom/Table/TableEditBtn';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import UISelect from '@/components/global/Form/v4/UISelect';
import UIText from '@/components/global/Text/UIText';
import { Button } from '@/components/ui/button';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { useListOption } from '@/hooks/use-select-option';
import { ACTION, MODULE, ROLE_NAME } from '@/lib/helpers/authHelpers';
import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { useSubjectList } from '@/modules/Master/subject/subject.action';
import {
  useCreateStudymaterial,
  useDeleteStudymaterial,
  useStudymaterialDetails,
  useStudymaterialList,
  useUpdateStudymaterial,
} from '@/services/studymaterial/studymaterial.hook';
import { QueryParams } from '@/services/types/params';
import useGlobalState from '@/store';
import { ColumnDef, Row } from '@tanstack/react-table';
import { DatePicker, Form, Input, Modal, Select, Tabs, Tooltip, Upload } from 'antd';
import dayjs from 'dayjs';
import { DownloadIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { FaFilePdf } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { useSelectFiltersStudyMaterials } from './GlobalfilterStudyMaterial';

import UILoader from '@/components/custom/loaders/UILoader';
import UIMultiSelect from '@/components/global/Form/v4/UIMultiSelect';
import { requireMessage } from '@/lib/form_validations/formmessage';
import { useGradeList } from '@/services/master/grade/grade.hook';
import { Col as AntCol, Row as AntRow } from 'antd';
import UIFormItemSelect from '@/components/global/Form/v4/UIFormItem';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import CustomFormItem from '@/components/custom/form/CustomFormItem';

const StudyMaterialMainList = () => {
  const user: any = useGlobalState((state) => state.user);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [form] = Form.useForm();
  const [selectedYearFilter, setSelectedYearFilter] = useState<string | null | undefined | any>(null);

  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<any>();
  const [rowId, setRowId] = useState();
  const addStudymaterial = useCreateStudymaterial();
  const updateStudyMaterial = useUpdateStudymaterial();
  const { mutate: deleteStudymaterial } = useDeleteStudymaterial();
  const { selectFilters, selectedFilters, searchQuery, searchColumn, handleSearchChange, setSelectedFilters } =
    useSelectFiltersStudyMaterials();
  const [selectedType, setSelectedType] = useState('book');
  const [selectedGrade, setSelecteGrade] = useState('');
  const [Type, setType] = useState('book');
  const [subjectSelectedFilter, setSubjectSelectedFilter] = useState<string>();
  const school_id: any = useRoleBasedSchoolId();
  const batchId = useRoleBasedCurrentBatch();

  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    setSelectedType('book');
    if (Type == 'old_question_paper_and_memo') {
      setSelectedFilters({
        ...selectedFilters,
        grade: null,
        subject: null,
        batch: null,
        term: null,
        school: null,
      });
    } else {
      setSubjectSelectedFilter('');
      setSelecteGrade('');
    }
  }, [Type, setSelectedType]);

  const { data: getDatabyId, isPending } = useStudymaterialDetails(rowId);

  useEffect(() => {
    if (getDatabyId) {
      setSelectedRow(getDatabyId);
    }
  }, [getDatabyId]);

  const {
    data: studyMaterialList,
    refetch,
    isLoading,
  } = useStudymaterialList({
    ...pageQuery,
    sort: 'desc',
    grade_id: selectedFilters?.grade ? selectedFilters?.grade : selectedGrade,
    term_id: selectedFilters?.term ? selectedFilters?.term : undefined,
    subject_id: selectedFilters?.subject ? selectedFilters?.subject : subjectSelectedFilter,
    search: searchQuery,
    school_id: school_id,
    ...(Type == 'old_question_paper_and_memo' && {
      year: dayjs(selectedYearFilter).year() ? dayjs(selectedYearFilter).year() : batchId,
    }),
    type: Type,
  });

  const allColumns: ColumnDef<any[0]>[] = [
    {
      accessorKey: 'name',
      header: 'Title',
      cell: ({ row }: { row: Row<any> }) => <span>{row.original.name || '-'}</span>,
    },
    {
      accessorKey: 'url',
      header: 'Url',
      cell: ({ row }: { row: Row<any> }) =>
        row.original?.url && row.original?.url !== 'undefined' ? (
          <a
            style={{ color: 'blue', textDecoration: 'underline' }}
            href={row.original.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation(); // Prevents event propagation
            }}
          >
            {row.original.url}
          </a>
        ) : (
          '-'
        ),
    },
    {
      accessorKey: 'subject_name',
      header: 'Subject',
      cell: ({ row }: { row: Row<any> }) => <>{row.original?.master_subject?.subject_name || '-'}</>,
    },
    {
      accessorKey: 'grade',
      header: 'Grade',
      cell: ({ row }: { row: Row<any> }) => <>{row.original?.grade?.grade_number || '-'}</>,
    },
    {
      accessorKey: 'year',
      header: 'Year',
      cell: ({ row }: { row: Row<any> }) => <>{row.original?.year || '-'}</>,
    },

    {
      accessorKey: 'question_paper',
      header: 'Question Paper',
      cell: (info) => {
        const { question_paper } = info.row.original;
        return (
          <div className="cursor-pointer w-20">
            <Tooltip title="Preview Question Paper">
              <FaFilePdf size={24} onClick={(e) => handlePreview(e, question_paper)} />
            </Tooltip>
          </div>
        );
      },
    },

    {
      accessorKey: 'paper_memo',
      header: 'Memo',
      cell: (info) => {
        const { paper_memo } = info.row.original;
        return (
          <div className="cursor-pointer w-20">
            <Tooltip title="Preview Memo">
              <FaFilePdf size={24} onClick={(e) => handlePreview(e, paper_memo)} />
            </Tooltip>
          </div>
        );
      },
    },

    // {
    //   accessorKey: 'description',
    //   header: 'Description',
    //   cell: ({ row }: { row: Row<any> }) => <>{row.original?.description ? row.original?.description : '-'}</>,
    // },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: Row<any> }) => (
        <>
          <div className="flex space-x-2 items-center">
            {row?.original?.file ? (
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-primary/10 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.03)] h-10 w-10 p-0"
                onClick={(e) => handlePreview(e, row?.original.file)}
              >
                <Tooltip title="Download">
                  <DownloadIcon size={20} className="text-primary" />
                </Tooltip>
              </Button>
            ) : (
              <>
                <div className="h-10 w-10 p-0"></div>
              </>
            )}
            <TableEditBtn
              onClick={(event) => handleEdit(event, row?.original)}
              moduleName={MODULE.STUDY_MATERIAL}
              checkPermission={true}
            />
            <TableDeleteBtn
              onClick={(event) => handleDelete(event, row.original.id)}
              checkPermission={true}
              moduleName={MODULE.STUDY_MATERIAL}
            />
          </div>
        </>
      ),
    },
  ];

  const handleRowClick = (id: any) => {
    setRowId(id);
    setIsModalVisible(true);
  };

  const handlePreview = async (e: React.MouseEvent, url: any) => {
    e.stopPropagation();
    const fileURL = `${url}`;
    window.open(fileURL, '_blank');
  };

  const filteredColumns = allColumns.filter((col: any) => {
    if (Type !== 'old_question_paper_and_memo') {
      return col.accessorKey !== 'paper_memo' && col.accessorKey !== 'question_paper' && col.accessorKey !== 'year';
    }
    return (
      Type !== 'old_question_paper_and_memo' ||
      (col.accessorKey !== 'topic' && col.accessorKey !== 'url' && col.accessorKey !== 'term')
    );
  });

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      limit: pageSize,
    }));
  };

  const handleEdit = async (e: React.MouseEvent, data: any) => {
    e.stopPropagation();
    setOpenAddModal(true);
    setEditId(data?.id);
    setIsEditMode(true);
    const material: any = data as
      | Partial<{
          type: string;
          name: string;
          topic: string;
          url: string;
          year: any;
          batch_id: string;
          grade_id: string;
          grade_class_id: string;
          term_id: string;
          subject_id: string;
          description: string;
          file: string;
          question_paper: string;
          paper_memo: string;
        }>
      | undefined;

    if (material) {
      setSelectedType(material?.type);
      setSelecteGrade(material?.grade_id);
      form.setFieldsValue({
        type: material?.type || 'book',
        name: material?.name || '',
        topic: material?.topic || '',
        url: material?.url || '',
        year: material?.year ? dayjs().year(material?.year) : null,
        batch_id: material?.batch_id || '',
        grade_id: material?.grade_id || '',
        term_id: material?.term_id || '',
        subject_id: material?.subject_id || '',
        description: material?.description || '',
        file: material?.file
          ? [
              {
                uid: '-1',
                name: 'File',
                status: 'done',
                url: material.file,
              },
            ]
          : [],
        question_paper: material?.question_paper
          ? [
              {
                uid: '-1',
                name: 'Question Paper',
                status: 'done',
                url: material.question_paper,
              },
            ]
          : [],
        paper_memo: material?.paper_memo
          ? [
              {
                uid: '-1',
                name: 'Memo',
                status: 'done',
                url: material.paper_memo,
              },
            ]
          : [],
      });
    }
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    Modal.confirm({
      centered: true,
      title: 'Are you sure you want to delete?',
      okText: 'yes',
      cancelText: 'Cancel',
      onOk: async () => {
        deleteStudymaterial(id, {
          onSuccess: () => {
            refetch();
          },
        });
      },
    });
  };

  const uploadProps = (allowedTypes: string[]) => ({
    customRequest: (options: any) => {
      const { file, onSuccess, onError } = options;
      setTimeout(() => {
        if (allowedTypes.includes(file.type)) {
          file.url = URL.createObjectURL(file); // Set preview URL
          onSuccess('ok', file);
          displaySuccess(`${file.name} uploaded successfully.`);
        } else {
          onError(new Error('Upload failed'));
          displayError(`${file.name} upload failed. Only ${allowedTypes.join(', ')} files are allowed.`);
        }
      }, 1000);
    },
    beforeUpload: (file: File) => {
      if (!allowedTypes.includes(file.type)) {
        displayError(`${file.name} is not a valid file type. Only ${allowedTypes.join(', ')} files are allowed.`);
        return false;
      }
      return true;
    },
    onPreview: async (file: any) => {
      if (file.url) {
        window.open(file.url, '_blank');
      } else {
        displayError(`Preview not available.`);
      }
    },
    showUploadList: {
      showPreviewIcon: true, // Ensure preview button is visible
      showRemoveIcon: true,
    },
    maxCount: 1,
  });

  // const uploadProps = (allowedTypes: string[]) => {
  //   customRequest: (options: any) => {
  //     const { file, onSuccess, onError } = options;
  //     setTimeout(() => {
  //       if (file.type === 'application/pdf') {
  //         file.url = URL.createObjectURL(file); // Set preview URL
  //         onSuccess('ok', file);
  //         displaySuccess(`${file.name} uploaded successfully.`);
  //       } else {
  //         onError(new Error('Upload failed'));
  //         displayError(`${file.name} upload failed. Only PDF files are allowed.`);
  //       }
  //     }, 1000);
  //   },
  //   beforeUpload: (file: File) => {
  //     const isPDF = file.type === 'application/pdf';
  //     if (!isPDF) {
  //       displayError(`${file.name} is not a valid file type. Only PDF files are allowed.`);
  //     }
  //     return isPDF;
  //   },
  //   onPreview: async (file: any) => {
  //     if (file.url) {
  //       window.open(file.url, '_blank');
  //     } else {
  //       displayError(`Preview not available.`);
  //     }
  //   },
  //   showUploadList: {
  //     showPreviewIcon: true, // Ensure preview button is visible
  //     showRemoveIcon: true,
  //   },
  //   maxCount: 1,
  // };

  const handleSubmit = (values: any) => {
    const formData = new FormData();
    const isOldQuestionPaperAndMemo = values.type == 'old_question_paper_and_memo';

    if (!isEditMode && school_id) {
      formData.append('school_id', school_id);
    }

    if (values.year) {
      formData.append('year', dayjs(values.year).format('YYYY'));
    }

    formData.append('batch_id', batchId as any);

    if (values.type) {
      formData.append('type', values.type ? values.type : selectedType);
    }

    Object.entries(values).forEach(([key, value]: any) => {
      if (!value || key === 'year' || key === 'type') return; // Skip if value is falsy

      if ((key == 'question_paper' || key == 'paper_memo') && isOldQuestionPaperAndMemo) {
        if (value[0]?.originFileObj) {
          formData.append(key, value[0].originFileObj);
        }
      } else if (key == 'file') {
        if (value[0]?.originFileObj) {
          formData.append(key, value[0].originFileObj);
        }
      } else {
        formData.append(key, value);
      }
    });

    if (isEditMode && editId) {
      updateStudyMaterial.mutate(
        { id: editId, payload: formData },
        {
          onSuccess: () => {
            setOpenAddModal(false);
            form.resetFields();
            setIsEditMode(false);
            refetch();
          },
        }
      );
    } else {
      addStudymaterial.mutate(formData, {
        onSuccess: () => {
          setOpenAddModal(false);
          form.resetFields();
          setIsEditMode(false);
          refetch();
        },
      });
    }
  };

  const filtersToSend =
    Type == 'old_question_paper_and_memo'
      ? selectFilters.filter((filter) => filter.key !== 'batch')
      : selectFilters.filter((filter) => user.role_name !== ROLE_NAME.STUDENT && user.role_name !== ROLE_NAME.PARENT);

  const { data } = useSubjectList(
    {
      grade_id: selectedGrade,
      batch_id: selectedFilters.batch ? selectedFilters.batch : batchId,
      term_id: selectedFilters.term,
      school_id: selectedFilters.school ? selectedFilters.school : school_id,
    },
    Boolean(selectedGrade)
  );

  const { data: gradeListQuery } = useGradeList({
    sort: 'asc',
    batch_id: selectedFilters.batch ? selectedFilters.batch : batchId,
  });
  const { options: gradeOptions } = useListOption({
    listData: gradeListQuery?.list,
    labelKey: 'grade_number',
    valueKey: 'id',
  });

  // Create a properly formatted subject list
  const subjectList =
    data?.subjects.map((subject: any) => ({
      label: subject?.master_subject?.subject_name,
      value: subject?.id,
    })) || [];

  // Pass the list to useListOption
  const { options: subjectOptions } = useListOption({
    listData: subjectList,
    labelKey: 'label',
    valueKey: 'value',
  });

  const handleGradeSelectChange = (value: string) => {
    setSelecteGrade(value);
    setPageQuery({
      ...pageQuery,
      page: 1,
    });
  };

  const handleSubjectSelectChange = (value: string) => {
    setSubjectSelectedFilter(value);
    setPageQuery({
      ...pageQuery,
      page: 1,
    });
  };

  const handleYearSelectChange = (year: string) => {
    setSelectedYearFilter(year);
  };

  const selectFilter = [
    ...(user.role_name !== ROLE_NAME.STUDENT
      ? [
          {
            key: 'yearstudymaterial',
            placeholder: 'Filter by Year',
            value: selectedYearFilter,
            options: [],
            onSelectChange: handleYearSelectChange,
            defaultValue: selectedYearFilter ? selectedYearFilter : undefined,
          },
          {
            key: 'grade',
            placeholder: (
              <>
                <UIText>Filter by Grade</UIText>
              </>
            ),
            options: gradeOptions,
            onSelectChange: handleGradeSelectChange,
            defaultValue: selectedGrade ? selectedGrade : undefined,
          },
          {
            key: 'subject',
            placeholder: (
              <>
                <UIText>Filter by Subject</UIText>
              </>
            ),
            options: subjectOptions,
            onSelectChange: handleSubjectSelectChange,
            defaultValue: subjectSelectedFilter ? subjectSelectedFilter : undefined,
            width: 'lg:w-[350px]',
          },
        ]
      : []),
  ];

  return (
    <>
      <AppsContainer fullView={true}>
        <div className="flex justify-end items-center gap-4 mt-4 w-full pe-4">
          <CreateButton
            moduleName={MODULE.STUDY_MATERIAL}
            action={ACTION.ADD}
            overrideText="Create Study Material"
            onClick={() => {
              setOpenAddModal(true);
            }}
          />
          {/* <Button size="sm" variant="nsc-secondary" onClick={() => setStep(step - 1)}>
            <ChevronLeftIcon className="w-4 h-4" />
            Back
          </Button> */}
        </div>
        <div className="px-5">
          <Tabs
            defaultActiveKey={location?.state?.key == 4 ? '4' : '1'}
            className="py-5"
            items={[
              {
                label: (
                  <>
                    <div className="flex items-center gap-2 text-base" onClick={() => setType('book')}>
                      <UIText>Books and Articles</UIText>
                    </div>
                  </>
                ),
                key: '1',
                children: (
                  <DynamicTable
                    data={
                      Array.isArray(studyMaterialList?.list)
                        ? studyMaterialList?.list.filter((item: any) => item.type == 'book')
                        : []
                    }
                    columns={filteredColumns}
                    loading={isLoading}
                    totalCount={studyMaterialList?.list?.filter((item: any) => item.type == 'book')?.length || 0}
                    pageSize={pageQuery.limit}
                    pageIndex={(pageQuery.page ?? 1) - 1}
                    onPaginationChange={handlePaginationChange}
                    selectFilters={filtersToSend}
                    searchPlaceholder="Search by Title"
                    searchColumn={searchColumn}
                    handleRowClick={handleRowClick}
                    onSearchChange={handleSearchChange}
                  />
                ),
              },
              {
                label: (
                  <>
                    <div
                      className="flex items-center gap-2 text-base"
                      onClick={() => setType('old_question_paper_and_memo')}
                    >
                      <UIText>Old Question Papers & Memo</UIText>
                    </div>
                  </>
                ),
                key: '2',
                children: (
                  <DynamicTable
                    data={
                      Array.isArray(studyMaterialList?.list)
                        ? studyMaterialList?.list.filter((item: any) => item.type == 'old_question_paper_and_memo')
                        : []
                    }
                    columns={filteredColumns}
                    loading={isLoading}
                    totalCount={
                      studyMaterialList?.list?.filter((item: any) => item.type == 'old_question_paper_and_memo')
                        ?.length || 0
                    }
                    pageSize={pageQuery.limit}
                    pageIndex={(pageQuery.page ?? 1) - 1}
                    onPaginationChange={handlePaginationChange}
                    searchPlaceholder="Search by Title"
                    searchColumn={searchColumn}
                    handleRowClick={handleRowClick}
                    onSearchChange={handleSearchChange}
                    selectFilters={selectFilter}
                  />
                ),
              },
              {
                label: (
                  <>
                    <div className="flex items-center gap-2 text-base" onClick={() => setType('documents')}>
                      <UIText>Documents and Links</UIText>
                    </div>
                  </>
                ),
                key: '3',
                children: (
                  <DynamicTable
                    data={
                      Array.isArray(studyMaterialList?.list)
                        ? studyMaterialList?.list.filter((item: any) => item.type == 'documents')
                        : []
                    }
                    columns={filteredColumns}
                    loading={isLoading}
                    totalCount={studyMaterialList?.list?.filter((item: any) => item.type == 'documents')?.length || 0}
                    pageSize={pageQuery.limit}
                    pageIndex={(pageQuery.page ?? 1) - 1}
                    onPaginationChange={handlePaginationChange}
                    selectFilters={filtersToSend}
                    searchPlaceholder="Search by Title"
                    searchColumn={searchColumn}
                    handleRowClick={handleRowClick}
                    onSearchChange={handleSearchChange}
                  />
                ),
              },
            ]}
          />
        </div>
      </AppsContainer>

      <Modal
        title={isEditMode ? <UIText>Edit Study Material</UIText> : <UIText>Add Study Material</UIText>}
        open={openAddModal}
        width={1200}
        maskClosable={false}
        onCancel={() => {
          setSelectedType('book');
          setEditId(null);
          setIsEditMode(false);
          setOpenAddModal(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            type: selectedType,
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CustomFormItem name="type" label="Type" rules={[{ required: true, message: 'Please select a type!' }]}>
              <UISelect
                placeholder="Select a type"
                onChange={(value: any) => {
                  setSelectedType(value);
                }}
                options={[
                  {
                    value: 'book',
                    label: (
                      <>
                        <UIText>Books and Articles</UIText>
                      </>
                    ),
                  },
                  {
                    value: 'old_question_paper_and_memo',
                    label: (
                      <>
                        <UIText>Old Question Papers & Memo</UIText>
                      </>
                    ),
                  },
                  {
                    value: 'documents',
                    label: (
                      <>
                        <UIText>Documents and Links</UIText>
                      </>
                    ),
                  },
                ]}
              />
            </CustomFormItem>

            <CustomFormItem name="name" label="Title" rules={[{ required: true, message: 'Please enter a title!' }]}>
              <Input placeholder="Enter title" />
            </CustomFormItem>

            {selectedType !== 'old_question_paper_and_memo' && (
              <>
                <CustomFormItem
                  name="topic"
                  label="Topic"
                  rules={[{ required: true, message: 'Please enter a topic!' }]}
                >
                  <Input placeholder="Enter topic" />
                </CustomFormItem>
                <CustomFormItem
                  name="url"
                  label="URL"
                  rules={[
                    {
                      validator: (_: any, value: any) => {
                        const file = form.getFieldValue('file');
                        if (file && file.length > 0) {
                          return Promise.resolve();
                        }

                        if (!value) {
                          return Promise.resolve();
                        }

                        const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:[0-9]{1,5})?(\/[^\s]*)?$/;
                        if (urlPattern.test(value)) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Please enter a valid URL!'));
                      },
                    },
                  ]}
                >
                  <Input placeholder="Enter URL" />
                </CustomFormItem>
              </>
            )}

            {selectedType !== 'documents' && selectedType !== 'book' && (
              <>
                <CustomFormItem
                  name="year"
                  label="Select Year"
                  rules={[{ required: true, message: 'Please select a Year!' }]}
                >
                  <DatePicker
                    picker="year"
                    className="w-full"
                    // onChange={handleYearChange}
                    disabledDate={(date) => {
                      const currentYear = new Date().getFullYear();
                      return date.year() > currentYear;
                    }}
                  />
                </CustomFormItem>
              </>
            )}

            <UIFormItemSelect
              label={<UIText>Select Grade</UIText>}
              name={'grade_id'}
              rules={[{ required: true, message: requireMessage('grade', 'select') }]}
            >
              <Select
                placeholder="Select Grade"
                options={gradeOptions}
                onChange={(value: any) => {
                  setSelecteGrade(value);
                  form.setFieldsValue({ subject_id: undefined });
                }}
                allowClear
              />
            </UIFormItemSelect>

            <CustomFormItem
              label="Subjects"
              name="subject_id"
              rules={[{ required: true, message: requireMessage('subject', 'select') }]}
            >
              <UISelect options={subjectOptions} placeholder="Select Subject" />
            </CustomFormItem>

            {/* {renderOptions()} */}

            {(selectedType === 'file' || selectedType === 'book' || selectedType === 'documents') && (
              <CustomFormItem
                label="Upload File"
                name="file"
                valuePropName="fileList"
                getValueFromEvent={(e: any) => (Array.isArray(e) ? e : e?.fileList)}
                rules={[
                  {
                    validator: (_: any, value: any) => {
                      const url = form.getFieldValue('url');
                      if (url) {
                        return Promise.resolve();
                      }

                      if (!value || value.length === 0) {
                        return Promise.reject(new Error('Please upload the file.'));
                      }

                      const allowedTypes = [
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                      ];
                      if (!allowedTypes.includes(value[0].type)) {
                        return Promise.reject(new Error('Only PDF and DOC/DOCX files are allowed.'));
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Upload
                  accept=".pdf,.doc,.docx"
                  {...uploadProps([
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  ])}
                  maxCount={1}
                >
                  <Button type="button">
                    <UIText>Upload File</UIText>
                  </Button>
                </Upload>
              </CustomFormItem>
            )}

            {selectedType === 'old_question_paper_and_memo' && (
              <>
                <CustomFormItem
                  label="Upload Question Paper"
                  name="question_paper"
                  valuePropName="fileList"
                  getValueFromEvent={(e: any) => (Array.isArray(e) ? e : e?.fileList)}
                  rules={[{ required: true, message: 'Please upload the question paper.' }]}
                >
                  <Upload accept=".pdf" {...uploadProps(['application/pdf'])} maxCount={1}>
                    <Button type="button">Upload Question Paper</Button>
                  </Upload>
                </CustomFormItem>
                <CustomFormItem
                  label="Upload Memo"
                  name="paper_memo"
                  valuePropName="fileList"
                  getValueFromEvent={(e: any) => (Array.isArray(e) ? e : e?.fileList)}
                  rules={[{ required: true, message: 'Please upload the memo.' }]}
                >
                  <Upload accept=".pdf" {...uploadProps(['application/pdf'])} maxCount={1}>
                    <Button type="button">Upload Memo</Button>
                  </Upload>
                </CustomFormItem>
              </>
            )}

            <CustomFormItem name="description" label="Description">
              <Input.TextArea placeholder="Enter description" rows={4} />
            </CustomFormItem>
          </div>

          <div className="flex justify-end">
            <UIFormSubmitButton api={isEditMode ? updateStudyMaterial : addStudymaterial} type="submit">
              {isEditMode ? <UIText>Update</UIText> : <UIText>Save</UIText>}
            </UIFormSubmitButton>
          </div>
        </Form>
      </Modal>

      <Modal
        title={
          <>
            <UIText>More Info</UIText>
          </>
        }
        open={isModalVisible}
        centered={true}
        width={900}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            <UIText>Close</UIText>
          </Button>,
        ]}
      >
        {isPending ? (
          <UILoader />
        ) : (
          <AntRow gutter={[16, 16]}>
            {selectedRow ? (
              <>
                <AntCol span={12}>
                  <p className="flex gap-1">
                    <strong>
                      <UIText>Title</UIText>
                    </strong>
                    : {selectedRow.name || '-'}
                  </p>
                  <p className="flex gap-1">
                    <strong>
                      <UIText>Topic</UIText>
                    </strong>
                    : {selectedRow.topic || '-'}
                  </p>
                  <p className="flex gap-1">
                    <strong>
                      <UIText>Batch Year</UIText>
                    </strong>
                    : {selectedRow.batch?.start_year ? selectedRow.batch?.start_year : selectedRow?.year || '-'}
                  </p>
                  <p className="flex gap-1">
                    <strong>
                      <UIText>Grade</UIText>
                    </strong>
                    : {selectedRow.grade?.grade_number || '-'}
                  </p>
                  <p className="flex gap-1">
                    <strong>
                      <UIText>Subject Code</UIText>
                    </strong>
                    : {selectedRow.master_subject?.subject_code || '-'}
                  </p>
                </AntCol>
                <AntCol span={12}>
                  <p className="flex gap-1">
                    <strong>
                      <UIText>Type</UIText>
                    </strong>
                    : {selectedRow.type || '-'}
                  </p>
                  <p className="flex gap-1">
                    <strong>
                      <UIText>Description</UIText>
                    </strong>
                    : {selectedRow.description || '-'}
                  </p>
                  <p className="flex gap-1">
                    <strong>
                      <UIText>File</UIText>
                    </strong>
                    :{' '}
                    {selectedRow.file ? (
                      <a href={selectedRow.file} target="_blank" rel="noopener noreferrer">
                        <UIText>View File</UIText>
                      </a>
                    ) : (
                      '-'
                    )}
                  </p>
                  <p className="flex gap-1">
                    <strong>
                      <UIText>URL</UIText>
                    </strong>
                    :{' '}
                    {selectedRow.url ? (
                      <a href={selectedRow.url} target="_blank" rel="noopener noreferrer">
                        <UIText>Visit URL</UIText>
                      </a>
                    ) : (
                      '-'
                    )}
                  </p>
                  <p className="flex gap-1">
                    <strong>
                      <UIText>Subject Name</UIText>
                    </strong>
                    : {selectedRow.master_subject?.subject_name || '-'}
                  </p>
                </AntCol>
              </>
            ) : (
              <UIText>No Result Available</UIText>
            )}
          </AntRow>
        )}
      </Modal>
    </>
  );
};

export default StudyMaterialMainList;
