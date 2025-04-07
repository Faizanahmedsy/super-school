import { StyledHeaderAlertDark } from './index.styled';

export default function NotificationBar() {
  const onClose = () => {};

  return (
    <StyledHeaderAlertDark
      message=" Get flat 60% off on your first purchase"
      type="warning"
      closable
      onClose={onClose}
    />
  );
}
