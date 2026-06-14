import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface LegalConsentCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  id?: string;
}

export function LegalConsentCheckbox({
  checked,
  onCheckedChange,
  className,
  id = "legal-consent",
}: LegalConsentCheckboxProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        className="mt-0.5"
      />
      <Label
        htmlFor={id}
        className="text-sm text-muted-foreground leading-snug cursor-pointer"
      >
        Я принимаю{" "}
        <Link to="/legal/terms" className="text-primary font-medium hover:underline" target="_blank">
          пользовательское соглашение
        </Link>
        ,{" "}
        <Link to="/legal/privacy" className="text-primary font-medium hover:underline" target="_blank">
          политику конфиденциальности
        </Link>
        {" "}и даю{" "}
        <Link to="/legal/agreement" className="text-primary font-medium hover:underline" target="_blank">
          согласие на обработку персональных данных
        </Link>
        .
      </Label>
    </div>
  );
}
