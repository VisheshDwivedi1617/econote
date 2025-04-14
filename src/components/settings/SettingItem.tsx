
import { ReactNode } from "react";
import { Label } from "@/components/ui/label";

interface SettingItemProps {
  label: string;
  description?: string;
  control: ReactNode;
}

const SettingItem = ({ label, description, control }: SettingItemProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')}>{label}</Label>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {control}
    </div>
  );
};

export default SettingItem;
