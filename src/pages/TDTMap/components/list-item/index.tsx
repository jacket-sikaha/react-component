type ListItemType = {
  name: string;
  address: string;
  onClick?: () => void;
};

const ListItem = (props: ListItemType) => {
  const { name, address, onClick } = props;
  return (
    <div
      onClick={onClick}
      className="mb-4 grid grid-cols-[25px_1fr] items-start p-4 last:mb-0 last:pb-0"
    >
      <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
      <div className="space-y-1">
        {name && <p className="font-medium leading-none">{name}</p>}
        <p className="text-muted-foreground text-sm">{address}</p>
      </div>
    </div>
  );
};

export default ListItem;
