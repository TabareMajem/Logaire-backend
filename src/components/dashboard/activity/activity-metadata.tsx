import { Card } from '@/components/ui/card';

interface ActivityMetadataProps {
  metadata: Record<string, any>;
}

export function ActivityMetadata({ metadata }: ActivityMetadataProps) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return null;
  }

  return (
    <Card className="p-2 mt-2 text-xs bg-muted/50">
      <dl className="grid grid-cols-2 gap-1">
        {Object.entries(metadata).map(([key, value]) => (
          <div key={key}>
            <dt className="font-medium">{key}:</dt>
            <dd className="text-muted-foreground">{String(value)}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}