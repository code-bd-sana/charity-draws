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
      return <FolderOpen className="w-8 h-8 text-text-brand" />;
    }

    if (React.isValidElement(Icon)) {
      return Icon;
    }

    const IconComponent = Icon as LucideIcon;
    return <IconComponent className="w-8 h-8 text-text-brand" />;
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-divider bg-bg/60 backdrop-blur-xs max-w-lg mx-auto my-6 shadow-sm",
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-accent-bg border border-border flex items-center justify-center mb-4 shadow-sm">
        {renderIcon()}
      </div>

      <h3 className="font-heading font-semibold text-xl md:text-2xl text-text-primary mb-2 tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="font-sans text-xs sm:text-sm text-text-muted max-w-md mb-6 leading-relaxed">
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
