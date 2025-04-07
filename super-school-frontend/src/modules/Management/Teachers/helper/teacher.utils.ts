import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { caughtIn4k } from '@/lib/helpers/error/caught-in-4k';

export function ValidateDuplicateSubjects(
  subjects: { grade_id: number; grade_class_id: number; subject_id: number; batch_id: number }[]
): boolean {
  const seen = new Set<string>();

  for (const subject of subjects) {
    // Create a unique key for each entry by combining the values of the properties
    const key = `${subject.grade_id}-${subject.grade_class_id}-${subject.subject_id}-${subject.batch_id}`;

    // Check if the key already exists in the Set
    if (seen.has(key)) {
      return false; // Duplicate found, return false
    }

    // Add the key to the Set
    seen.add(key);
  }

  return true; // No duplicates found, return true
}

export const getRestrictedColumns = (userRole: string | undefined, showEdit: boolean, showDelete: boolean) => {
  if (!userRole) {
    caughtIn4k(new Error('User role is not defined'));
  }
  const keys = userRole === ROLE_NAME.SUPER_ADMIN || userRole === ROLE_NAME.TEACHER ? ['email', 'mobile_number', 'masterSubjectIds'] : [];
  if (!showEdit && !showDelete) {
    keys.push('actions');
  }
  return keys;
};
