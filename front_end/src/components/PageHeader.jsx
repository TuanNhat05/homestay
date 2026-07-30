const PageHeader = ({ title, description, actions }) => {
  return (
    <div className="mb-6 flex flex-col gap-3 pb-5 sm:flex-row sm:items-end sm:justify-between border-b border-surface-border animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold gradient-text">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm text-ink-dim">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
};

export default PageHeader;
