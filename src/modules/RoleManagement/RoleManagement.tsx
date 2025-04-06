import UILoader from '@/components/custom/loaders/UILoader';
import PageTitle from '@/components/global/PageTitle';
import UIText from '@/components/global/Text/UIText';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { disabledConditions } from '@/config/role-permission-checkboxs';
import { ACTION, ROLE_NAME } from '@/lib/helpers/authHelpers';
import {
  useModulePermissionList,
  useUpdateModulePermission,
} from '@/services/modulebasedpermission/modulebasedpermission.action';
import { useEffect, useState } from 'react';

interface ModulePermission {
  id: number;
  module_id: string;
  moduleName: string;
  add: boolean;
  edit: boolean;
  view: boolean;
  delete: boolean;
  role_id: string;
}

const isCheckboxDisabled = (
  roleKey: string,
  moduleName: string,
  permissionType: ACTION.VIEW | ACTION.ADD | ACTION.EDIT | ACTION.DELETE
): boolean => {
  const roleConditions = disabledConditions.find((condition) => condition.role === roleKey);

  if (roleConditions) {
    const moduleCondition = roleConditions.modules.find(
      (module) => module.name.toLowerCase() === moduleName.toLowerCase()
    );
    if (moduleCondition) {
      return moduleCondition.permissions.includes(permissionType as ACTION);
    }
  }

  return false;
};

const PermissionsTable = ({
  data,
  onPermissionChange,
  roleKey,
  checkBoxValues,
  setCheckBoxValues,
}: {
  data: ModulePermission[];
  roleKey: string;
  onPermissionChange: Function;
  checkBoxValues: any;
  setCheckBoxValues: any;
}) => {
  const handleCheckboxChange = (
    recordId: any,
    moduleId: string,
    permissionType: keyof ModulePermission,
    value: boolean,
    role_id: string
  ) => {
    setCheckBoxValues((prevValues: any) => {
      const updatedValues = { ...prevValues };
      if (!updatedValues[roleKey]) {
        updatedValues[roleKey] = {};
      }
      updatedValues[roleKey][moduleId] = {
        ...updatedValues[roleKey][moduleId],
        [permissionType]: value,
      };

      const updatedPermission = updatedValues[roleKey][moduleId];
      // Pass role_id with the updated permission
      onPermissionChange(recordId, moduleId, updatedPermission, roleKey, role_id);
      return updatedValues;
    });
  };

  return (
    <Table className="relative max-h-[500px] overflow-y-auto">
      <TableHeader className="sticky top-0 bg-gray-100  z-10">
        <TableRow>
          <TableHead className="p-3 font-semibold text-gray-700">
            <UIText>Module Name</UIText>
          </TableHead>
          <TableHead className="p-3 font-semibold text-gray-700">
            <UIText>View</UIText>
          </TableHead>
          <TableHead className="p-3 font-semibold text-gray-700">
            <UIText>Add</UIText>
          </TableHead>
          <TableHead className="p-3 font-semibold text-gray-700">
            <UIText>Edit</UIText>
          </TableHead>
          <TableHead className="p-3 font-semibold text-gray-700">
            <UIText>Delete</UIText>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((record) => (
          <TableRow key={record.module_id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
            <TableCell className="p-3 text-gray-800">{record.moduleName}</TableCell>
            <TableCell className="p-3">
              {isCheckboxDisabled(roleKey, record.moduleName, ACTION.VIEW) ? (
                <>
                  <div className="">-</div>
                </>
              ) : (
                <>
                  <Checkbox
                    checked={checkBoxValues[roleKey]?.[record.module_id]?.view || false}
                    onCheckedChange={(value: boolean) =>
                      handleCheckboxChange(record.id, record.module_id, ACTION.VIEW, value, record.role_id)
                    }
                  />
                </>
              )}
            </TableCell>
            <TableCell className="p-3">
              {isCheckboxDisabled(roleKey, record.moduleName, ACTION.ADD) ? (
                <>
                  <div className="">-</div>
                </>
              ) : (
                <>
                  <Checkbox
                    checked={checkBoxValues[roleKey]?.[record.module_id]?.add || false}
                    onCheckedChange={(value: boolean) =>
                      handleCheckboxChange(record.id, record.module_id, ACTION.ADD, value, record.role_id)
                    }
                  />
                </>
              )}
            </TableCell>
            <TableCell className="p-3">
              {isCheckboxDisabled(roleKey, record.moduleName, ACTION.EDIT) ? (
                <div>-</div>
              ) : (
                <>
                  <Checkbox
                    checked={checkBoxValues[roleKey]?.[record.module_id]?.edit || false}
                    onCheckedChange={(value: boolean) =>
                      handleCheckboxChange(record.id, record.module_id, ACTION.EDIT, value, record.role_id)
                    }
                  />
                </>
              )}
            </TableCell>
            <TableCell className="p-3">
              {isCheckboxDisabled(roleKey, record.moduleName, ACTION.DELETE) ? (
                <>
                  <div>-</div>
                </>
              ) : (
                <>
                  <Checkbox
                    checked={checkBoxValues[roleKey]?.[record.module_id]?.delete || false}
                    onCheckedChange={(value: boolean) =>
                      handleCheckboxChange(record.id, record.module_id, ACTION.DELETE, value, record.role_id)
                    }
                  />
                </>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const RoleManagement = () => {
  const { data, refetch, isPending } = useModulePermissionList({});
  const updateRolePermissions = useUpdateModulePermission();
  const [checkBoxValues, setCheckBoxValues] = useState<any>({});
  const [rolePermissions, setRolePermissions] = useState<any>({});

  useEffect(() => {
    if (data?.list) {
      const transformedPermissions = transformDataToRolePermissions(data.list);
      setRolePermissions(transformedPermissions);
    }
  }, [data?.list]);

  const transformDataToRolePermissions = (list: any[]): any => {
    return list.reduce((acc: any, item) => {
      const { role_name_show, role_name } = item.role;

      // Skip super admin role permissions as they are not editable.
      if (role_name === ROLE_NAME.SUPER_ADMIN) {
        return acc;
      }
      // Initialize role_name_show with role_name if not already present.
      if (!acc[role_name_show]) {
        acc[role_name_show] = [];
      }

      // Create ModulePermission object for the given role and module.
      const permission: ModulePermission = {
        id: item.id,
        module_id: item.module.id,
        moduleName: item.module.module_name,
        add: item.allow.add,
        edit: item.allow.edit,
        view: item.allow.view,
        delete: item.allow.delete,
        role_id: item.role_id,
      };
      acc[role_name_show].push(permission);

      if (!checkBoxValues[role_name_show]?.[permission.module_id]) {
        setCheckBoxValues((prevValues: any) => ({
          ...prevValues,
          [role_name_show]: {
            ...prevValues[role_name_show],
            [permission.module_id]: {
              view: permission.view,
              add: permission.add,
              edit: permission.edit,
              delete: permission.delete,
            },
          },
        }));
      }

      return acc;
    }, {});
  };

  const handlePermissionChange = async (
    updateId: any,
    moduleId: string,
    updatedPermission: any,
    roleKey: string,
    role_id: string
  ) => {
    try {
      const payload = {
        role_id: Number(role_id),
        module_id: Number(moduleId),
        allow: {
          add: updatedPermission.add || false,
          edit: updatedPermission.edit || false,
          view: updatedPermission.view || false,
          delete: updatedPermission.delete || false,
        },
      };

      updateRolePermissions.mutate(
        { id: updateId, payload: payload },
        {
          onSuccess: () => {
            refetch();
          },
        }
      );
    } catch (error) {
      console.error('Error updating permission:', error);
    }
  };

  return (
    <>
      <PageTitle>Manage Role & Module based Permission</PageTitle>

      <Card className="overflow-auto max-h-[80vh] scroll-area">
        <CardHeader>
          <CardDescription>Expand the role to view and manage the permissions for each module.</CardDescription>
        </CardHeader>
        <CardContent>
          {isPending && (
            <div className="flex justify-center items-center h-96">
              <UILoader />
            </div>
          )}
          <Accordion type="multiple">
            {rolePermissions.isLoading && <UILoader />}
            {Object.keys(rolePermissions).map((roleKey) => (
              <AccordionItem value={roleKey} key={roleKey} className="border-none">
                <AccordionTrigger className="hover:no-underline bg-secondary shadow-inner rounded-xl px-5 py-4">
                  <UIText>{roleKey.charAt(0).toUpperCase() + roleKey.slice(1)}</UIText>
                </AccordionTrigger>
                <div>
                  <AccordionContent className="max-h-[100vh] overflow-y-auto scroll-smooth scroll-area">
                    <PermissionsTable
                      data={rolePermissions[roleKey]}
                      roleKey={roleKey}
                      onPermissionChange={(
                        recordId: any,
                        moduleId: string,
                        updatedPermission: any,
                        roleKey: string,
                        role_id: string
                      ) => handlePermissionChange(recordId, moduleId, updatedPermission, roleKey, role_id)}
                      setCheckBoxValues={setCheckBoxValues}
                      checkBoxValues={checkBoxValues}
                    />
                  </AccordionContent>
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </>
  );
};

export default RoleManagement;
