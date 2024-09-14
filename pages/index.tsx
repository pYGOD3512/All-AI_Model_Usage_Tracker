import { useEffect, useState, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../store';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Dropdown from '../components/Dropdown';
import { setPageTitle } from '../store/themeConfigSlice';
import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
});
import Link from 'next/link';
import IconHorizontalDots from '@/components/Icon/IconHorizontalDots';
import IconArrowLeft from '@/components/Icon/IconArrowLeft';

import Swal from 'sweetalert2';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Autoplay } from 'swiper';


// CANISTER CONNECTION
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../lib/model_tracker_backend.did'; 

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

const Index = () => {
    const [models, setModels] = useState<any[]>([]);
    const [modelUsage, setModelUsage] = useState([]);
    const [topModels, setTopModels] = useState<any[]>([]);
    const [pieChartData, setPieChartData] = useState<any>(null);

    const items = [
        {
            src: 'carousel1.jpeg',
            big_text: 'Unleash the Power of AI Synergy',
            small_text: 'Alle-AI brings together the best of multiple AI models, allowing you to harness their combined power for unparalleled results'
        },
        {
            src: 'carousel2.jpeg',
            big_text: 'Fact-Checking and Summarization in One',
            small_text: "Alle-AI's integrated approach to fact-checking and summarization delivers superior results."
        },
        {
            src: 'carousel3.jpeg',
            big_text: 'Ignite Your Imagination',
            small_text: "You can turn your thoughts into stunning visuals with powerful on Alle-AI"
        },
    ];
    
    // GETTING MODELS AND USAGES ----------- START
    useEffect(() => {
        async function fetchModels() {
            try {
                const agent = new HttpAgent({ host: "http://127.0.0.1:4943" });
                await agent.fetchRootKey(); //Disable certificate verification
                
                const modelTrackerBackend = Actor.createActor(idlFactory, { agent, canisterId });
                const modelsData: any = await modelTrackerBackend.getModels();
                const modelUsageData: any = await modelTrackerBackend.getModelUsage();

                console.log("Models: ", modelsData);
                console.log("Model Usage: ", modelUsageData);

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
                        model_uid: model.model_uid,
                    }));

                    setModels(mappedModels);

                    // Process and find top 10 models by usage in the last 5 hours
                    const topModelsData = getTopModelsByUsage(modelUsageData, mappedModels);
                    setTopModels(topModelsData);
                }

                setModelUsage(modelUsageData); 

            } catch (error) {
                coloredToast('danger')
            }
        }

        fetchModels();
    }, []);

    console.log(topModels,'top models')

    // GETTING MODEL AND USAGES ----------- END

    // Helper function to get the sum of the last 5 hours of usage for each model
    const getTopModelsByUsage = (usageData: any, modelsData: any) => {
        // Map usage data and calculate the last 5 hours usage
        const modelsUsageMap = usageData.map((modelUsage: any) => {
        // Get last 5 hours of usage and sum the requests
        const lastFiveUsage = modelUsage.usageRecords
            .slice(-5) // Take only the last 5 records
            .reduce((sum: number, record: any) => sum + Number(record.requests), 0); // Sum of requests for the last 5 hours

        // Find the corresponding model info using the model_uid
        const matchedModel = modelsData.find((model: any) => model.model_uid === modelUsage.model_uid);

        if (!matchedModel) {
            return null; // If no match, skip
        }

        return {
            model_uid: modelUsage.model_uid,
            lastFiveUsage, // Sum of last 5 hours usage
            model_name: matchedModel.model_name,
            model_provider: matchedModel.model_provider,
            model_image: matchedModel.model_image,
            model_version: matchedModel.model_version,
        };
        });

        // Filter out any null entries (if some model UIDs weren't found in modelData)
        const validModels = modelsUsageMap.filter((model: any) => model !== null);

        // Sort the models by last 5-hour usage, descending order
        const sortedModels = validModels.sort((a: any, b: any) => b.lastFiveUsage - a.lastFiveUsage);

        // Return only the top 10 models
        return sortedModels.slice(0, 10);
    };

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Model Usage Tracker'));
    });
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    });

    // LINE CHART FUNCTIONS --------- START
    const getAllTimestamps = (modelData: any[]) => {   //  Function to get timestamps from all models
        const timestampsSet = new Set<string>();
    
        modelData.forEach((model: any) => {
        model.usageRecords.forEach((record: any) => {
            timestampsSet.add(record.timestamp);
        });
        });
    
        return Array.from(timestampsSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());  // Sort array of timestamps
    };
    
    // Transform usage data to chart series format (use null for missing values)
    const transformDataWithNulls = (modelData: any[], allTimestamps: string[]) => {
        return modelData.map((model: any) => {
        const data = allTimestamps.map((timestamp) => {
            // Check if the model has a record for the current time
            const record = model.usageRecords.find((r: any) => r.timestamp === timestamp);
            
            // If record exists, return its data, otherwise return null for missing timestamps
            return {
            x: new Date(timestamp).getTime(), // Ensure the timestamp is in correct format for the x-axis (datetime)
            y: record ? Number(record.requests) : null,
            };
        });
    
        return {
            name: model.name,
            data,
        };
        });
    };
    
    const allTimestamps = getAllTimestamps(modelUsage);   //  Get timestamps from all models
    
    const transformedSeries = transformDataWithNulls(modelUsage, allTimestamps);   // Transform the data to include nulls for missing data

    const colorPalette = isDark
    ? ['#2196F3', '#E7515A', '#FF9800', '#4CAF50', '#FFC107', '#9C27B0', '#00BCD4', '#FF5722', '#673AB7', '#3F51B5']
    : ['#1B55E2', '#E7515A', '#FF9800', '#4CAF50', '#FFC107', '#9C27B0', '#00BCD4', '#FF5722', '#673AB7', '#3F51B5'];

    const getColorForLine = (index: number) => colorPalette[index % colorPalette.length];

    
    // Line Chart Configuration
    const revenueChart: any = {
        series: transformedSeries,
        options: {
            chart: {
                height: 325,
                type: 'area',
                fontFamily: 'Nunito, sans-serif',
                zoom: {
                    enabled: true,
                },
                toolbar: {
                    show: true,
                },
            },
            dataLabels: {
                enabled: false,
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
            colors: transformedSeries.map((_, index) => getColorForLine(index)),
            markers: {
                size: 0,
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
            tooltip: {
                marker: {
                    show: true,
                },
                x: {
                    format: 'dd MMM yyyy HH:mm',
                },
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    inverseColors: !1,
                    opacityFrom: isDark ? 0.19 : 0.28,
                    opacityTo: 0.05,
                    stops: isDark ? [100, 100] : [45, 100],
                },
            },
        },
    };
    // LINE CHART FUNCTIONS --------- END

    // PIE CHART FUNCTIONS --------- START
    
    const getChartData = (usageData: any) => {   // Transform the fetched model usage data to the chart format
        const pie_series: number[] = [];
        const pie_lables: string[] = [];

        // Iterate through each model's usage data
        usageData.forEach((model: any) => {
        // Sum up all requests for the model
        const totalRequests = model.usageRecords
        ? model.usageRecords.reduce(
            (acc: number, record: any) => acc + Number(record.requests),
            0
        )
        : 0;  // If there are no usageRecords, set totalRequests to 0

        // Add the summed data to the series array
        pie_series.push(totalRequests);

        // Add the model name to the labels array
        pie_lables.push(model.name);
        });


        // Return chart data in the expected format
        return {
        pie_series,
        pie_lables,
        };
    };

    // Now, use getChartData to dynamically update the salesByCategory
    const { pie_series, pie_lables } = getChartData(modelUsage);

    //Pie Chart Configuration
    const salesByCategory: any = {
        series: pie_series,
        options: {
            chart: {
                type: 'donut',
                height: 460,
                fontFamily: 'Nunito, sans-serif',
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                width: 25,
                colors: isDark ? '#0e1726' : '#fff',
            },
            colors: transformedSeries.map((_, index) => getColorForLine(index)),
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                fontSize: '14px',
                markers: {
                    width: 10,
                    height: 10,
                    offsetX: -2,
                },
                height: 50,
                offsetY: 20,
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                        background: 'transparent',
                        labels: {
                            show: true,
                            name: {
                                show: true,
                                fontSize: '29px',
                                offsetY: -10,
                            },
                            value: {
                                show: true,
                                fontSize: '26px',
                                color: isDark ? '#bfc9d4' : undefined,
                                offsetY: 16,
                                formatter: (val: any) => {
                                    return val;
                                },
                            },
                            total: {
                                show: true,
                                label: 'Total',
                                color: '#888ea8',
                                fontSize: '29px',
                                formatter: (w: any) => {
                                    return w.globals.seriesTotals.reduce(function (a: any, b: any) {
                                        return a + b;
                                    }, 0);
                                },
                            },
                        },
                    },
                },
            },
            labels: pie_lables,
            states: {
                hover: {
                    filter: {
                        type: 'none',
                        value: 0.15,
                    },
                },
                active: {
                    filter: {
                        type: 'none',
                        value: 0.15,
                    },
                },
            },
        },
    };
    // PIE CHART FUNCTIONS --------- END

    return (
        <>
            <div>
                <ul className="flex space-x-2 rtl:space-x-reverse">
                    <li>
                        <Link href="/" className="text-primary hover:underline">
                            Dashboard
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>Overview</span>
                    </li>
                </ul>

                <div className="pt-5">
                    <div className="mb-6 grid gap-6 xl:grid-cols-3">
                        <div className="panel h-full xl:col-span-2">
                            <div className="mb-5 flex items-center justify-between dark:text-white-light">
                                <h5 className="text-lg font-semibold">Model Usage</h5>
                                <div className="dropdown">
                                    <Dropdown
                                        offset={[0, 1]}
                                        placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                        button={<IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary" />}
                                    >
                                        <ul>
                                            <li>
                                                <button type="button">Weekly</button>
                                            </li>
                                            <li>
                                                <button type="button">Monthly</button>
                                            </li>
                                            <li>
                                                <button type="button">Yearly</button>
                                            </li>
                                        </ul>
                                    </Dropdown>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="rounded-lg bg-white dark:bg-black">
                                    {isMounted ? (
                                        <ReactApexChart series={revenueChart.series} options={revenueChart.options} type="area" height={325} width={'100%'} />
                                    ) : (
                                        <div className="grid min-h-[325px] place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                                            <span className="inline-flex h-5 w-5 animate-spin rounded-full  border-2 border-black !border-l-transparent dark:border-white"></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="panel h-full">
                            <div className="mb-5 flex items-center">
                                <h5 className="text-lg font-semibold dark:text-white-light">Total Usage</h5>
                            </div>
                            
                            <div>
                                <div className="rounded-lg bg-white dark:bg-black">
                                    {isMounted ? (
                                        <ReactApexChart series={salesByCategory.series} options={salesByCategory.options} type="donut" height={460} width={'100%'} />
                                    ) : (
                                        <div className="grid min-h-[325px] place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                                            <span className="inline-flex h-5 w-5 animate-spin rounded-full  border-2 border-black !border-l-transparent dark:border-white"></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        <div className="panel pb-1 h-full sm:col-span-2 xl:col-span-1">
                            <div className="mb-5 flex items-center justify-between dark:text-white-light">
                                <h5 className="text-lg font-semibold">Top used models</h5>
                            </div>
                            <PerfectScrollbar className="relative mb-4 h-[230px] ltr:-mr-3 ltr:pr-3 rtl:-ml-3 rtl:pl-3" options={{suppressScrollX: true}}>
                                <div>
                                    <div className="space-y-6">
                                        {/* Dynamically render the top models */}
                                        {topModels.map((model, index) => (
                                            <div key={index} className="flex">
                                            {/* Model Image */}
                                            <img
                                                className="h-8 w-8 rounded-md object-cover ltr:mr-3 rtl:ml-3"
                                                src={`${model.model_image}`}
                                                alt={`${model.model_name}`}
                                            />
                                            <div className="flex-1 px-3">
                                                {/* Model Name */}
                                                <div>{model.model_name} {model.model_version}</div>
                                                {/* Model Provider */}
                                                <div className="text-xs text-white-dark dark:text-gray-500">{model.model_provider}</div>
                                            </div>
                                            {/* Last 5-hour Usage */}
                                            <span className="whitespace-pre px-1 text-base text-success ltr:ml-auto rtl:mr-auto">
                                                {model.lastFiveUsage.toLocaleString()} {/* Format usage with commas */}
                                            </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </PerfectScrollbar>
                            <div className="border-t border-white-light dark:border-white/10">
                                <button type="button" className="group group flex w-full items-center justify-center p-1 font-semibold hover:text-primary">
                                    <Link href="/analytics">View All Models</Link>
                                    <IconArrowLeft className="rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition duration-300 ltr:ml-1 rtl:mr-1" />
                                </button>
                            </div>
                        </div>

                        <div className="panel h-full lg:col-span-2">
                            <Swiper modules={[Pagination, Autoplay]} pagination={{ clickable: true }} autoplay={{ delay: 5000 }} direction="vertical" className="mx-auto max-w-full" id="slider3">
                                <div className="swiper-wrapper">
                                {items.map((item, i) => {
                                    return (
                                        <SwiperSlide key={i}>
                                            <img src={`/assets/images/${item.src}`} className="w-full max-h-80 object-cover" alt="itemImage" />
                                                <div className="absolute z-[999] text-white top-1/4 ltr:left-12 rtl:right-12">
                                                    <div className="sm:text-3xl text-base font-bold">{item.big_text}</div>
                                                    <div className="sm:mt-5 mt-1 w-4/5 text-base sm:block hidden font-medium">
                                                    {item.small_text}
                                                    </div>
                                                    <Link href="https://alle-ai.com/chat" target='_blank'>
                                                        <button type="button" className="mt-4 btn btn-primary">
                                                            Try now
                                                        </button>
                                                    </Link>
                                                </div>
                                        </SwiperSlide>
                                        
                                    );
                                })}
                                </div>
                            </Swiper>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Index;
