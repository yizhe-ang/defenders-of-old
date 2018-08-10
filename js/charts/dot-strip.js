/*jshint esversion: 6 */

/*
Dot-strip Plot.
Alt. called a bubble timeline.
y: time
x: categories

TO USE: #######################################################
import Chart from dot-strip.js';

d3.csvParse
[
    // Row 1
    { xLabel: value, yLabel: value, ... },
    // Row 2
    { xLabel: value, yLabel: value, ... },
    ...
];

*/

class Chart {

    constructor(opts) {
        /*
        IN:  Receives an object that at minimum should contain attributes,
            1. Data,
            2. CSS Selector of bounding element,
            3. Height of chart (Optional),
            3. Margins object (Optional)
            4. Specify xLabel,
            5. and yLabel,
            6. Counts object,
        */

        this.data = opts.data;
        this.selection = d3.select(opts.selection);

        this.height = opts.height || 600;

        this.margins = opts.margins || {
            left: 150,
            right: 40,
            top: 20,
            bottom: 20,
        };

        this.xLabel = opts.xLabel;
        this.yLabel = opts.yLabel;

        // Counts object
        this.counts = opts.counts;

        // Filter flags
        this.tier = false;
        this.international = false;
        this.placement = 100;

        // Set default title
        this.titleValue = "Number of Tournaments Participated";
        this.title = this.selection.select('.graphic__sub span');

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
        // Alteratively, set custom height at initialization
        // this.height = boundingDim.height;
        this.innerWidth = this.width - this.margins.left - this.margins.right;
        this.innerHeight = this.height - this.margins.top - this.margins.bottom;
    }

    styleAxes(x, y, horizontal=false) {
        /*
        Styles the axes after they have been rendered.
        (Requires tickSize(-innerDim))

        IN:  Reference to both the x and y axis element.
             Able to indicate if it's a horizontal chart.
             If so, the axes are switched.
        */

        // Switch axes
        if (horizontal) {
            const temp = x;
            x = y;
            y = temp;

            // Add baseline (above main chart elements)
            // this.container.append('line')
            //     .attr('x1', 0)
            //     .attr('x2', 0)
            //     .attr('y1', 0)
            //     .attr('y2', this.innerHeight)
            //     .attr('stroke', 'black');
        } else {
            // this.container.append('line')
            //     .attr('x1', 0)
            //     .attr('x2', this.innerWidth)
            //     .attr('y1', this.innerHeight)
            //     .attr('y2', this.innerHeight)
            //     .attr('stroke', 'black');
        }

        // Remove x axis line
        x.select('.domain')
            .remove();

        // Remove x axis ticks
        x.selectAll('.tick line')
            .remove();

        // Remove y axis line
        y.select('.domain')
            .remove();

        // Style grid lines
        y.selectAll('.tick line')
            .attr('stroke', '#E0E0E0')
            .attr('stroke-width', 2)
            .attr('shape-rendering', 'crispEdges')
            .attr('stroke-dasharray', "6");

        // y.select('.tick line')
        //     .remove();

        // Style fonts
        y.selectAll('.tick text')
            .style('font-family', 'PT Sans')
            // Place tick values further away
            .style('font-size', 14)
            .attr('dy', 15);
        x.selectAll('.tick text')
            .style('font-family', 'PT Sans')
            .style('font-size', 15);
    }

    mungeData() {
        // Group data by yLabel
        return d3.nest()
            .key(d => d[this.yLabel])
            .sortKeys((a,b) => d3.descending(this.counts[a], this.counts[b]))
            .sortValues((a,b) => d3.ascending(a.Date, b.Date))
            .entries(this.data);
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

        const tooltipHeader = this.tooltip.append('div');

        this.tooltipName = tooltipHeader.append('p')
            .style('margin', 0)
            .style('display', 'inline-block')
            .style('font-family', 'Playfair Display')
            .style('font-weight', 700)
            .style('font-size', '15px');

        // this.tooltipHeader = this.tooltip.append('p')
        //     .style('margin', 0)
        //     .style('margin-bottom', '0px')
        //     .style('font-family', 'Playfair Display')
        //     // .text('The International 2017')
        //     .style('font-weight', 700)
        //     .style('font-size', '15px');

        this.tooltipDate = tooltipHeader.append('p')
            .style('margin', 0)
            .style('margin-left', '10px')
            .style('opacity', 0.5)
            // .style('color', 'grey')
            .style('display', 'inline-block')
            .style('font-family', 'Playfair Display')
            .style('font-weight', 700)
            .style('font-size', '15px');

        this.tooltipTeam = this.tooltip.append('p')
            .style('margin', 0);

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

        this.setDimensions();
        this.initTooltip();

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

        // Define scales ##################################################################
        // time scale for x-axis
        this.x = d3.scaleTime()
            .domain([
                d3.min(this.data, d => d[this.xLabel]),
                d3.max(this.data, d => d[this.xLabel])
            ])
            .range([0, this.innerWidth]);


        this.y = d3.scaleBand()
            .domain(d3.range(7))
            .padding(0.4)
            .range([0, this.innerHeight]);

        // color map
        this.color = (placement) => {
            // if (placement > this.placement
            //     || this.tier && tier == 'Premier'
            //     || this.international && name.contains('International')) {
            //
            //     return 'none';
            // }
            if (placement == 1) {
                return '#ffdd3c';
            }
            else if (placement == 2) {
                return '#9a9a9a';
            }
            else if (placement == 3) {
                return '#b1842a';
            }
            else if (placement == 4) {
                return '#f8996b';
            }
            else if (placement <= 8) {
                return '#007f99';
            }
            else {
                return '#166f82';
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

        // circle size scale
        // mapping earnings
        this.radius = d3.scaleLinear()
            // Restrict the upper bound
            .domain([
                // 1,
                d3.min(this.data, d => d['Earnings']),
                // d3.max(this.data, d => d['Earnings'])
                1000000
            ])
            .clamp(true)
            .range([5, 45]);

        // mapping tiers
        // this.radius = d3.scaleOrdinal()
        //     .domain(['Minor', 'Major', 'Premier'])
        //     .range([5, 10, 15])
        //     .unknown(5);

        this.filterDot = (placement, tier, name) => {
            if (placement > this.placement
                || (this.tier && tier!='Premier')
                || (this.international && !name.includes('International'))) {

                return true;
            } else {
                return false;
            }
        };

        this.moneyFormat = d3.format('$,');

        // Define axes #######################################################################
        this.xAxis = d3.axisBottom()
            .tickSize(-this.innerHeight)
            .scale(this.x);

        this.yAxis = d3.axisLeft()
            .scale(this.y);

        this.xAxisElement = this.container.append('g')
            .classed('axis x', true)
            .attr('transform', `translate(0, ${this.innerHeight})`)
            .call(this.xAxis);

        this.yAxisElement = this.container.append('g')
            .classed('axis y', true)
            .attr('opacity', 0)
            .call(this.yAxis);

        this.styleAxes(this.xAxisElement, this.yAxisElement, true);


        // Finally renders the chart
        this.draw();
    }


    // Drawing function to be called whenever the data changes.
    draw() {
        /*
        Starts drawing and rendering the chart using the loaded data.
        With transitions!!!
        */

        const that = this;
        const data = this.mungeData();

        // Update graphic title
        this.title.text(this.titleValue);

        // Render chart elements #########################################################
        // Attach new data first
        const strips = this.container.selectAll('.strip');
        const stripsJoin = strips.data(data, d => d.key);

        // Enter strips
        const newStrips = stripsJoin.enter()
            .append('g')
            .attr('class', 'strip')
            .attr('opacity', 1)
            .attr('pointer-events', 'all')
            // Position at the bottom of the canvas first
            .attr('transform', (d, i) => `translate(0, ${this.height + 50})`);

        // strip label
        newStrips.append('text')
            .text(d => d.key)
            .attr('x', -20)
            .attr('y', 5)
            .attr('font-family', 'PT Sans')
            .attr('font-size', 15)
            .attr('font-weight', 700)
            // .attr('textLength', 50)
            .attr('text-anchor', 'end');

        // strip value
        newStrips.append('text')
            .classed('strip-value', true)
            .text(d => this.counts[d.key])
            .attr('x', this.innerWidth + 40)
            .attr('y', 5)
            .attr('font-family', 'PT Sans')
            .attr('font-size', 15)
            .attr('font-weight', 700)
            .attr('text-anchor', 'end');

        newStrips.append('line')
            .attr('x1', 0)
            .attr('x2', this.innerWidth)
            .attr('y1', 0)
            .attr('y2', 0)
            .attr('stroke', 'black');


        newStrips.selectAll('circle')
            .data(d => d.values)
            .enter()
            .append('circle')
            .attr('cx', d => this.x(d[this.xLabel]))
            .attr('cy', 0)
            .attr('r', d => this.radius(d['Earnings']))
            // .attr('stroke', 'black')
            // .attr('stroke-width', 1)
            // .attr('stroke-opacity', 0)
            .attr('fill', d => this.color(d['Start Placement']))
            .attr('fill-opacity', d => this.filterDot(d['Start Placement'], d['Tier'], d['Tournament Name']) ? 0.05 : 0.5);
            // .attr('opacity', 0.5);

        this.circles = this.container.selectAll('circle');
        this.strips = this.container.selectAll('.strip');

        // update all strip values
        strips.selectAll('.strip-value')
            .text(d => this.counts[d.key]);

        // TOOLTIPS ###########################################################################
        // pointer-catcher container for tooltips
        const bisectDate = d3.bisector(d => d.Date).left;

        newStrips.append('rect')
            .classed('pointer-catcher', true)
            .style('visibility', 'hidden')
            .attr('x', 0)
            .attr('y', -this.y.bandwidth()/2)
            .attr('width', this.innerWidth)
            .attr('height', this.y.bandwidth());

        newStrips.merge(stripsJoin)
            .select('.pointer-catcher')
            .on('mousemove', function(p, q) {
                // reset all dots
                // that.circles
                //     .transition()
                //     .duration(200)
                //     .attr('fill-opacity', 0.5);

                // position relative to pointer-catcher container
                const mouse = d3.mouse(this);
                // calculate corresponding date from x-position
                const date = that.x.invert(mouse[0]);

                // find the closest tournament to that date
                // filter dataset according to criteria first
                const data = p.values.filter(e => !that.filterDot(e['Start Placement'], e['Tier'], e['Tournament Name']));

                const i = bisectDate(data, date);

                const d0 = data[i-1];
                const d1 = data[i];
                let d;
                if (d0 === undefined) {
                    d = d1;
                } else if (d1 === undefined) {
                    d = d0;
                } else {
                    d = date - d0.Date > d1.Date - date ?  d1: d0;
                }

                // find position of tournament
                let x = that.x(d.Date) + that.margins.left;
                let y = that.y(q) - 10;

                // update values
                that.tooltipName
                    .text(d['Tournament Name']);
                that.tooltipValue1
                    .style('background-color',that.colorPlacement(d['Start Placement']))
                    .text(d['Placement']);
                that.tooltipValue2
                    .text(that.moneyFormat(d['Earnings']));
                that.tooltipDate
                    .text(d['Date'].toLocaleDateString('en-US', {month:'numeric', year:'numeric'}));
                that.tooltipTeam
                    .text(d['Team']);

                // different glow for tooltip container according to tier?

                // position tooltip
                const boxWidth = that.tooltip.node().offsetWidth;
                // console.log(boxWidth);
                if (mouse[0] > that.innerWidth/2) {
                    x -= boxWidth;
                }
                that.tooltip
                    .style('left', x+'px')
                    .style('top', y+'px');

                // find graphic dot
                // const dot = d3.select(this.parentNode)
                //     .selectAll('circle')
                //     .filter(c => c['Tournament Name'] == d['Tournament Name'])
                //     .transition()
                //     .duration(200)
                //     .attr('fill-opacity', 1);
                //
                // console.log(dot.data());
            })
            .on('mouseover', function(p) {
                that.tooltip
                    .style('opacity', 1);
            })
            .on('mouseout', function(p) {
                that.tooltip
                    .style('opacity', 0);

            });


        // TRANSITIONS #######################################################################
        // Filter out circles first
        stripsJoin.selectAll('circle')
            .transition()
            .duration(1000)
            // .attr('stroke-opacity', d => this.filterDot(d['Start Placement'], d['Tier'], d['Tournament Name']) ? 0.5 : 0)
            .attr('fill-opacity', d => this.filterDot(d['Start Placement'], d['Tier'], d['Tournament Name']) ? 0.05 : 0.5);

        // Fade out old strips, and filter out dots
        const t0 = () => {
            stripsJoin.exit()
                .transition()
                .duration(1000)
                .attr('opacity', 0)
                .remove()
                .on('end', t1);

        };

        // Reposition all current strips
        const t1 = () => {
            newStrips.merge(stripsJoin)
                .transition()
                .duration(1000)
                // staggered repositionings
                .delay((d, i) => i*200)
                .attr('transform', (d, i) => `translate(0, ${this.y(i) + this.y.bandwidth()/2})`);
        };


        // Transition sequence
        if (stripsJoin.exit().empty()) {
            // If no exiting strips, simply skip to repositioning
            t1();
        } else {
            t0();
        }


        // this.strips = this.container.selectAll('.strip')
        //     .data(data)
        //     .enter()
        //     .append('g')
        //     .attr('class', 'strip')
        //     .attr('transform', d => `translate(0, ${this.y(d.key) + this.y.bandwidth()/2})`);
        //
        // this.strips.append('line')
        //     .attr('x1', 0)
        //     .attr('x2', this.innerWidth)
        //     .attr('y1', 0)
        //     .attr('y2', 0)
        //     .attr('stroke', 'black');
        //
        // this.strips.selectAll('circle')
        //     .data(d => d.values)
        //     .enter()
        //     .append('circle')
        //     .attr('cx', d => this.x(d[this.xLabel]))
        //     .attr('cy', 0)
        //     .attr('r', d => this.radius(d['Earnings']))
        //     // .attr('r', d => this.radius(d['Tier']))
        //     .attr('fill', d => this.color(d['Start Placement']))
        //     .attr('opacity', 0.5);
    }

    // Update the data of the chart and re-render it
    // Main Public method to be called.
    setData(data, counts, opts) {
        /*
        IN:  New dataset, and the new counts object,
             and filter criterias object
        */
            this.data = data;
            this.counts = counts;

            this.placement = opts.placement;
            this.tier = opts.tier;
            this.international = opts.international;
            this.titleValue = opts.title;

            this.draw();
    }
}



export default Chart;
