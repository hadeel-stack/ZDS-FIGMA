import { Typography } from 'zds';

interface IPlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: IPlaceholderPageProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
      <Typography
        variant="h5"
        as="h1"
        className="text-[#1d2027]"
        text={title}
        e2eSelector={`placeholder-${title.toLowerCase()}-title`}
      />
      <Typography
        variant="sm"
        className="text-[#5b6270]"
        text={`The ${title} view is coming soon.`}
        e2eSelector={`placeholder-${title.toLowerCase()}-subtitle`}
      />
    </div>
  );
}

export default PlaceholderPage;
