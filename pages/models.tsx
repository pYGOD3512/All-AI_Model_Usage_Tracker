import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useState, Fragment, useEffect, useCallback } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '@/store';
import Dropdown from '@/components/Dropdown';
import { setPageTitle } from '@/store/themeConfigSlice';
import IconBell from '@/components/Icon/IconBell';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import Link from 'next/link';

import { Dialog, Transition, Tab } from '@headlessui/react';

import Swal from 'sweetalert2';

// CANISTER CONNECTION
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../lib/model_tracker_backend.did';
import IconX from '@/components/Icon/IconX';
const canisterId: any = process.env.NEXT_PUBLIC_BACKEND_CANISTER_ID;

const rowData = [
    {
        id: 1,
        model_image: '/assets/images/models/gpt-4o.png',
        model_name: 'GPT-4o',
        model_version: '',
        dob: '',
        model_desc: 'Text Generation',
        model_provider: 'OpenAI',
        isActive: true,
        age: '',
        model_link: 'https://openai.com',
    },
];

const coloredToast = (color: any) => {
    const toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: true,
        customClass: {
            popup: `color-${color}`,
        },
    });
    toast.fire({
        title: 'Something went wrong, Try again',
    });
};

const ColumnChooser = () => {
    const [modal18, setModal18] = useState(false);

    // CANISTER INTERACTIONS ====== START
    const [models, setModels] = useState<any[]>([]);
    const [useBackendData, setUseBackendData] = useState(false); // To switch between hardcoded and backend data


    // Wrap fetchModels in useCallback
    const fetchModels = useCallback(async () => {
        try {
            const agent = new HttpAgent({ host: process.env.NEXT_PUBLIC_LOCAL_HOST, verifyQuerySignatures: false });
            await agent.fetchRootKey(); //Disable certificate verification

            const modelTrackerBackend = Actor.createActor(idlFactory, { agent, canisterId });
            const modelsData: any = await modelTrackerBackend.getModels();

            if (modelsData && modelsData.length > 0) {
                // Map backend data to the format expected by the table
                const mappedModels = modelsData.map((model: any, index: number) => ({
                    id: index + 1,
                    model_image: model.image,
                    model_name: model.name,
                    model_version: model.version,
                    dob: 'N/A',
                    model_desc: model.description,
                    model_provider: model.provider,
                    isActive: true,
                    age: 'N/A',
                    model_link: model.link,
                }));

                setModels(mappedModels);
                setUseBackendData(true); // Use backend data if available
            }
        } catch (error) {
            coloredToast('danger');
        }
    }, []);

    useEffect(() => {
        // Initial fetch
        fetchModels();

        // Set up interval to fetch every hour
        const intervalId = setInterval(() => {
            fetchModels();
        }, 60* 60 * 1000); // 60 minutes * 60 seconds * 1000 milliseconds

        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
    }, [fetchModels]);

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('All Models'));
    });
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    // Show/Hide Columns
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });
    const [hideCols, setHideCols] = useState<any>(['age', 'dob']);

    const formatDate = (date: any) => {
        if (date) {
            const dt = new Date(date);
            const month = dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1;
            const day = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
            return day + '/' + month + '/' + dt.getFullYear();
        }
        return '';
    };

    const showHideColumns = (col: any) => {
        if (hideCols.includes(col)) {
            setHideCols(hideCols.filter((d: any) => d !== col));
        } else {
            setHideCols([...hideCols, col]);
        }
    };

    const cols = [
        { accessor: 'id', title: 'ID' },
        { accessor: 'model_image', title: 'Image' },
        { accessor: 'model_name', title: 'Name' },
        // { accessor: 'model_version', title: 'Version' },
        { accessor: 'model_provider', title: 'Provider' },
        { accessor: 'model_link', title: 'Link' },
        { accessor: 'model_desc', title: 'Description' },
        { accessor: 'age', title: 'New Col' },
        { accessor: 'dob', title: 'New Col' },
        { accessor: 'isActive', title: 'Active' },
    ];

    const recordsToShow = useBackendData ? models : rowData; // Switch between backend data and hardcoded data

    const [initialRecords, setInitialRecords] = useState(sortBy(recordsToShow, 'id'));
    const [recordsData, setRecordsData] = useState(initialRecords);

    useEffect(() => {
        setInitialRecords(sortBy(recordsToShow, 'id'));
    }, [useBackendData, recordsToShow]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
        setPage(1);
    }, [sortStatus]);

    // Search functionality
    useEffect(() => {
        const filteredRecords = recordsToShow.filter(
            (record: any) =>
                record.model_name.toLowerCase().includes(search.toLowerCase()) ||
                record.model_version.toLowerCase().includes(search.toLowerCase()) ||
                record.model_provider.toLowerCase().includes(search.toLowerCase())
        );
        setInitialRecords(sortBy(filteredRecords, 'id'));
        setPage(1);
    }, [search, recordsToShow]);

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
            <div className="flex items-center justify-between">
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
            </div>
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
                                            <IconCaretDown className="h-5 w-5" />
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
                                                                onChange={() => showHideColumns(col.accessor)}
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
                                title: 'Logo',
                                sortable: true,
                                render: ({ model_image }) => (
                                    <div className="flex items-center gap-2">
                                        <img onClick={() => setModal18(true)} src={`${model_image}`} className="h-9 w-9 max-w-none rounded-md" alt="model image" />
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
                            // {
                            //     accessor: 'model_version',
                            //     title: 'Version',
                            //     sortable: true,
                            //     hidden: hideCols.includes('model_version'),
                            // },
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
                                title: 'New Col',
                                sortable: true,
                                hidden: hideCols.includes('age'),
                            },
                            {
                                accessor: 'dob',
                                title: 'New Col',
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
            <Transition appear show={modal18} as={Fragment}>
                <Dialog as="div" open={modal18} onClose={() => setModal18(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0" />
                    </Transition.Child>
                    <div id="tabs_modal" className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                        <div className="flex min-h-screen items-center justify-center px-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <h5 className="text-lg font-bold">Model Details</h5>
                                        <button onClick={() => setModal18(false)} type="button" className="text-white-dark hover:text-dark">
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="p-5">
                                        <Tab.Group>
                                            <Tab.List className="mt-3 flex flex-wrap border-b border-white-light dark:border-[#191e3a]">
                                                <Tab as={Fragment}>
                                                    {({ selected }) => (
                                                        <button
                                                            type="button"
                                                            className={`${
                                                                selected ? '!border-white-light !border-b-white  text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black ' : ''
                                                            } -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-primary dark:hover:border-b-black`}
                                                        >
                                                            Overview
                                                        </button>
                                                    )}
                                                </Tab>
                                                <Tab as={Fragment}>
                                                    {({ selected }) => (
                                                        <button
                                                            type="button"
                                                            className={`${
                                                                selected ? '!border-white-light !border-b-white  text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black ' : ''
                                                            }-mb-[1px] block border border-transparent p-3.5 py-2 hover:text-primary dark:hover:border-b-black`}
                                                        >
                                                            Capabilities
                                                        </button>
                                                    )}
                                                </Tab>
                                                <Tab as={Fragment}>
                                                    {({ selected }) => (
                                                        <button
                                                            type="button"
                                                            className={`${
                                                                selected ? '!border-white-light !border-b-white  text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black ' : ''
                                                            }-mb-[1px] block border border-transparent p-3.5 py-2 hover:text-primary dark:hover:border-b-black`}
                                                        >
                                                            Technical Details
                                                        </button>
                                                    )}
                                                </Tab>
                                            </Tab.List>
                                            <Tab.Panels className="text-sm">
                                                <Tab.Panel>
                                                    <div className="active pt-5">
                                                        <h4 className="mb-4 text-2xl font-semibold">Coming soon!</h4>
                                                        <p>This section is under development. Check back later &#128512;.</p>
                                                    </div>
                                                </Tab.Panel>
                                                <Tab.Panel>
                                                    <div>
                                                        <div className="flex items-start pt-5">
                                                            <div className="h-20 w-20 flex-none ltr:mr-4 rtl:ml-4">
                                                                <img
                                                                    src="/assets/images/minions.png"
                                                                    alt="img"
                                                                    className="m-0 h-20 w-20 rounded-full object-cover ring-2 ring-[#ebedf2] dark:ring-white-dark"
                                                                />
                                                            </div>
                                                            <div className="flex-auto">
                                                                <h5 className="mb-4 text-xl font-medium">Coming soon!</h5>
                                                                <p>This section is under development. Check back later &#128512;.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Tab.Panel>
                                                <Tab.Panel>
                                                    <div className="pt-5">
                                                        <p>This section is under development. Check back later &#128512;.</p>
                                                    </div>
                                                </Tab.Panel>
                                            </Tab.Panels>
                                        </Tab.Group>
                                        <div className="mt-8 flex items-center justify-end">
                                            {/* <button onClick={() => setModal18(false)} type="button" className="btn btn-outline-danger">
                                                Close
                                            </button> */}
                                            <button onClick={() => setModal18(false)} type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                Ok
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default ColumnChooser;
