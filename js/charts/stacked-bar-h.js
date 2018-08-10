/*jshint esversion: 6 */

/*
Horizontal Stacked Bar Chart,
with tooltips.

TO USE: #######################################################
import chart from 'stacked-bar-h.js';

DATA: ############################################################
d3.csvParse
[
    // Row 1
    { label1: value, bar1: value, bar2: value ... },
    // Row 2
    { label2: value, bar1: value, bar2: value ... },
    ...
];

*/


class Chart {

    constructor(opts) {
        /*
        IN:  Receives an object that at minimum should contain attributes,
            1. Data,
            2. Master Dataset (grouped by Player ID, and tournament),
            2. CSS Selector of bounding element,
            3. Height of chart (Optional).
            3. Margins object (Optional).
            4. Specify how to access the y-axis labels in the dataset
        */

        this.data = opts.data;
        this.mData = opts.mData;
        // Stores a reference to the bounding element
        this.selection = d3.select(opts.selection);

        this.height = opts.height || 500;

        this.margins = opts.margins || {
            left: 150,
            right: 0,
            top: 20,
            bottom: 20,
        };

        this.label = opts.label;

        this.transitionSpeed = opts.transitionSpeed || 300;

        // Initialize the Chart
        this.init();
    }


    // CONVENIENCE FUNCTIONS ########################################################################

    setDimensions() {
        /*
        Sets/updates the dimensions of the chart.
        */

        // Initialize chart dimensions in accordance to its bounding object
        const boundingDim = this.selection.node().getBoundingClientRect();
        this.width = boundingDim.width;
        this.innerWidth = this.width - this.margins.left - this.margins.right;
        this.innerHeight = this.height - this.margins.top - this.margins.bottom;
    }


    mungeData() {
        /*
        Uses the stack layout to format the data for chart rendering.

        OUT: Returns formatted data,
             with the resulting array having one element per series.
        */

        // Get the keys, i.e. labels for the stacked bars
        this.keys = this.data.columns.filter(e => e !== this.label);

        // Define the stack layout
        const stack = d3.stack()
            // explicitly set the order
            // .order(['The International 2017',
            //         'The International 2016',
            //         'The International 2015',
            //         'Dota 2 Asia Championships 2015',
            //         'The Frankfurt Major 2015',
            //         'The Manila Major 2016',
            //         'China Dota2 Supermajor',
            //         'The International 2013',
            //         'EPICENTER 2017',
            //         'ESL One Manila 2016',
            //         'Others'])
            // .order(d3.stackOrderDescending)
            .keys(this.keys);
            // .offset()

        // Produce the stacked data
        return stack(this.data);


    }

    styleAxes() {
        /*
        Styles the axes after they have been rendered.
        */

        // Remove y axis line
        this.yAxisElement.select('.domain')
            .remove();

        // Remove y axis ticks
        this.yAxisElement.selectAll('.tick line')
            .remove();

        // Remove x axis line
        this.xAxisElement.select('.domain')
            .remove();

        // Style grid lines
        this.xAxisElement.selectAll('.tick line')
            .attr('stroke-width', 2)
            .attr('stroke', '#E0E0E0')
            .attr('shape-rendering', 'crispEdges')
            .attr('stroke-dasharray', '6px');

        // Add baseline (above main chart elements)
        this.xAxisElement.select('.tick line')
            .remove();
        this.container.append('line')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', this.innerHeight)
            .attr('stroke', 'black');

        // Style fonts
        this.xAxisElement.selectAll('.tick text')
            .style('font-family', 'PT Sans')
            .style('font-size', '14px')
            // Place tick values further away
            .attr('dy', 15);
        this.yAxisElement.selectAll('.tick text')
            .style('font-family', 'PT Sans')
            .style('font-weight', 700)
            .style('font-size', 15);

    }

    initTooltip() {
        /*
        Initializes tooltip elements and stores their references,
        after reference to bounding element has been stored, i.e. this.selection
        this.tooltip,
        this.tooltipHeader,
        this.tooltipValue
        */
        this.tooltip = this.selection.append('div')
            .style('position', 'absolute')
            // .style('top', 0)
            // .style('left', 0)
            .classed('tooltip', true)
            .style('width', 'auto')
            .style('height', 'auto')
            .style('padding', '10px 20px')
            .style('font-family', 'PT Sans')
            .style('background', 'white')
            // .style('border-radius', '8px')
            .style('border', '2px solid grey')
            .style('opacity', 0)
            .style('box-shadow', '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)')
            .style('pointer-events', 'none');

        this.tooltipHeader = this.tooltip.append('p')
            .style('margin', 0)
            .style('margin-bottom', '0px')
            .style('font-family', 'Playfair Display')
            // .text('The International 2017')
            .style('font-weight', 700)
            .style('font-size', '15px');

        this.tooltipValue1 = this.tooltip.append('p')
            // .style('font-family', 'Playfair Display')
            // .text('1st')
            .style('display', 'inline-block')
            .style('margin', 0)
            .style('padding', '0 5px')
            .style('border-radius', '2px')
            // .style('width', '100px')
            // .style('margin', '0 auto')
            // .style('font-weight', 700)
            .style('font-size', '24px');

        this.tooltipValue2 = this.tooltip.append('p')
            .style('margin-left', '10px')
            .style('display', 'inline')
            .style('font-weight', 700)
            // .text('2172536')
            .style('font-size', '24px');
    }

    getTourneyEntry(player, tourney) {
        /*
        IN:  Takes in the Player and Tournament Name.
        OUT: Returns the entry from the Main Dataset as an Object.
        */
        return this.mData['$'+player]['$'+tourney][0];
    }

    getTourneyPlacement(player, tourney) {
        return this.getTourneyEntry(player, tourney)['Placement'];
    }

    getTourneyStart(player, tourney) {
        return this.getTourneyEntry(player, tourney)['Start Placement'];
    }


    // MAIN FUNCTIONS #############################################################################

    // Main initialization function to be called once
    init() {
        /*
        Initializes the chart, dimensions, and any other attributes / chart elements,
        that do not depend upon the data (except for scales and axes).

        Attaches the SVG element to the HTML.
        Creates a reference to the chart container element.
        Draws the chart.
        */

        const that = this;
        const stackedData = this.mungeData();
        this.labels = this.data.map(d => d[this.label]);

        this.setDimensions();


        // Creates a reference to the svg element
        this.svg = this.selection
                     .append('svg')
                     .attr('class', 'chart')
                     .attr('width', this.width)
                     .attr('height', this.height);

        // Creates a reference to the chart itself, enclosed in a g element.
        this.container = this.svg.append('g')
                        .attr('class', 'container')
                        .attr('transform', `translate(${this.margins.left}, ${this.margins.top})`);

        // Formats #####################################################################
        const moneyFormat = d3.format('$,');
        const siFormat = d3.format('.2s');

        // Initialize scales ###########################################################
        this.x = d3.scaleLinear()
            .domain([
                d3.min(stackedData, d => d3.min(d, e => e[0])),
                d3.max(stackedData, d => d3.max(d, e => e[1]))
            ])
            .range([0, this.innerWidth]);

        this.y = d3.scaleBand()
            // Get label values
            .domain(this.labels)
            .range([0, this.innerHeight])
            .padding(0.4);

        // Color scale for the different stacked bars
        // this.colorScale = d3.scaleOrdinal(d3.schemeBlues[9])
        //     .domain(['China Dota2 Supermajor',
        //             'The International 2015',
        //             'The International 2016',
        //             'Dota 2 Asia Championships 2015',
        //             'The Manila Major 2016',
        //             'The Frankfurt Major 2015',
        //             'The International 2013',
        //             'EPICENTER 2017',
        //             'ESL One Manila 2016']);
        this.color = (player, tourney) => {
            /*
            IN:  Takes in the player and tourney name.
            */
            if (tourney == 'Others') {
                return '#bfe6ef';
            }
            else if (tourney.includes('International')
                     && this.getTourneyEntry(player, tourney)['Start Placement']==1) {
                return '#eebd6b';
            }
            else {
                // return this.colorScale(tourney);
                return '#447695';
            }
        };

        this.colorPlacement = (placement) => {
            // if (placement > this.placement
            //     || this.tier && tier == 'Premier'
            //     || this.international && name.contains('International')) {
            //
            //     return 'none';
            // }
            if (placement == 1) {
                return 'rgba(255, 221, 60, 0.5)';
            }
            else if (placement == 2) {
                return 'rgba(154, 154, 154, 0.5)';
            }
            else if (placement == 3) {
                return 'rgba(177, 132, 42, 0.5)';
            }
            else if (placement == 4) {
                return 'rgba(248, 153, 107, 0.5)';
            }
            else if (placement <= 8) {
                return 'rgba(0, 127, 153, 0.5)';
            }
            else {
                return 'rgba(22, 111, 130, 0.5)';
            }
        };



        // Initialize axes #################################################################
        this.xAxis = d3.axisBottom()
            // Grid lines
            .tickSize(-this.innerHeight)
            .tickFormat(siFormat)
            .scale(this.x);

        this.yAxis = d3.axisLeft()
            .scale(this.y);
            // Get label values
            // .tickValues(this.data.map(d => d[this.label]));


        // Render axes
        this.xAxisElement = this.container.append('g')
            .classed('axis x', true)
            .attr('transform', `translate(0, ${this.innerHeight})`)
            .call(this.xAxis);

        this.yAxisElement = this.container.append('g')
            .classed('axis y', true)
            .call(this.yAxis);


        // Initialize tooltips
        this.initTooltip();



        // Render chart elements #############################################################
        this.container.selectAll('.bar')
            .data(stackedData)
            .enter()
            .append('g')
            .attr('class', 'bar')
            .each(function(d) {
                const tourney = d.key;

                // Filter out empty data
                const d1 = d.filter(p => {
                    return p.data[tourney] != 0;
                });

                const bars = d3.select(this).selectAll('rect')
                    .data(d1)
                    .enter()
                    .append('rect');

                bars.attr('x', p => that.x(p[0]))
                    .attr('y', p => that.y(p.data[that.label]))
                    .attr('width', p => that.x(p[1]) - that.x(p[0]))
                    .attr('height', that.y.bandwidth())
                    .style('fill', (p, q) => {
                        // d.key -> Tournament Name
                        // p.data['Player ID']
                        const player = p.data['Player ID'];
                        return that.color(player, tourney);
                    })
                    // TOOLTIPZZZZ
                    .on('mouseover', function(p) {
                        const mouse = d3.mouse(that.selection.node());

                        that.tooltip
                            .style('opacity', 1.0);
                        // Update position
                        that.tooltip
                            .style('left', `${mouse[0]}px`)
                            .style('top', `${mouse[1]}px`);
                        // Update values
                        that.tooltipHeader
                            .text(d.key);
                        that.tooltipValue1
                            .style('background-color', d => {
                                if (tourney == 'Others') return 'none';
                                else return that.colorPlacement(that.getTourneyStart(p.data['Player ID'], tourney));
                            })
                            .text(() => {
                                if (tourney == 'Others') return '';
                                else return that.getTourneyPlacement(p.data['Player ID'], tourney);
                            });
                        that.tooltipValue2
                            .text(moneyFormat(p.data[d.key]));
                    })
                    .on('mousemove', function(p) {
                        const mouse = d3.mouse(that.selection.node());
                        // Update position
                        that.tooltip
                            .style('left', `${mouse[0]}px`)
                            .style('top', `${mouse[1]}px`);
                    })
                    .on('mouseout', function(p) {
                        that.tooltip
                            .style('opacity', 0);
                    });

                // Draw separator line for each bar
                d3.select(this).selectAll('line')
                    .data(d1)
                    .enter()
                    .append('line')
                    .attr('x1', p => that.x(p[0])+0.5)
                    .attr('x2', p => that.x(p[0])+0.5)
                    .attr('y1', p => that.y(p.data[that.label]))
                    .attr('y2', p => {
                        return that.y(p.data[that.label]) + that.y.bandwidth();
                    })
                    // .attr('shape-rendering', 'crispEdges')
                    .attr('stroke-width', 1.5)
                    .attr('stroke', 'white');

            });


        // Render Aegis
        const aegisSeq = [7,7,7,7,5,5,5,7,5,6];
        this.svg.selectAll('image')
            .data(aegisSeq)
            .enter()
            .append('image')
            .attr('xlink:href', d => `./img/ti${d}_icon.png`)
            .attr('x', 0)
            .attr('y', (d, i) => {
                return this.y(this.labels[i]) + 20;
            })
            .attr('dy', 50)
            .attr('height', 25)
            .attr('width', 25);

        // Style Axes
        this.styleAxes();


    }


}



export default Chart;
