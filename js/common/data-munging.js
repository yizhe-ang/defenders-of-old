/*jshint esversion: 6 */
/*
Contains data manipulation functions
that is to be used to assign different data to the charts

*/

export function filterID(data, ids) {
    /*
    Filters the main dataset based off specified Player IDs in the object.

    IN:  Object of Player IDs.
    OUT: Tournament entries of the specified Player IDs only.
    */
    const keys = d3.keys(ids);
    const filteredData = data.filter(d => keys.includes(d['Player ID']));
    return filteredData;
}
