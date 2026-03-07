import { useTheme } from "@/components/theme-provider";
import { Toaster as Sonner, toast } from "sonner";
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      expand={false}
      richColors={false}
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:shadow-elevated group-[.toaster]:rounded-lg group-[.toaster]:py-4 group-[.toaster]:px-5",
          title: "group-[.toast]:font-semibold group-[.toast]:text-foreground",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-medium group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:font-medium group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm",
          closeButton: "group-[.toast]:text-muted-foreground group-[.toast]:hover:text-foreground group-[.toast]:border-border",
          success: "group-[.toaster]:!bg-success/10 group-[.toaster]:!border-success/30 group-[.toaster]:!text-success",
          error: "group-[.toaster]:!bg-destructive/10 group-[.toaster]:!border-destructive/30 group-[.toaster]:!text-destructive",
          warning: "group-[.toaster]:!bg-warning/10 group-[.toaster]:!border-warning/30 group-[.toaster]:!text-warning",
          info: "group-[.toaster]:!bg-info/10 group-[.toaster]:!border-info/30 group-[.toaster]:!text-info",
        },
      }}
      icons={{
        success: <CheckCircle2 className="h-5 w-5 text-success" />,
        error: <XCircle className="h-5 w-5 text-destructive" />,
        warning: <AlertCircle className="h-5 w-5 text-warning" />,
        info: <Info className="h-5 w-5 text-info" />,
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
