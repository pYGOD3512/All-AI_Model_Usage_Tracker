import { useEffect, useState } from 'react';
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
const coins = [
    {
        id: 1,
        title: 'GPT-4o',
        value: 170.46,
        highest: '19,891.00',
        series: [
            {
                data: [
                    {
                        x: new Date(1538778600000),
                        y: [6629.81, 6650.5, 6623.04, 6633.33],
                    },
                    {
                        x: new Date(1538780400000),
                        y: [6632.01, 6643.59, 6620, 6630.11],
                    },
                    {
                        x: new Date(1538782200000),
                        y: [6630.71, 6648.95, 6623.34, 6635.65],
                    },
                    {
                        x: new Date(1538784000000),
                        y: [6635.65, 6651, 6629.67, 6638.24],
                    },
                    {
                        x: new Date(1538785800000),
                        y: [6638.24, 6640, 6620, 6624.47],
                    },
                    {
                        x: new Date(1538787600000),
                        y: [6624.53, 6636.03, 6621.68, 6624.31],
                    },
                    {
                        x: new Date(1538789400000),
                        y: [6624.61, 6632.2, 6617, 6626.02],
                    },
                    {
                        x: new Date(1538791200000),
                        y: [6627, 6627.62, 6584.22, 6603.02],
                    },
                    {
                        x: new Date(1538793000000),
                        y: [6605, 6608.03, 6598.95, 6604.01],
                    },
                    {
                        x: new Date(1538794800000),
                        y: [6604.5, 6614.4, 6602.26, 6608.02],
                    },
                    {
                        x: new Date(1538796600000),
                        y: [6608.02, 6610.68, 6601.99, 6608.91],
                    },
                    {
                        x: new Date(1538798400000),
                        y: [6608.91, 6618.99, 6608.01, 6612],
                    },
                    {
                        x: new Date(1538800200000),
                        y: [6612, 6615.13, 6605.09, 6612],
                    },
                    {
                        x: new Date(1538802000000),
                        y: [6612, 6624.12, 6608.43, 6622.95],
                    },
                    {
                        x: new Date(1538803800000),
                        y: [6623.91, 6623.91, 6615, 6615.67],
                    },
                    {
                        x: new Date(1538805600000),
                        y: [6618.69, 6618.74, 6610, 6610.4],
                    },
                    {
                        x: new Date(1538807400000),
                        y: [6611, 6622.78, 6610.4, 6614.9],
                    },
                    {
                        x: new Date(1538809200000),
                        y: [6614.9, 6626.2, 6613.33, 6623.45],
                    },
                    {
                        x: new Date(1538811000000),
                        y: [6623.48, 6627, 6618.38, 6620.35],
                    },
                    {
                        x: new Date(1538812800000),
                        y: [6619.43, 6620.35, 6610.05, 6615.53],
                    },
                    {
                        x: new Date(1538814600000),
                        y: [6615.53, 6617.93, 6610, 6615.19],
                    },
                    {
                        x: new Date(1538816400000),
                        y: [6615.19, 6621.6, 6608.2, 6620],
                    },
                    {
                        x: new Date(1538818200000),
                        y: [6619.54, 6625.17, 6614.15, 6620],
                    },
                    {
                        x: new Date(1538820000000),
                        y: [6620.33, 6634.15, 6617.24, 6624.61],
                    },
                    {
                        x: new Date(1538821800000),
                        y: [6625.95, 6626, 6611.66, 6617.58],
                    },
                ],
            },
        ],
    },
    {
        id: 2,
        title: 'Gemini',
        value: 140.67,
        highest: '18,568.23',
        series: [
            {
                data: [
                    {
                        x: new Date(1538778600000),
                        y: [6624.61, 6632.2, 6617, 6626.02],
                    },
                    {
                        x: new Date(1538780400000),
                        y: [6627, 6627.62, 6584.22, 6603.02],
                    },
                    {
                        x: new Date(1538782200000),
                        y: [6605, 6608.03, 6598.95, 6604.01],
                    },
                    {
                        x: new Date(1538784000000),
                        y: [6635.65, 6651, 6629.67, 6638.24],
                    },
                    {
                        x: new Date(1538785800000),
                        y: [6638.24, 6640, 6620, 6624.47],
                    },
                    {
                        x: new Date(1538787600000),
                        y: [6612, 6615.13, 6605.09, 6612],
                    },
                    {
                        x: new Date(1538789400000),
                        y: [6612, 6624.12, 6608.43, 6622.95],
                    },
                    {
                        x: new Date(1538791200000),
                        y: [6623.91, 6623.91, 6615, 6615.67],
                    },
                    {
                        x: new Date(1538793000000),
                        y: [6618.69, 6618.74, 6610, 6610.4],
                    },
                    {
                        x: new Date(1538794800000),
                        y: [6611, 6622.78, 6610.4, 6614.9],
                    },
                    {
                        x: new Date(1538796600000),
                        y: [6600.55, 6605, 6589.14, 6593.01],
                    },
                    {
                        x: new Date(1538798400000),
                        y: [6593.15, 6605, 6592, 6603.06],
                    },
                    {
                        x: new Date(1538800200000),
                        y: [6603.07, 6604.5, 6599.09, 6603.89],
                    },
                    {
                        x: new Date(1538802000000),
                        y: [6604.44, 6604.44, 6600, 6603.5],
                    },
                    {
                        x: new Date(1538803800000),
                        y: [6603.5, 6603.99, 6597.5, 6603.86],
                    },
                    {
                        x: new Date(1538805600000),
                        y: [6635.65, 6651, 6629.67, 6638.24],
                    },
                    {
                        x: new Date(1538807400000),
                        y: [6638.24, 6640, 6620, 6624.47],
                    },
                    {
                        x: new Date(1538809200000),
                        y: [6612, 6615.13, 6605.09, 6612],
                    },
                    {
                        x: new Date(1538811000000),
                        y: [6612, 6624.12, 6608.43, 6622.95],
                    },
                ],
            },
        ],
    },
    {
        id: 3,
        title: 'Llama 3',
        value: 58.41,
        highest: '19,256.35',
        series: [
            {
                data: [
                    {
                        x: new Date(1538778600000),
                        y: [6623.91, 6623.91, 6615, 6615.67],
                    },
                    {
                        x: new Date(1538780400000),
                        y: [6618.69, 6618.74, 6610, 6610.4],
                    },
                    {
                        x: new Date(1538782200000),
                        y: [6611, 6622.78, 6610.4, 6614.9],
                    },
                    {
                        x: new Date(1538784000000),
                        y: [6614.9, 6626.2, 6613.33, 6623.45],
                    },
                    {
                        x: new Date(1538785800000),
                        y: [6623.48, 6627, 6618.38, 6620.35],
                    },
                    {
                        x: new Date(1538787600000),
                        y: [6619.43, 6620.35, 6610.05, 6615.53],
                    },
                    {
                        x: new Date(1538789400000),
                        y: [6615.53, 6617.93, 6610, 6615.19],
                    },
                    {
                        x: new Date(1538791200000),
                        y: [6615.19, 6621.6, 6608.2, 6620],
                    },
                    {
                        x: new Date(1538793000000),
                        y: [6619.54, 6625.17, 6614.15, 6620],
                    },
                    {
                        x: new Date(1538794800000),
                        y: [6620.33, 6634.15, 6617.24, 6624.61],
                    },
                    {
                        x: new Date(1538796600000),
                        y: [6625.95, 6626, 6611.66, 6617.58],
                    },
                    {
                        x: new Date(1538798400000),
                        y: [6619, 6625.97, 6595.27, 6598.86],
                    },
                ],
            },
        ],
    },
];

const Crypto = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Crypto'));
    });
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    });

    const [currentCoin, setCurrentCoin] = useState(coins[0]);
    const [isShowCryptoMenu, setIsShowCryptoMenu] = useState(false);

    const profiteChartOption: any = {
        chart: {
            height: 45,
            width: 120,
            type: 'line',
            sparkline: {
                enabled: true,
            },
        },
        stroke: {
            width: 2,
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
                type: 'line',
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
            },
            stroke: {
                width: 2,
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
                borderColor: isDark ? '#191e3a' : '#e0e6ed',
            },
            tooltip: {
                x: {
                    show: false,
                },
                y: {
                    title: {
                        formatter: () => {
                            return '';
                        },
                    },
                },
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    format: 'HH:mm',
                },

                axisBorder: {
                    color: isDark ? '#191e3a' : '#e0e6ed',
                },
            },
            yaxis: {
                type: 'currency',
                opposite: isRtl ? true : false,
                labels: {
                    offsetX: isRtl ? -40 : 0,
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
            <div className="relative mt-5 flex flex-col gap-5 xl:flex-row">

                <div
                    className={`panel z-10 h-[33rem] w-80 flex-none divide-y divide-[#ebedf2] overflow-y-auto border-0 p-0 dark:divide-[#191e3a] xl:relative xl:block`}
                >
                    <PerfectScrollbar className="panel z-10 w-80 h-[33rem]" options={{suppressScrollX: true}}>

                        {coins.map((item) => {
                            return (
                                <div key={item.id}>
                                    <button
                                        type="button"
                                        className={`${item.id === currentCoin.id ? 'bg-gray-100 dark:bg-[#192A3A]' : ''} flex w-full items-center p-4 hover:bg-gray-100 dark:hover:bg-[#192A3A]`}
                                        onClick={() => {
                                            setCurrentCoin(item);
                                            setIsShowCryptoMenu(!isShowCryptoMenu);
                                        }}
                                    >
                                        <div className="ltr:pr-4 rtl:pl-4">
                                            <div className="flex items-baseline font-semibold">
                                                <div className="text-md ltr:mr-1 rtl:ml-1">{item.title}</div>
                                            </div>
                                            <div className={`mt-2 flex items-center ${'text-success'}`}>
                                                <div className="min-w-20 text-xl ltr:mr-3 rtl:ml-3">{item.value}</div>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            {isMounted && <ReactApexChart series={item.series} options={ profiteChartOption } type="line" height={45} width={'100%'} />}
                                        </div>
                                    </button>
                                </div>
                            );
                        })}
                    </PerfectScrollbar>

                </div>
                

                <div className="panel flex-1 p-0">
                    <div className="flex-wrap items-center border-b border-[#ebedf2] p-4 dark:border-[#191e3a] md:flex">
                        <div className="flex flex-1 items-start ltr:pr-4 rtl:pl-4">
                            <button onClick={() => setIsShowCryptoMenu(!isShowCryptoMenu)} type="button" className="block hover:text-primary ltr:mr-5 rtl:ml-5 xl:hidden">
                                <IconMenu />
                            </button>
                            <div>
                                <div className="flex items-center">
                                    <div className="text-md font-semibold ltr:mr-1 rtl:ml-1">{currentCoin.title}</div>
                                </div>
                                <div className={`mt-2 flex items-center ${ 'text-success' }`}>
                                    <div className="min-w-20 text-2xl ltr:mr-3 rtl:ml-3">{currentCoin.value}</div>
                                </div>
                            </div>
                        </div>
                        <ul className="mt-5 grid grid-cols-1 divide-[#ebedf2] font-semibold text-white-dark rtl:divide-x-reverse dark:divide-[#253b5c] sm:mt-0 sm:grid-cols-1 sm:divide-x ltr:md:ml-auto rtl:md:mr-auto">
                            <li className="px-4 py-1">
                                Total Usage
                                <span className="mt-1.5 block text-lg text-black dark:text-white-light">{currentCoin.highest}</span>
                            </li>
                        </ul>
                    </div>
                    {/*  selected chart  */}
                    <div className="flex-1 px-4">{isMounted && <ReactApexChart series={currentCoin.series} options={selectedBitCoinChart.options} type="line" height={411} width={'100%'} />}</div>
                </div>
            </div>
        </div>
    );
};

export default Crypto;
