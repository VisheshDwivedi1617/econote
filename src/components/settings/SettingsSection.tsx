
import { ReactNode } from "react";

interface SettingsSectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}

const SettingsSection = ({ title, icon, children }: SettingsSectionProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-medium mb-4 flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
      </h2>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default SettingsSection;
