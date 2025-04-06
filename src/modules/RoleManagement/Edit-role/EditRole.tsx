import AppPageMeta from '@/app/components/AppPageMeta';
import AppsContainer from '@/app/components/AppsContainer';
import UIFormSubmitButton from '@/components/custom/buttons/UIFormSubmitButton';
import InstituteSelect from '@/components/global/Form/SelectInstitute';
import ModuleSelect from '@/components/global/Form/selectModule';
import RoleSelect from '@/components/global/Form/SelectRole';
import PageTitle from '@/components/global/PageTitle';
import { useCreatePermission, usePermissionList, useUpdatePermission } from '@/modules/Permission/permission.actions';
import useGlobalState from '@/store';
import { Card, Checkbox, Col, Form, Modal, Row } from 'antd';
import React, { useEffect, useState } from 'react';

const PermissionCard: React.FC<{
  title: string;
  permissions: { add: boolean; view: boolean; edit: boolean; delete: boolean };
  onChange: (e: React.ChangeEvent<HTMLInputElement>, permission: string) => void;
  onCheckAll: (e: any) => void;
  isCheckedAll: boolean;
}> = ({ title, permissions, onChange, onCheckAll, isCheckedAll }) => {
  return (
    <Card title={title} bordered={false} style={{ width: 300 }}>
      <Checkbox checked={isCheckedAll} onChange={onCheckAll}>
        Check All
      </Checkbox>
      <br />
      <Checkbox checked={permissions.add} onChange={(e: any) => onChange(e, 'add')}>
        Add
      </Checkbox>
      <br />
      <Checkbox checked={permissions.view} onChange={(e: any) => onChange(e, 'view')}>
        View
      </Checkbox>
      <br />
      <Checkbox checked={permissions.edit} onChange={(e: any) => onChange(e, 'edit')}>
        Edit
      </Checkbox>
      <br />
      <Checkbox checked={permissions.delete} onChange={(e: any) => onChange(e, 'delete')}>
        Delete
      </Checkbox>
    </Card>
  );
};

const EditRole = ({ editMode = false }: { editMode?: boolean }) => {
  const [form] = Form.useForm();
  const school_id = useGlobalState((state) => state.school_id);
  const role_id = useGlobalState((state) => state.role_id);

  const updatePermission = useUpdatePermission();
  const createPermission = useCreatePermission();

  const { data: permissionList } = usePermissionList({
    school_id: school_id ? Number(school_id) : undefined,
    role_id: role_id ? Number(role_id) : undefined,
  });

  const [permissions, setPermissions] = useState({
    student: { add: false, view: false, edit: false, delete: false },
  });

  useEffect(() => {
    if (editMode && permissionList) {
      const initialPermissions: any = permissionList.list.reduce(
        (acc, permission) => {
          acc[permission.module.module_name] = {
            add: permission.allow.add,
            view: permission.allow.view,
            edit: permission.allow.edit,
            delete: permission.allow.delete,
          };
          return acc;
        },
        {} as Record<string, { add: boolean; view: boolean; edit: boolean; delete: boolean }>
      );

      setPermissions(initialPermissions);
    }
  }, [editMode, permissionList]);

  const handleCheckboxChange =
    (moduleId: number, section: string) => (e: React.ChangeEvent<HTMLInputElement>, permission: string) => {
      const updatedPermissions = {
        ...permissions,
        [section]: {
          ...(permissions[section as keyof typeof permissions] || {}),
          [permission]: e.target.checked,
        },
      };
      setPermissions(updatedPermissions);

      // Call API to update immediately after checkbox change
      const payload = {
        school_id: Number(school_id),
        role_id: Number(role_id),
        module_id: moduleId, // Use the dynamic module ID here
        allow: {
          add: updatedPermissions[section as keyof typeof permissions]?.add || false,
          view: updatedPermissions[section as keyof typeof permissions]?.view || false,
          edit: updatedPermissions[section as keyof typeof permissions]?.edit || false,
          delete: updatedPermissions[section as keyof typeof permissions]?.delete || false,
        },
      };

      const mutation: any = editMode ? updatePermission : createPermission;
      mutation.mutate(editMode ? { id: moduleId, payload } : payload);
    };
  const handleCheckAllChange = (moduleId: number, section: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    const updatedPermissions = {
      ...permissions,
      [section]: {
        add: checked,
        view: checked,
        edit: checked,
        delete: checked,
      },
    };
    setPermissions(updatedPermissions);

    // Call API to update immediately after "Check All" change
    const payload = {
      school_id: Number(school_id),
      role_id: Number(role_id),
      module_id: moduleId, // Use the dynamic module ID here
      allow: {
        add: checked,
        view: checked,
        edit: checked,
        delete: checked,
      },
    };

    const mutation: any = editMode ? updatePermission : createPermission;
    mutation.mutate(editMode ? { id: moduleId, payload } : payload);
  };

  // const handleSubmit = async () => {
  //     const payload = {
  //         institute_id: Number(school_id),
  //         role_id: Number(role_id),
  //         module_id: Number(module_id),
  //         allow: {
  //             add: permissions.student?.add || false,
  //             view: permissions.student?.view || false,
  //             edit: permissions.student?.edit || false,
  //             delete: permissions.student?.delete || false,
  //         },
  //     };

  //     const mutation: any = editMode ? updatePermission : createPermission;

  //     mutation.mutate(editMode ? { id: Number(module_id), payload } : payload);
  // };

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);

  const showModal = () => {
    setModalVisible(true);
  };

  const handleOk = (values: any) => {
    // Prepare the payload using form values
    const payload = {
      school_id: Number(values.school_id),
      role_id: Number(values.id),
      module_id: Number(values.id),
      allow: {
        add: values.add,
        view: values.view,
        edit: values.edit,
        delete: values.delete,
      },
    };

    // Call createPermission function or any other action
    createPermission.mutate(payload);
    setModalVisible(false);
    form.resetFields();
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  return (
    <>
      <PageTitle
        extraItem={
          <div className="gap-2 flex">
            <UIFormSubmitButton onClick={showModal}>Create</UIFormSubmitButton>
          </div>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          {
            label: 'Select School',
            href: '/role/select',
          },
          {
            label: 'Select Role',
            href: '/module/select',
          },
          {
            label: 'Permissions Module',
            href: '/module/select/editrole',
          },
        ]}
      >
        Module Permission
      </PageTitle>
      <AppPageMeta title="Edit Role" />
      <AppsContainer
        title={'Edit Role'}
        fullView={true}
        type="bottom"
        cardStyle={{ backgroundColor: '#F4F7FE', boxShadow: 'none', border: 'none' }}
      >
        <div style={{ padding: '20px' }}>
          <Row gutter={[16, 16]}>
            {permissionList?.list?.map((permission) => (
              <Col span={6} key={permission.id}>
                <PermissionCard
                  title={permission?.module?.module_name || ''}
                  permissions={
                    permissions[permission?.module?.module_name as keyof typeof permissions] || {
                      add: false,
                      view: false,
                      edit: false,
                      delete: false,
                    }
                  }
                  onChange={handleCheckboxChange(permission.module.id, permission.module.module_name)}
                  onCheckAll={handleCheckAllChange(permission.module.id, permission.module.module_name)}
                  isCheckedAll={Object.values(
                    permissions[permission.module.module_name as keyof typeof permissions] || {}
                  ).every(Boolean)}
                />
              </Col>
            ))}
          </Row>
          {/* <Row gutter={[16, 16]}>
                        {permissionList?.list?.map((permission) => (
                            <Col span={6} key={permission.id}>
                                <PermissionCard
                                    title={permission?.module?.module_name}
                                    permissions={permissions[permission?.module?.module_name as keyof typeof permissions] || { add: false, view: false, edit: false, delete: false }}
                                    onChange={handleCheckboxChange(permission?.module?.module_name)}
                                    onCheckAll={handleCheckAllChange(permission?.module?.module_name)}
                                    isCheckedAll={Object.values(permissions[permission?.module?.module_name as keyof typeof permissions] || {}).every(Boolean)}
                                />
                            </Col>
                        ))}
                    </Row> */}
        </div>
      </AppsContainer>

      <Modal
        title="Create Permission"
        open={modalVisible}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              handleOk(values); // Pass form values to handleOk
            })
            .catch((info) => {
              console.log('Validate Failed:', info);
            });
        }}
        onCancel={handleCancel}
        okText="Create"
      >
        <Form form={form} layout="vertical">
          <InstituteSelect name="school_id" />
          <ModuleSelect name="id" />
          <RoleSelect name="id" />
          <Form.Item name="add" valuePropName="checked">
            <Checkbox>Add</Checkbox>
          </Form.Item>

          <Form.Item name="view" valuePropName="checked">
            <Checkbox>View</Checkbox>
          </Form.Item>

          <Form.Item name="edit" valuePropName="checked">
            <Checkbox>Edit</Checkbox>
          </Form.Item>

          <Form.Item name="delete" valuePropName="checked">
            <Checkbox>Delete</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
export default EditRole;
