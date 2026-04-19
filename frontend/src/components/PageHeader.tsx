type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
}: PageHeaderProps) {
  return (
    <div className="page-hero">
      <p className="page-hero__eyebrow">{eyebrow}</p>
      <h1 className="page-hero__title">{title}</h1>
      <p className="page-hero__description">{description}</p>
    </div>
  );
}
