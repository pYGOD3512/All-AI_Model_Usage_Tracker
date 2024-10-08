import { useEffect, useState, Fragment, SetStateAction } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../store';
import Link from 'next/link';
import Dropdown from '../components/Dropdown';
import { setPageTitle } from '../store/themeConfigSlice';
import dynamic from 'next/dynamic';
import IconArrowLeft from '@/components/Icon/IconArrowLeft';
import IconMenu from '@/components/Icon/IconMenu';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import PerfectScrollbar from 'react-perfect-scrollbar';
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
});

import Swal from 'sweetalert2';
import { Dialog, Transition } from '@headlessui/react';
import CountUp from 'react-countup';


// CANISTER CONNECTION
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../lib/model_tracker_backend.did'; 
import IconBell from '@/components/Icon/IconBell';
import React from 'react';

const canisterId: any = process.env.NEXT_PUBLIC_BACKEND_CANISTER_ID;

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

const Analytics = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Analytics'));
    });
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const [isMounted, setIsMounted] = useState(false);
    const [currentCoin, setCurrentCoin] = useState<any>(null);  // Updated to handle dynamic data
    const [modelUsage, setModelUsage] = useState<any[]>([]);

    const [customHours, setCustomHours] = useState<number>(1);  // Custom input for hours
    const [selectedTimeRange, setSelectedTimeRange] = useState<string | number>('1week'); 
    const [availableHours, setAvailableHours] = useState<number>(0);  // Keep track of available data length
    const [modal11, setModal11] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    });

        // GETTING MODELS AND USAGES ----------- START
        useEffect(() => {
            async function fetchModels() {
                try {
                    const agent = new HttpAgent({ host: "http://127.0.0.1:4943", verifyQuerySignatures: false });
                    await agent.fetchRootKey(); //Disable certificate verification
                    
                    const modelTrackerBackend = Actor.createActor(idlFactory, { agent, canisterId });
                    const modelUsageData: any = await modelTrackerBackend.getModelUsage();

                    // Transform canister response to match chart structure
                    const transformedCoins = modelUsageData.map((model: any, index: number) => ({
                        id: index + 1,
                        title: model.name, 
                        series: [
                            {   
                                name: model.name,
                                data: model.usageRecords.map((record: any) => ({
                                    x: new Date(record.timestamp),  // x-axis is timestamp
                                    y: parseInt(record.requests),   // y-axis is the usage (convert BigInt)
                                })),
                            },
                        ],
                    }));
                    
    
                    setModelUsage(transformedCoins); 
                    if (transformedCoins.length > 0) {
                        setCurrentCoin(transformedCoins[0]);  // Set default to the first model
                        setAvailableHours(transformedCoins[0].series[0].data.length);  // Set the available hours for custom input
                    }

                } catch (error) {
                    coloredToast('danger')
                }
            }
            fetchModels();
        }, [canisterId]);

        const timeOptions = [
            { value: '1day', label: '1 Day Ago' },
            { value: '1week', label: '1 Week Ago' },
            { value: '1month', label: '1 Month Ago' },
            { value: '1year', label: '1 Year Ago' },
        ];

        // Handle time-based filtering
        const getFilteredUsageData = (coin: any) => {
            if (!coin || !coin.series || !coin.series[0]) return { x: '', y: 'No Data' };

            let hoursToSum = 1;

            if (selectedTimeRange === 'custom') {
                hoursToSum = Math.min(customHours, availableHours);  // Limit by available data
            } else if (selectedTimeRange === '1day') {
                hoursToSum = Math.min(24, availableHours);
            } else if (selectedTimeRange === '1week') {
                hoursToSum = Math.min(24 * 7, availableHours);
            } else if (selectedTimeRange === '1month') {
                hoursToSum = Math.min(24 * 30, availableHours);
            } else if (selectedTimeRange === '1year') {
                hoursToSum = Math.min(24 * 365, availableHours);
            }

            const dataPoints = coin.series[0].data.slice(-hoursToSum);
            const totalRequests = dataPoints.reduce((sum: number, point: any) => sum + point.y, 0);

            // return filteredSeriesData;
            return { x: `${hoursToSum} hour(s) ago`, y: totalRequests, dataPoints };
        };
        

        // Determine the button label
        const getButtonLabel = () => {
            if (selectedTimeRange === 'custom') {
                return `${customHours} hr(s) ago`;
            }
            const selectedOption = timeOptions.find(option => option.value === selectedTimeRange);
            return selectedOption ? selectedOption.label : '1 hr(s) ago';
        };

        const currentFilteredData = getFilteredUsageData(currentCoin);

        const getTotalUsage = (item: any) => {
            if (item.series && item.series.length > 0) {
                const totalUsage = item.series[0].data.reduce((sum: number, dataPoint: any) => {
                    return sum + dataPoint.y;
                }, 0);
                return totalUsage;
            }
            return 'No Data';
        };



    const profiteChartOption: any = {
        chart: {
            height: 45,
            width: 120,
            type: 'area',
            sparkline: {
                enabled: true,
            },
        },
        stroke: {
            show: true,
            width: 2,
            curve: 'smooth',
            lineCap: 'square',
        },
        dropShadow: {
            enabled: true,
            opacity: 0.2,
            blur: 10,
            left: -7,
            top: 22,
        },
        markers: {
            size: 0,
        },
        colors: ['#4361ee'],
        grid: {
            padding: {
                top: 0,
                bottom: 0,
                left: 0,
            },
        },
        tooltip: {
            x: {
                show: false,
            },
            y: {
                title: {
                    formatter: (val: any) => {
                        return '';
                    },
                },
            },
        },
        responsive: [
            {
                breakPoint: 576,
                options: {
                    chart: {
                        height: 95,
                    },
                    grid: {
                        padding: {
                            top: 45,
                            bottom: 0,
                            left: 0,
                        },
                    },
                },
            },
        ],
    };

    const selectedBitCoinChart: any = {
        options: {
            chart: {
                height: 411,
                type: 'area',
                fontFamily: 'Nunito, sans-serif',
                zoom: {
                    enabled: true,
                },
                toolbar: {
                    show: true,
                },
            },
            stroke: {
                show: true,
                curve: 'smooth',
                width: 2,
                lineCap: 'square',
            },
            dropShadow: {
                enabled: true,
                opacity: 0.2,
                blur: 10,
                left: -7,
                top: 22,
            },
            markers: {
                size: 0,
            },
            colors: ['#4361ee'],
            grid: {
                borderColor: isDark ? '#191E3A' : '#E0E6ED',
                strokeDashArray: 5,
                xaxis: {
                    lines: {
                        show: true,
                    },
                },
                yaxis: {
                    lines: {
                        show: true,
                    },
                },
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
            },
            tooltip: {
                marker: {
                    show: true,
                },
                x: {
                    format: 'dd MMM yyyy HH:mm',
                },
            },
            xaxis: {
                title: {
                    text: 'Period',
                },
                type: 'datetime', // x-axis is treated as a datetime axis
                labels: {
                    datetimeFormatter: {
                        year: 'yyyy',
                        month: 'MMM \'yy',
                        day: 'dd MMM',
                        hour: 'HH:mm'
                    },
                    style: {
                        fontSize: '12px',
                        cssClass: 'apexcharts-xaxis-title',
                    },
                },
                axisBorder: {
                    show: true,
                },
                axisTicks: {
                    show: true,
                },
                crosshairs: {
                    show: true,
                },
            },
            yaxis: {
                title: {
                    text: 'Usage',
                },
                tickAmount: 7,
                labels: {
                    formatter: (value: number) => {
                        return value;
                    },
                    offsetX: isRtl ? -30 : -10,
                    offsetY: 0,
                    style: {
                        fontSize: '12px',
                        cssClass: 'apexcharts-yaxis-title',
                    },
                },
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
                opposite: isRtl ? true : false,
            },
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                fontSize: '14px',
                markers: {
                    width: 8,
                    height: 8,
                    offsetX: -2,
                },
                itemMargin: {
                    horizontal: 5,
                    vertical: 5,
                },
            },
            responsive: [
                {
                    breakPoint: 576,
                    options: {
                        chart: {
                            height: 95,
                        },
                        grid: {
                            padding: {
                                top: 45,
                                bottom: 0,
                                left: 0,
                            },
                        },
                    },
                },
            ],
        },
    
    };
    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="/" className="text-primary hover:underline">
                        Dashboard
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Analytics</span>
                </li>
            </ul>
            <div className="panel flex items-center overflow-x-auto whitespace-nowrap p-3 mt-2 text-primary">
                <div className="rounded-full bg-primary p-1.5 text-white ring-2 ring-primary/30 ltr:mr-3 rtl:ml-3">
                    <IconBell />
                </div>
                <span className="ltr:mr-1 rtl:ml-3">Click</span>
                <a href="https://alle-ai.com/chat" target="_blank" className="block underline hover:font-bold" rel="noreferrer">
                    here
                </a>
                <span className="ltr:ml-1 rtl:ml-3"> to try Alle-AI</span>
            </div>
            <div className="relative mt-5 flex flex-col gap-5 xl:flex-row">
                <div
                    className={`panel z-10 h-[33rem] w-80 flex-none divide-y divide-[#ebedf2] overflow-y-auto border-0 p-0 dark:divide-[#191e3a] xl:relative xl:block`}
                >
                    <PerfectScrollbar className="panel z-10 w-80 h-[33rem]" options={{suppressScrollX: true}}>

                        {modelUsage.map((item) => {
                            return (
                                <div key={item.id}>
                                    <button
                                        type="button"
                                        className={`${item.id === currentCoin.id ? 'bg-gray-100 dark:bg-[#192A3A]' : ''} flex w-full items-center p-4 hover:bg-gray-100 dark:hover:bg-[#192A3A]`}
                                        onClick={() => {
                                            setCurrentCoin(item);
                                        }}
                                    >
                                        <div className="ltr:pr-4 rtl:pl-4">
                                            <div className="flex items-baseline font-semibold">
                                                <div className="text-md ltr:mr-1 rtl:ml-1">{item.title}</div>
                                            </div>
                                            <div className={`mt-2 flex items-center ${'text-success'}`}>
                                                <div className="min-w-20 text-xl ltr:mr-3 rtl:ml-3">{item.series[0].data[item.series[0].data.length - 1].y}</div>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            {isMounted && <ReactApexChart series={item.series} options={ profiteChartOption } type="line" height={45} width={'90%'} />}
                                        </div>
                                    </button>
                                </div>
                            );
                        })}
                    </PerfectScrollbar>

                </div>
                

                <div className="panel flex-1 p-4">
                    <div className="flex-wrap items-center border-b border-[#ebedf2] p-4 dark:border-[#191e3a] md:flex">
                        <div className="flex flex-1 items-start ltr:pr-4 rtl:pl-4">
                            <div>
                                <div className="flex items-center">
                                    <div className="text-lg font-semibold ltr:mr-1 rtl:ml-1">{currentCoin?.title}</div>
                                    <div className="dropdown">
                                    <Dropdown
                                        placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                        btnClassName="btn btn-outline-dark btn-sm dropdown-toggle"
                                        button={
                                            <>
                                                <span className='text-primary'>{getButtonLabel()}</span>
                                                <span>
                                                    <IconCaretDown className="ltr:ml-1 rtl:mr-1 inline-block" />
                                                </span>
                                            </>
                                        }
                                        onChange={(e: any) => setSelectedTimeRange(e.target.value)}
                                    >
                                        <ul className="!min-w-[130px]">
                                            {timeOptions.map(option => (
                                                <li key={option.value} value={option.value}>
                                                     <button type="button" onClick={() => setSelectedTimeRange(option.value)}>{option.label}</button>
                                                </li>
                                            ))}
                                                <li>
                                                    <button
                                                        type="button"
                                                        onClick={() => {setModal11(true)}}
                                                    >
                                                        Custom
                                                    </button>
                                                </li>
                                        </ul>
                                    </Dropdown>
                                    </div>
                                    {/* <p className="text-xs text-success">[1hr ago]</p> */}
                                </div>
                                <div className={`mt-2 flex items-center ${ 'text-primary' }`}>
                                    {/* <div className="min-w-20 text-2xl ltr:mr-3 rtl:ml-3">{currentCoin ? currentFilteredData.y: ''}</div> */}
                                    <div>
                                        <CountUp start={0} end={currentFilteredData.y} duration={1} className="text-primary text-xl sm:text-3xl text-center"></CountUp>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ul className="mt-5 grid grid-cols-1 text-right divide-[#ebedf2] font-semibold text-white-dark rtl:divide-x-reverse dark:divide-[#253b5c] sm:mt-0 sm:grid-cols-1 sm:divide-x ltr:md:ml-auto rtl:md:mr-auto">
                            <li className="px-4 py-1">
                                Total Usage
                                <span className="mt-1.5 block text-lg text-black dark:text-white-light">{currentCoin ? getTotalUsage(currentCoin): ''}</span>
                            </li>
                        </ul>
                    </div>
                    {/*  selected chart  */}
                    {currentCoin && <ReactApexChart series={[ { name: currentCoin.title, data: currentFilteredData.dataPoints.map((point: any) => ({ x: point.x, y: point.y })), } ]} options={selectedBitCoinChart.options} type="line" height={411} width={'100%'} />}
                </div>
            </div>
            <Transition appear show={modal11} as={Fragment}>
                <Dialog as="div" open={modal11} onClose={() => setModal11(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0" />
                    </Transition.Child>
                    <div id="fadein_left_modal" className="fixed inset-0 bg-[black]/60 z-[999] overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4">
                            <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg my-8 text-black dark:text-white-dark animate__animated animate__fadeInUp">
                                <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                    <h5 className="font-bold text-lg">Custom</h5>
                                </div>
                                <div className="p-5">
                                        <li className='flex justify-center items-center gap-3'>
                                            <input
                                            type="number"
                                            value={customHours}
                                            onChange={(e) => setCustomHours(parseInt(e.target.value))}
                                            className="max-w-[8rem] form-input"
                                            min="1"
                                            />
                                            <span>hr(s)</span>
                                        </li>
                                    <div className="flex justify-end items-center mt-8">
                                        <button onClick={() => {setModal11(false); setSelectedTimeRange('')}} type="button" className="btn btn-outline-danger">
                                            Close
                                        </button>
                                        <button onClick={() => {setModal11(false); setSelectedTimeRange('custom')}} type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default Analytics;
