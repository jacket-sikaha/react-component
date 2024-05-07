const ListItem = (props: { item: any }) => {
    const { item } = props;
    // const navigate = useNavigate();
    return (
        <div className="border-b py-2">
            <div className="mb-3 flex flex-row">
                <div className="mr-5">
                    <span className="mr-2">ID:</span>
                    <span className="text-indigo-700">{item.id}</span>
                </div>
                <div className="mr-5">
                    <span className="mr-2">标题:</span>
                    <span className="text-indigo-700">{item.title}</span>
                </div>
            </div>
            <div className="mb-2 flex flex-row">
                <span className="mr-2">内容:</span>
                <span className="mr-2 text-indigo-700">{item.body}</span>
            </div>
        </div>
    );
};

export { ListItem };
