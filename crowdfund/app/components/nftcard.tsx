import type { ReactNode } from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

type NftCardProps = {
  title: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  action?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
};

export default function NftCard({
  title,
  description,
  imageSrc,
  imageAlt = "NFT preview",
  action,
  footer,
  children,
}: NftCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle className="leading-tight">{title}</CardTitle>
          {description && (
            <CardDescription className="mt-1">{description}</CardDescription>
          )}
        </div>
        {/* Action area (pengganti CardAction) */}
        <div className="shrink-0">{action}</div>
      </CardHeader>

      <CardContent>{children}</CardContent>

      {footer && <CardFooter className="justify-between">{footer}</CardFooter>}
    </Card>
  );
}
