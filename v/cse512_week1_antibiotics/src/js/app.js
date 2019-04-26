import React, { Component } from 'react';
import ReactDOM from "react-dom";
import { render } from 'react-dom';
import '../css/style.css';
import araleImage from '../assets/arale-drio.jpg';
import cornImage from '../assets/corn-fields.jpg';
import _ from 'lodash';
import * as d3 from 'd3';
import {csv} from 'd3-fetch';

window.d3 = d3;

const badHeader   = [ "Bacteria ", "Gram Staining ", "Neomycin", "Penicilin", "Streptomycin "];
const tableHeader = [ "Bacteria", "Penicilin", "Streptomycin", "Neomycin", "Gram Staining"];
const url         = 'assets/data.csv';

const buildTable = (data) => {
  const table = d3.select('#table').append('table');
  table
    .append('thead')
    .selectAll('th')
    .data(tableHeader)
      .enter()
      .append('th')
      .text((d) => d);

    table
      .append('tbody')
      .selectAll('tr')
      .data(data)
      .enter()
      .append('tr')
        .selectAll('td')
        .data((row) => _.values(row))
          .enter()
          .append('td')
          .text((d) => d);
}

const renderViz = (entry) => {
  const margin = {top: 10, right: 20, bottom: 50, left: 20};
  const width  = 400 - margin.left - margin.right,
        height = 120 - margin.top - margin.bottom;

  const {Penicilin, Streptomycin, Neomycin} = entry;

  const colors = {
    'Penicilin': d3.schemeCategory10[0],
    'Streptomycin': d3.schemeCategory10[1],
    'Neomycin': d3.schemeCategory10[2],
  };

  const antiColors  = ['coral', 'deeppink', 'gold'],
        antiAmounts = [Penicilin, Streptomycin, Neomycin],
        antiNames   = ['Peniniclin', 'Streptomycin', 'Neomycin'],
        antiTextX   = [0, 200, 440];

  const buildAnti = (name, amount, stain) => {
    return { name, amount, stain };
  }

  const anti = _.sortBy([
    buildAnti('Penicilin', Penicilin, entry['GramStaining']),
    buildAnti('Streptomycin', Streptomycin, entry['GramStaining']),
    buildAnti('Neomycin', Neomycin, entry['GramStaining']),
  ], (a) => a.amount);

  const min = d3.min(antiAmounts),
        max = d3.max(antiAmounts);

  const stain = {
    'positive': {color: 'black', symbol: '(+)'},
    'negative': {color: 'black', symbol: '(-)'},
  }

  const logScale = d3.scaleLog()
    .domain([min, max])
    .range([0, width]);

  const logAxis = d3.axisBottom(logScale).ticks(5, "1.1s");

  const svg = d3.select("#attempt1").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("class", "viz-entry")
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(logAxis);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
  .selectAll("circle")
    .data(anti)
    .enter()
    .append("circle")
      .attr("cx", (d) => logScale(d.amount))
      .attr("cy", (d) => 0)
      .attr("r", (d) => 6)
      .style("fill", (d) => colors[d.name]);

  svg.append("g")
    .attr("transform", `translate(30,5)`)
    .selectAll("text")
    .data([entry])
    .enter()
      .append("text")
      .text(d => `${d["Bacteria"]}`)
      .attr('font-size', '20px')

  const g_text = svg.append("g")
    .attr("transform", `translate(0, 5)`);

  g_text
    .selectAll("text")
    .data(anti)
    .enter()
      .append("text")
      .text(d => stain[d.stain].symbol)
      .attr('stroke', (d) => stain[d.stain].color)
      .attr('fill', (d) => stain[d.stain].color)
      .attr('font-size', '20px');

  const g_text_labels = svg.append("g")
    .attr("transform", `translate(30, 20)`);

  g_text_labels
    .selectAll("circle")
    .data(anti)
    .enter()
      .append("circle")
      .attr("cx", (d, i) => 110 * i)
      .attr("cy", (d) => -2)
      .attr("r", (d) => 6)
      .style("fill", (d) => colors[d.name])
      .style("stroke", (d) => colors[d.name]);

  g_text_labels
    .selectAll("text")
    .data(anti)
    .enter()
      .append("text")
      .text(d => d.name)
      .attr('x', (d, i) => (110 * i) + 7)
      .attr('y', (d) => 2)
      .attr('stroke', (d) => colors[d.name])
      .attr('fill', (d) => colors[d.name])
      .attr('font-size', '12px');

  const g_axis_label = svg.append("g")
    .attr("transform", `translate(${(width/2)-100},${height+30})`)
      .append("text")
      .text("MIC")
      .attr('x', 100)
      .attr('y', 0)
      .attr('stroke', (d) => "black")
      .attr('fill', (d) => "black")
      .attr('font-size', '12px');

}

const doWork = (data) => {
  //buildTable(data);
  _.each(data, d => {
    console.log(d.Bacteria);
    renderViz(d);
  });
}

const loadData = () => {
  return csv(url).then((data) => {
    return _.map(data, (row) => {
      const newObj = {};
      _.each(_.keys(row), (key) => {
        const stringVal = key == badHeader[0] || key == badHeader[1];
        newObj[key.replace(/\s+/g,'')] = stringVal ? row[key] : +row[key];
      })
      return newObj;
    });
  });
};

window.onload = () => {
  loadData().then((data) => doWork(data));
};
