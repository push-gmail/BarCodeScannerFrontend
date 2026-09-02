import { Bell, Menu } from "lucide-react";

type Props = {
  onMenuClick?: () => void;
};

export default function AdminHeader({
  onMenuClick,
}: Props) {
  return (
    <header className="adminHeader">
      <div className="adminHeaderLeft">
        <button
          type="button"
          className="adminMenuButton"
          onClick={onMenuClick}
          aria-label="Open admin menu"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="adminHeaderCenter">
        <strong>Admin Panel</strong>
        <span>HomeQR Management</span>
      </div>

      <div className="adminHeaderRight">
        <button
          type="button"
          className="adminNotificationButton"
          aria-label="Admin notifications"
          title="Notifications"
        >
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
}
