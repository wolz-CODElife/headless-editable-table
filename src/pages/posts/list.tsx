import React, { useCallback, useEffect }  from "react";
import './list.css'
import { useDeleteMany } from "@pankod/refine-core";
import { useTable, ColumnDef, flexRender, Row } from "@pankod/refine-react-table";
import { useForm } from "@pankod/refine-react-hook-form";

interface IPost { 
    id: number;
    title: string;
    status: "published" | "draft" | "rejected";
    createdAt: string;
}

export const PostList: React.FC = () => {

    const {
        refineCore: { onFinish, id, setId },
        register,
        handleSubmit,
        control,
    } = useForm<IPost>({
        refineCoreProps: {
            redirect: false,
            action: "edit",
        },
    });

    const columns = React.useMemo<ColumnDef<IPost>[]>(
        () => [
            {
                id: "selection",
                accessorKey: "id",
                enableSorting: false,
                header: function render({ table }) {
                    return (
                        <>
                            <IndeterminateCheckbox
                                {...{
                                    checked: table.getIsAllRowsSelected(),
                                    indeterminate:
                                        table.getIsSomeRowsSelected(),
                                    onChange:
                                        table.getToggleAllRowsSelectedHandler(),
                                }}
                            />{" "}
                            {table.getIsSomeRowsSelected() && (
                                <button
                                    onClick={() =>
                                        deleteSelectedItems(
                                            table
                                                .getSelectedRowModel()
                                                .flatRows.map(
                                                    ({ original }) =>
                                                        original.id,
                                                ),
                                        )
                                    }
                                >
                                    Delete
                                </button>
                            )}
                        </>
                    );
                },
                cell: function render({ row }) {
                    return (
                        <>
                            <IndeterminateCheckbox
                                {...{
                                    checked: row.getIsSelected(),
                                    indeterminate: row.getIsSomeSelected(),
                                    onChange: row.getToggleSelectedHandler(),
                                }}
                            />
                        </>
                    );
                },
            },
            {
                id: "id",
                header: "ID",
                accessorKey: "id",
            },
            {
                id: "title",
                header: "Title",
                accessorKey: "title",
                meta: {
                    filterOperator: "contains",
                },
            },
            {
                id: "status",
                header: "Status",
                accessorKey: "status",
                meta: {
                    filterOperator: "contains",
                },
            },
            {
                id: "createdAt",
                header: "CreatedAt",
                accessorKey: "createdAt",
            },
            {
                id: "actions",
                header: "Actions",
                accessorKey: "id",
                cell: function render({ getValue }) {
                    return (
                        <div>
                            <button
                                type="button"
                                onClick={() => {
                                    handleEditButtonClick(getValue() as number);
                                }}
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    deleteSelectedItems([getValue() as number])
                                }
                            >
                                Delete
                            </button>
                        </div>
                    );
                },
            },
        ],
        [],
    );


    function IndeterminateCheckbox({
        indeterminate,
        ...rest
    }: { indeterminate?: boolean } & React.HTMLProps<HTMLInputElement>) {
        const ref = React.useRef<HTMLInputElement>(null);

        useEffect(() => {
            if (typeof indeterminate === "boolean") {
                if (ref?.current) {
                    ref.current.indeterminate = !rest.checked && indeterminate;
                }
            }
        }, [ref, indeterminate]);

        return (
            <input type="checkbox" ref={ref} style={{ cursor: "pointer" }} {...rest} />
        );
    }

    const {
        getColumn,
        getHeaderGroups,
        getRowModel,
        setPageIndex,
        setPageSize,
        getState,
        getCanPreviousPage,
        getPageCount,
        getCanNextPage,
        nextPage,
        previousPage,
        resetRowSelection,
        refineCore: {
            tableQueryResult: { data: tableData },
        },
    } = useTable<IPost>({
        columns,
        getRowId: (originalRow) => originalRow.id.toString(),
    });



    const { mutate } = useDeleteMany<IPost>();

    const deleteSelectedItems = (ids: number[]) => {
        let confirmation = window.confirm("Confirm deletion!")
        if(confirmation) {
            mutate(
                {
                resource: "posts",
                ids,
            },
            {
                onSuccess: () => {
                    resetRowSelection();
                },
            },
            ) 
        } else return
    };

    const handleEditButtonClick = (editId: number) => {
        setId(editId);
    };

    const renderEditRow = useCallback(
        (row: Row<IPost>) => {
            const { id, title, status } = row.original;
    
            return (
                <>
                    <tr key={`edit-${id}-inputs`}>
                        <td></td>
                        <td><span>{id}</span></td>
                        <td>
                            <input id="title" type="text" defaultValue={title} {...register("title", { required: "Title is required" })} />
                        </td>
                        <td>
                            <select id="status" {...register("status", { required: "Status is required" })} >
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </td>
                        <td></td>
                        <td>
                            <button type="submit">Save</button>
                            <button onClick={() => setId(undefined)}>
                                Cancel
                            </button>
                        </td>
                    </tr>
                </>
            );
        },
        [],
    );

    const titleColumn = getColumn("title");
    const statusColumn = getColumn("status");

    return (
        <>
            <form onSubmit={handleSubmit(onFinish)}>
                <table>
                    <thead>
                        <tr>
                            <td></td>
                            <td></td>
                            <td>
                                <input id="title" type="text" value={(titleColumn.getFilterValue() as string) ?? ""}
                                    onChange={(event) =>
                                        titleColumn.setFilterValue(event.target.value)
                                    }
                                />
                            </td>
                            <td>
                                <input
                                    id="title"
                                    type="text"
                                    value={(statusColumn.getFilterValue() as string) ?? ""}
                                    onChange={(event) =>
                                        statusColumn.setFilterValue(event.target.value)
                                    }
                                />
                            </td>
                            <td></td>
                            <td></td>
                        </tr>
                    </thead>
                    <thead>
                        {getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                    <th key={header.id}>
                                        {header.isPlaceholder ? null : (
                                            <>
                                                <div
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef
                                                            .header,
                                                        header.getContext(),
                                                    )}
                                                    {{
                                                        asc: " 🔼",
                                                        desc: " 🔽",
                                                    }[
                                                        header.column.getIsSorted() as string
                                                    ] ?? null}
                                                </div>
                                            </>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {getRowModel().rows.map((row) => {
                            if (id === (row.original as IPost).id) {
                                return renderEditRow(row);
                            } else
                                return (
                                    <React.Fragment key={row.id}>
                                        <tr>
                                            {row.getAllCells().map((cell) => {
                                                return (
                                                    <td key={cell.id}>
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    </React.Fragment>
                                );
                        })}
                    </tbody>
                </table>
            </form>
            <div className="pagination">
                <button
                    onClick={() => setPageIndex(0)}
                    disabled={!getCanPreviousPage()}
                >
                    {"<<"}
                </button>
                <button
                    onClick={() => previousPage()}
                    disabled={!getCanPreviousPage()}
                >
                    {"<"}
                </button>
                <button onClick={() => nextPage()} disabled={!getCanNextPage()}>
                    {">"}
                </button>
                <button
                    onClick={() => setPageIndex(getPageCount() - 1)}
                    disabled={!getCanNextPage()}
                >
                    {">>"}
                </button>
                <span>
                    Page <strong> {getState().pagination.pageIndex + 1} of{" "} {getPageCount()} </strong>
                </span>
                <span>
                    | Go to page:
                    <input
                        type="number"
                        defaultValue={getState().pagination.pageIndex + 1}
                        onChange={(e) => {
                            const page = e.target.value
                                ? Number(e.target.value) - 1
                                : 0;
                            setPageIndex(page);
                        }}
                    />
                </span>
                <select
                    value={getState().pagination.pageSize}
                    onChange={(e) => {
                        setPageSize(Number(e.target.value));
                    }}
                >
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </div>
        </>
    );
};



