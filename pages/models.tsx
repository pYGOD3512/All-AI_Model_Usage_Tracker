import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '@/store';
import Dropdown from '@/components/Dropdown';
import { setPageTitle } from '@/store/themeConfigSlice';
import IconBell from '@/components/Icon/IconBell';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import Link from 'next/link';

const rowData = [
    {
        id: 1,
        model_image: '/assets/images/models/gpt-4o.png',
        model_name: 'ChatGPT',
        model_version: '4o',
        dob: '2004-05-28',
        model_desc: '240 Vandalia Avenue',
        model_provider: 'OpenAI',
        isActive: true,
        age: 39,
        model_link: 'https://gpt.com',
    },
    {
        id: 2,
        model_image: '/assets/images/models/gemini.png',
        model_name: 'Gemini',
        model_version: '1.0 pro',
        dob: '1989-11-19',
        model_desc: '240 Vandalia Avenue',
        model_provider: 'Google',
        isActive: false,
        age: 32,
        model_link: 'https://gemini.com',
    },
    {
        id: 3,
        model_image: '/assets/images/models/meta.png',
        model_name: 'Llama',
        model_version: '3 70B',
        dob: '2016-09-05',
        model_desc: '240 Vandalia Avenue',
        model_provider: 'Meta',
        isActive: false,
        age: 26,
        model_link: 'https://meta.com',
    },

];

const ColumnChooser = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Column Chooser Table'));
    });
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    // show/hide
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState(sortBy(rowData, 'id'));
    const [recordsData, setRecordsData] = useState(initialRecords);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [hideCols, setHideCols] = useState<any>(['age', 'dob', 'isActive']);

    const formatDate = (date: any) => {
        if (date) {
            const dt = new Date(date);
            const month = dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1;
            const day = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
            return day + '/' + month + '/' + dt.getFullYear();
        }
        return '';
    };

    const showHideColumns = (col: any, value: any) => {
        if (hideCols.includes(col)) {
            setHideCols((col: any) => hideCols.filter((d: any) => d !== col));
        } else {
            setHideCols([...hideCols, col]);
        }
    };

    const cols = [
        { accessor: 'id', title: 'ID' },
        { accessor: 'model_image', title: 'Image' },
        { accessor: 'model_name', title: 'Name' },
        { accessor: 'model_version', title: 'Version' },
        { accessor: 'model_provider', title: 'Provider' },
        { accessor: 'model_link', title: 'Link' },
        { accessor: 'model_desc', title: 'Description' },
        { accessor: 'age', title: 'Age' },
        { accessor: 'dob', title: 'Birthdate' },
        { accessor: 'isActive', title: 'Active' },
    ];

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        setInitialRecords(() => {
            return rowData.filter((item) => {
                return (
                    item.id.toString().includes(search.toLowerCase()) ||
                    item.model_image.toLowerCase().includes(search.toLowerCase()) ||
                    item.model_name.toLowerCase().includes(search.toLowerCase()) ||
                    item.model_link.toLowerCase().includes(search.toLowerCase()) ||
                    item.model_version.toLowerCase().includes(search.toLowerCase()) ||
                    item.age.toString().toLowerCase().includes(search.toLowerCase()) ||
                    item.dob.toLowerCase().includes(search.toLowerCase()) ||
                    item.model_provider.toLowerCase().includes(search.toLowerCase())
                );
            });
        });
    }, [search]);

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
        setPage(1);
    }, [sortStatus]);

    return (
        <div>
            {/* <div className="panel flex items-center overflow-x-auto whitespace-nowrap p-3 text-primary">
                <div className="rounded-full bg-primary p-1.5 text-white ring-2 ring-primary/30 ltr:mr-3 rtl:ml-3">
                    <IconBell />
                </div>
                <span className="ltr:mr-1 rtl:ml-3">Visit</span>
                <a href="https://alle-ai.com" target="_blank" className="block hover:underline" rel="noreferrer">
                    Alle-AI
                </a>
                <span className="ltr:ml-1 rtl:ml-3"> to use these models</span>
            </div> */}
            <ul className="flex space-x-2 rtl:space-x-reverse">
                    <li>
                        <Link href="/" className="text-primary hover:underline">
                            Dashboard
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>All models</span>
                    </li>
                </ul>
            
            <div className="panel mt-6">
                <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                    <h5 className="text-lg font-semibold dark:text-white-light">All Models</h5>
                    <div className="flex items-center gap-5 ltr:ml-auto rtl:mr-auto">
                        <div className="flex flex-col gap-5 md:flex-row md:items-center">
                            <div className="dropdown">
                                <Dropdown
                                    placement={`${isRtl ? 'bottom-end' : 'bottom-start'}`}
                                    btnClassName="!flex items-center border font-semibold border-white-light dark:border-[#253b5c] rounded-md px-4 py-2 text-sm dark:bg-[#1b2e4b] dark:text-white-dark"
                                    button={
                                        <>
                                            <span className="ltr:mr-1 rtl:ml-1">Columns</span>
                                            <IconCaretDown className="w-5 h-5" />
                                        </>
                                    }
                                >
                                    <ul className="!min-w-[150px]">
                                        {cols.map((col, i) => {
                                            return (
                                                <li
                                                    key={i}
                                                    className="flex flex-col"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                >
                                                    <div className="flex items-center px-4 py-1">
                                                        <label className="mb-0 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={!hideCols.includes(col.accessor)}
                                                                className="form-checkbox"
                                                                defaultValue={col.accessor}
                                                                onChange={(event: any) => {
                                                                    setHideCols(event.target.value);
                                                                    showHideColumns(col.accessor, event.target.checked);
                                                                }}
                                                            />
                                                            <span className="ltr:ml-2 rtl:mr-2">{col.title}</span>
                                                        </label>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </Dropdown>
                            </div>
                        </div>
                        <div className="text-right">
                            <input type="text" className="form-input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className="datatables">
                    <DataTable
                        className="table-hover whitespace-nowrap"
                        records={recordsData}
                        columns={[
                            {
                                accessor: 'id',
                                title: 'ID',
                                sortable: true,
                                hidden: hideCols.includes('id'),
                            },
                            {
                                accessor: 'model_image',
                                title: 'Image',
                                sortable: true,
                                render: ({ model_image }) => (
                                    <div className="flex items-center gap-2">
                                        <img src={`${model_image}`} className="h-9 w-9 max-w-none rounded-md" alt="user-profile" />
                                    </div>
                                ),
                                hidden: hideCols.includes('model_image'),
                            },
                            {
                                accessor: 'model_name',
                                title: 'Name',
                                sortable: true,
                                hidden: hideCols.includes('model_name'),
                            },
                            {
                                accessor: 'model_version',
                                title: 'Version',
                                sortable: true,
                                hidden: hideCols.includes('model_version'),
                            },
                            {
                                accessor: 'model_provider',
                                title: 'Provider',
                                sortable: true,
                                hidden: hideCols.includes('model_provider'),
                            },
                            {
                                accessor: 'model_link',
                                title: 'Link',
                                sortable: true,
                                render: ({ model_link }) => (
                                    <a href={`${model_link}`} className="text-primary hover:underline">
                                        {model_link}
                                    </a>
                                ),
                                hidden: hideCols.includes('model_link'),
                            },
                            {
                                accessor: 'model_desc',
                                title: 'Description',
                                sortable: true,
                                hidden: hideCols.includes('model_desc'),
                            },
                            {
                                accessor: 'age',
                                title: 'Age',
                                sortable: true,
                                hidden: hideCols.includes('age'),
                            },
                            {
                                accessor: 'dob',
                                title: 'Birthdate',
                                sortable: true,
                                hidden: hideCols.includes('dob'),
                                render: ({ dob }) => <div>{formatDate(dob)}</div>,
                            },
                            {
                                accessor: 'isActive',
                                title: 'Active',
                                sortable: true,
                                hidden: hideCols.includes('isActive'),
                                render: ({ isActive }) => <div className={`${isActive ? 'text-success' : 'text-danger'} capitalize`}>{isActive.toString()}</div>,
                            },
                        ]}
                        highlightOnHover
                        totalRecords={initialRecords.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} models`}
                    />
                </div>
            </div>
        </div>
    );
};

export default ColumnChooser;
