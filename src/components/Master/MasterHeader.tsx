import {
  Bell,
  Menu,
} from "lucide-react";

type Props = {
  onMenuClick?: () => void;
};

export default function MasterHeader({
  onMenuClick,
}: Props) {
  return (
    <header className="masterHeader">
      <div className="masterHeaderLeft">
        <button
          type="button"
          className="masterMenuButton"
          onClick={onMenuClick}
          aria-label="Open master menu"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="masterHeaderCenter">
        <strong>Master Panel</strong>
        <span>HomeQR Management</span>
      </div>

      <div className="masterHeaderRight">
        <button
          type="button"
          className="masterNotificationButton"
          aria-label="Master notifications"
          title="Notifications"
        >
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
}