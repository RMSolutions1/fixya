import { cn } from '@/lib/utils';
import {
  getValueProps,
  VALUE_PROP_GRID_IDS,
  VALUE_PROP_STRIP_IDS,
  type ValuePropItem,
} from '@/lib/value-props';

type ValuePropsVariant = 'strip' | 'grid';

interface ValuePropsProps {
  variant?: ValuePropsVariant;
  ids?: readonly string[];
  className?: string;
}

function StripItem({ icon: Icon, title, description }: ValuePropItem) {
  return (
    <div className="flex gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function GridItem({ icon: Icon, title, description }: ValuePropItem) {
  return (
    <div className="group card-argentina flex gap-4 p-6 hover:shadow-celeste">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function ValueProps({ variant = 'strip', ids, className }: ValuePropsProps) {
  const items = getValueProps(
    ids ?? (variant === 'grid' ? VALUE_PROP_GRID_IDS : VALUE_PROP_STRIP_IDS),
  );

  if (variant === 'grid') {
    return (
      <div className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}>
        {items.map((item) => (
          <GridItem key={item.id} {...item} />
        ))}
      </div>
    );
  }

  return (
    <section className={cn('border-y bg-card py-12', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <StripItem key={item.id} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
