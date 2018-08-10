/*jshint esversion: 6 */

/*
Contains General/Helper Functions that is to be used
throughout the entire project.


TO USE: ###########################################################
import chartFactory, {
    other,
    functions,
    ...
} from '../common/index.js';
*/


export async function loadData(uri) {
/*
Data loading function that differentiates between a CSV or JSON file.

IN:  Path of the data file.
OUT: Returns the parsed data,
     an array of object rows,
     with an additional 'columns' property containing an array of
     all the column names.
     
[
    {col1: value, col2: value, ...}
    ...
]

*/
    if (uri.match(/.csv$/)) {
        return d3.csvParse(await (await fetch(uri)).text());
    } else if (uri.match(/.json$/)) {
        return await (await fetch(uri)).json();
    }
};

export async function loadTableData(uri) {
/*
Loads a CSV table.

IN:  Path of the data file.
OUT: Returns an array of arrays representing the parsed rows.
*/
    return d3.csvParseRows(await (await fetch(uri)).text());
};


// Default attributes for chartFactory
const protoChart = {
    width: window.innerWidth,
    height: window.innerHeight,
    margin: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
    },
};

// Base function to initialize a chart on the html body tag.
export default function chartFactory(selection, opts, proto=protoChart) {
/*
Creates a svg chart element on the page and returns its corresponding chart object.
Attributes that can be accessed by default:
.svg (reference to svg element)
.container (reference to chart container/g element)

IN:  Selection (string) to append the SVG element,
     Chart attributes stored in an object.
OUT: Chart object containing the specified chart attributes.
*/

    const chart = Object.assign({}, proto, opts);
    // Creates a reference to the svg element
    chart.svg = d3.select(selection)
                    .append('svg')
                    .attr('id', chart.id || 'chart')
                    .attr('width', chart.width - chart.margin.right)
                    .attr('height', chart.height - chart.margin.bottom);

    // Creates a reference to the chart itself, enclosed in a g element.
    chart.container = chart.svg.append('g')
        .attr('id', 'container')
        .attr('transform', `translate(${chart.margin.left}, ${chart.margin.top})`);

    return chart;
}


// Tooltip factory
export function tooltip(text, chart) {
/*
A factory function that returns a new function taking a selection argument.
We then attach a bunch of mouse event handlers to the selection.

TO USE:
// Attaches the mouse events to each element in the selection.
selection.call(tooltip(d => d.accessor, containerReference))

IN:  Receives an accessor function and a target container.
*/
    return (selection) => {
        function mouseover(d) {
            const path = d3.select(this);
            path.classed('highlighted', true);

            const mouse = d3.mouse(chart.node());
            const tool = chart.append('g')
                              .attr('id', 'tooltip')
                              .attr('transform',
                                    `translate(${mouse[0] + 5},${mouse[1] + 10})`);

            const textNode = tool.append('text')
                                 .text(text(d))
                                 .attr('fill', 'black')
                                 .node();

            tool.append('rect')
                .attr('height', textNode.getBBox().height)
                .attr('width', textNode.getBBox().width)
                .style('fill', 'rgba(255, 255, 255, 0.6)')
                .attr('transform', 'translate(0, -16)');

            tool.select('text')
                .remove();

            tool.append('text').text(text(d));
        }

        function mousemove() {
            const mouse = d3.mouse(chart.node());
            d3.select('#tooltip')
              .attr('transform',
            `translate(${mouse[0] + 15},${mouse[1] + 20})`);
        }

        function mouseout() {
            const path = d3.select(this);
            path.classed('highlighted', false);
            d3.select('#tooltip').remove();
        }

        selection.on('mouseover.tooltip', mouseover)
                 .on('mousemove.tooltip', mousemove)
                 .on('mouseout.tooltip', mouseout);
    };
}



// export const colorScale = d3.scaleOrdinal()
//                             .range(d3.schemeCategory20);

// Comparator that will sort by descending
export const valueComparator = (a, b) => b.value - a.value;
