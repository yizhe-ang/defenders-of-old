/*jshint esversion: 6 */

/*
Script where all the modules are gathered/imported/loaded
to be initialized.
*/

import { loadData, loadTableData } from './common/index.js';
import getPlayerIDs from './common/player-ids.js';

import BarChart from './charts/stacked-bar-h.js';
import DotStrip from './charts/dot-strip.js';

import {
    filterID,
} from './common/data-munging.js';


(async (enabled) => {
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Time parser
    const parseTime = d3.timeParse('%Y-%m-%d');

    // Load data first #########################################################
    const mainData = await d3.csv('./data/tournament_entries_filtered.csv', d => {
        return {
            'Player ID': d['id'],
            'Tournament Name': d['Tournament Name'],
            'Date': parseTime(d['Date']),
            'Placement': d['Placement'],
            'Start Placement': +d['Start Placement'],
            'Tier': d['Tier'],
            'Earnings': +d['Earnings'],
            'Team': d['Team'],
        };
    });

    // Groupby Player ID, then by Tournament Name
    const groupedData = d3.nest()
        .key(d => d['Player ID'])
        .key(d => d['Tournament Name'])
        .map(mainData);

    const barData = (await loadData('./data/top_earners_barh.csv'));

    const playerIDs = getPlayerIDs();



    // update dimensions of scrolly elements ########################################################
    const container = d3.select('#scroll');
    const graphic = container.select('.scroll__graphic');
    const chart = graphic.select('.graphic');
    const text = container.select('.scroll__text');
    const step = text.selectAll('.step');
    // 1. update height of step elements for breathing room between steps
    const stepHeight = Math.floor(window.innerHeight)*1.2;
    step.style('height', `${stepHeight}px`);

    // 2. Set height of graphic container
    graphic.style('height', `${window.innerHeight}px`);

    // 3. Set width of chart
    // with padding
    chart.style('width', `${window.innerWidth - 80}px`);



    // SCROLLYTELLY SHIZZ ##############################################################
    // initialize the scrollama
    const scroller = scrollama();

    const titles = [
        'Number of Tournaments Participated',
        'Number of Premier Tournaments Participated',
        'Number of Premier Top 4 Placements',
        'Number of Premier Tournament Wins',
    ];

    // #########################################################################################
    // step events object
    const stepEvents = [
        // step 0
        // make all the dots invisible
        {
            down: () => {
                // dotStrip.circles.transition()
                //     .duration(1000)
                //     .attr('fill-opacity', 0);
                dotStrip.strips
                    .transition()
                    .duration(500)
                    .delay((d, i) => i*100)
                    .attr('opacity', 1);
            },
            up: () => {
                dotStrip.circles.transition()
                    .duration(1000)
                    .attr('fill-opacity', 0);

            }
        },
        // step 1
        {
            down: () => {
                // dotStrip.setData(filterID(mainData, playerIDs[0]), playerIDs[0],
                //                  { placement: 100, tier: true, international: false });
                dotStrip.strips
                    .selectAll('circle')
                    .transition()
                    .duration(500)
                    .delay((d, i) => i*15)
                    .attr('fill-opacity', 0.5);
            },
            up: () => {
                // dotStrip.setData(filterID(mainData, playerIDs[0]), playerIDs[0],
                //                  { placement: 100, tier: true, international: false });
                dotStrip.circles
                    .transition()
                    .duration(500)
                    .attr('r', 5)
            }
        },
        // step 2
        {
            down: () => {
                dotStrip.strips
                    .selectAll('circle')
                    .transition()
                    .duration(500)
                    .delay((d, i) => i*15)
                    .attr('r', d => dotStrip.radius(d['Earnings']))
            },
            up: () => {
                // dotStrip.setData(filterID(mainData, playerIDs[0]), playerIDs[0],
                //                  { placement: 100, tier: true, international: false });
            }
        },
        // step 3
        {
            down: () => {

            },
            up: () => {
                dotStrip.setData(filterID(mainData, playerIDs[0]), playerIDs[0],
                                 { placement: 100, tier: false, international: false,
                                   title: titles[0] });
            }
        },
        // step 4
        {
            down: () => {
                dotStrip.setData(filterID(mainData, playerIDs[1]), playerIDs[1],
                                 { placement: 100, tier: true, international: false,
                                   title: titles[1] });
            },
            up: () => {
                // dotStrip.setData(filterID(mainData, playerIDs[1]), playerIDs[1],
                //                  { placement: 100, tier: true, international: false });
            }
        },
        // step 5
        {
            down: () => {
                // dotStrip.setData(filterID(mainData, playerIDs[2]), playerIDs[2],
                //                  { placement: 100, tier: false, international: true });
            },
            up: () => {
                dotStrip.setData(filterID(mainData, playerIDs[1]), playerIDs[1],
                                 { placement: 100, tier: true, international: false,
                                   title: titles[1] });
            }
        },
        // step 6
        {
            down: () => {
                dotStrip.setData(filterID(mainData, playerIDs[2]), playerIDs[2],
                                 { placement: 4, tier: true, international: false,
                                   title: titles[2] });
            },
            up: () => {
                dotStrip.setData(filterID(mainData, playerIDs[2]), playerIDs[2],
                                 { placement: 4, tier: true, international: false,
                                   title: titles[2] });
            }
        },
        // step 7
        {
            down: () => {
                dotStrip.setData(filterID(mainData, playerIDs[3]), playerIDs[3],
                                 { placement: 1, tier: true, international: false,
                                   title: titles[3] });
            },
            up: () => {
                // dotStrip.setData(filterID(mainData, playerIDs[4]), playerIDs[4],
                //                  { placement: 1, tier: true, international: false });
            }
        },
    ];
    // ###########################################################################################

    // scrollama event handlers
    function handleStepEnter(response) {
        /*
        IN:  Response object:
             { element: DOMElement, index: number, direction: string }
        */

        // Update graphic based on step,
        // i.e. use step.attr('data-step')

        stepEvents[response.index][response.direction]();
    }

    // function handleContainerEnter(response) {
    //
    // }
    //
    // function handleContainerExit(response) {
    //
    // }


    // setup the scrollama instance
    // bind scrollama event handlers
    scroller
        .setup({
            container: '#scroll',
            graphic: '.scroll__graphic',
            text: '.scroll__text',
            step: '.scroll__text .step',
            // set the trigger to be 1/2 way down screen
            offset: 0.8,
            // display the trigger offset for testing
            // debug: true,
        })
        .onStepEnter(handleStepEnter);
        // .onContainerEnter(handleContainerEnter)
        // .onContainerExit(handleContainerExit);

    // Initialize Bar Chart ###################################################
    const barChart = new BarChart({
        data: barData,
        mData: groupedData,
        selection: '#graphic-1',
        label: 'Player ID',
    });

    // Initialize Dot Strip ######################################################
    const dotStrip = new DotStrip({
        data: filterID(mainData, playerIDs[0]),
        selection: '#graphic-2',
        xLabel: 'Date',
        yLabel: 'Player ID',
        counts: playerIDs[0],
    });

    // Make all the dots invisible, and de-sized first
    dotStrip.circles.attr('fill-opacity', 0)
        .attr('r', 5);
    // Make all the strips invisible too
    dotStrip.strips.attr('opacity', 0);



    // Cycle through datasets;
    // let counter = 1;
    // const cycleData = () => {
    //     dotStrip.setData(filterID(mainData, playerIDs[counter]), playerIDs[counter]);
    //     counter = (counter + 1)%3;
    // };

    // setInterval(cycleData, 7000);


    // await sleep(5000);
    //
    // dotStrip.setData(filterID(mainData, playerIDs[1]), playerIDs[1],
    //                  100, true, false);
    //
    // await sleep(5000);
    //
    // dotStrip.setData(filterID(mainData, playerIDs[2]), playerIDs[2],
    //                  100, false, true);

// var docWidth = document.documentElement.offsetWidth;
// [].forEach.call(
//   document.querySelectorAll('*'),
//   function(el) {
//     if (el.offsetWidth > docWidth) {
//       console.log(el);
//     }
//   }
// );


})(true);

// Promise.all([loadTableData('./data/test_data.csv')])
//     .then(([data]) => {
//         makeChart(data);
//     });


// function makeChart(data) {
//     const table = new Table({
//         data: data,
//         selection: 'body',
//     });
// }
