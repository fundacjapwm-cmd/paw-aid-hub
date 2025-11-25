import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditableOrgFieldProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  label: string;
  icon: React.ReactNode;
  type?: "text" | "textarea" | "email" | "tel" | "url";
  editable?: boolean;
  isLink?: boolean;
  linkPrefix?: string;
  className?: string;
}

export default function EditableOrgField({
  value,
  onSave,
  label,
  icon,
  type = "text",
  editable = true,
  isLink = false,
  linkPrefix = "",
  className,
}: EditableOrgFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      setEditValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && type !== "textarea") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className={cn("flex items-start gap-3 bg-background/50 rounded-2xl p-4", className)}>
      <div className="h-5 w-5 text-primary flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="text-sm font-medium text-foreground">{label}</div>
          {editable && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="md:hidden p-1 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors"
              aria-label={`Edytuj ${label}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        
        {isEditing ? (
          <div className="flex items-center gap-2">
            {type === "textarea" ? (
              <Textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-sm min-h-[60px]"
                disabled={isSaving}
              />
            ) : (
              <Input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type={type}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-sm h-8"
                disabled={isSaving}
              />
            )}
            <div className="flex gap-1 flex-shrink-0">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            {isLink && value ? (
              <a
                href={`${linkPrefix}${value}`}
                target={type === "url" ? "_blank" : undefined}
                rel={type === "url" ? "noopener noreferrer" : undefined}
                className="hover:text-primary transition-colors break-all"
              >
                {value}
              </a>
            ) : (
              <span className="break-all">{value || "—"}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
