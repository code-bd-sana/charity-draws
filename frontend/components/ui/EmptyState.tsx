import React from "react";
import Link from "next/link";
import { FolderOpen, LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import PrimaryButton from "../website/shared/PrimaryButton";

interface EmptyStateProps {
  icon?: LucideIcon | React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!Icon) {
      return <FolderOpen className="w-12 h-12 text-primary/60" />;
    }

    if (React.isValidElement(Icon)) {
      return Icon;
    }

    const IconComponent = Icon as LucideIcon;
    return <IconComponent className="w-12 h-12 text-primary/60" />;
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-[#2D3C13]/60 bg-[#161B11]/50 backdrop-blur-xs max-w-lg mx-auto my-6",
        className
      )}
    >
      <div className="w-20 h-20 rounded-full bg-[#202914]/80 border border-[#2D3C13] flex items-center justify-center mb-5 shadow-inner">
        {renderIcon()}
      </div>

      <h3 className="text-xl font-bold font-serif text-[#E8EDD4] mb-2 tracking-wide">
        {title}
      </h3>

      {description && (
        <p className="text-sm font-sans text-[#E8EDD4]/60 max-w-md mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {actionText && (actionHref || onAction) && (
        <div>
          {actionHref ? (
            <PrimaryButton href={actionHref}>{actionText}</PrimaryButton>
          ) : (
            <PrimaryButton onClick={onAction}>{actionText}</PrimaryButton>
          )}
        </div>
      )}
    </div>
  );
}
