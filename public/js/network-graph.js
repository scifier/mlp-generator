/* global d3, document */

function networkGraph(url) {
  // Reading svg attributes
  const container = document.getElementById('container');
  const width = container.clientWidth - 30; // - padding
  const height = container.clientHeight - 30;
  const graph = d3.select('#graph-container');
  // const width = +graph.attr('width');
  // const height = +graph.attr('height');
  // Frequently used values
  const minSide = ((width < height) ? width : height);
  const radius = minSide / 100;
  const borderRight = width - radius;
  const borderBottom = height - radius;
  // Colors from d3.schemeCategory20 with applied opacity
  const nodeColors = ['rgb(31, 119, 180)', 'rgb(255, 127, 14)', 'rgb(44, 160, 44)',
    'rgb(214, 39, 40)', 'rgb(148, 103, 189)', 'rgb(140, 86, 75)', 'rgb(227, 119, 194)',
    'rgb(127, 127, 127)', 'rgb(188, 189, 34)', 'rgb(23, 190, 207)'];
  const nodeColorsOpacity01 = ['rgba(31, 119, 180, 0.1)', 'rgba(255, 127, 14, 0.1)',
    'rgba(44, 160, 44, 0.1)', 'rgba(214, 39, 40, 0.1)', 'rgba(148, 103, 189, 0.1)',
    'rgba(140, 86, 75, 0.1)', 'rgba(227, 119, 194, 0.1)', 'rgba(127, 127, 127, 0.1)',
    'rgba(188, 189, 34, 0.1)', 'rgba(23, 190, 207, 0.1)'];
  const linkColors = ['rgb(174, 199, 232)', 'rgb(255, 187, 120)', 'rgb(152, 223, 138)',
    'rgb(255, 152, 150)', 'rgb(197, 176, 213)', 'rgb(196, 156, 148)',
    'rgb(247, 182, 210)', 'rgb(199, 199, 199)', 'rgb(219, 219, 141)',
    'rgb(158, 218, 229)'];
  const linkColorsOpacity01 = ['rgba(174, 199, 232, 0.1)', 'rgba(255, 187, 120, 0.1)',
    'rgba(152, 223, 138, 0.1)', 'rgba(255, 152, 150, 0.1)', 'rgba(197, 176, 213, 0.1)',
    'rgba(196, 156, 148, 0.1)', 'rgba(247, 182, 210, 0.1)', 'rgba(199, 199, 199, 0.1)',
    'rgba(219, 219, 141, 0.1)', 'rgba(158, 218, 229, 0.1)'];
  const linkColorsOpacity03 = ['rgba(174, 199, 232, 0.3)', 'rgba(255, 187, 120, 0.3)',
    'rgba(152, 223, 138, 0.3)', 'rgba(255, 152, 150, 0.3)', 'rgba(197, 176, 213, 0.3)',
    'rgba(196, 156, 148, 0.3)', 'rgba(247, 182, 210, 0.3)', 'rgba(199, 199, 199, 0.3)',
    'rgba(219, 219, 141, 0.3)', 'rgba(158, 218, 229, 0.3)'];
  // NOTE: DO NOT MODIFY ! applying opacity like in css "opacity": 0.3 works very slow
  const background = graph.append('rect').attrs({
    x: 0, y: 0, width, height, fill: 'rgb(100, 100, 100)', // 'rgb(127, 127, 127)', // nodeColors[7],
  });
  // Toggles for highlighting event
  let highlight = false;
  let highlightedNodeId = null;
  // Main graph objects
  const simulation = d3.forceSimulation();
  let links;
  let nodes;

  d3.json(url, (error, json) => {
    if (error) {
      throw error;
    } if (json.message) {
      throw new Error(`${json.name}: ${json.message}`);
    } else {
      // graph objects
      simulation
        .force('link', d3.forceLink().id(d => d.id).distance(minSide * 0.5) // .distance(200)
          .strength(minSide * 0.00015)) // .strength(0.075))
        .force('charge', d3.forceManyBody()
          .strength(minSide * -0.5)) // .strength(-250))
        .force('x', d3.forceX(d => (getLayer(d) * width) / (json.sizes.length - 1))
          .strength(minSide * 0.001)) // .strength(0.6))
        .force('y', d3.forceY((d) => {
          if (json.sizes[getLayer(d)] === 1) return height / 2;
          return (getNeuron(d) * height) / (json.sizes[getLayer(d)] - 1);
        }).strength(minSide * 0.001)); // }).strength(0.6));
      links = graph.append('g').attr('class', 'links').selectAll('line')
        .data(json.links)
        .enter()
        .append('line')
        .attrs({
          // id: d => d.id,
          stroke: d => linkColorsOpacity03[getLayer(d.source)],
          'stroke-width': d => Math.sqrt(1 + (d.weight * 7)),
        });
      nodes = graph.append('g').attr('class', 'nodes')
        .selectAll('circle').data(json.nodes)
        .enter()
        .append('circle')
        .attrs({
          // id: d => d.id,
          r: radius - 0.75,
          fill: d => nodeColors[getLayer(d)],
          stroke: 'rgb(255, 255, 255)',
          'stroke-width': `${radius * 0.3}px`, // 1.5px;
        });
      nodes.append('title').text(d => d.id);
      simulation.nodes(json.nodes);
      simulation.force('link').links(json.links);

      // events
      simulation.on('tick', updatePositions);
      background.on('dblclick', highlightOff);
      nodes.call(d3.drag()
        .on('start', dragNode)
        .on('drag', moveNode)
        .on('end', fixNode))
        .on('dblclick', dblclickBehavior);
    } // } else { (if no errors)
  }); // d3.json(str, (error, json) => {

  function updatePositions() {
    links.attrs({
      x1: d => threshold(d.source.x, borderRight, radius),
      y1: d => threshold(d.source.y, borderBottom, radius),
      x2: d => threshold(d.target.x, borderRight, radius),
      y2: d => threshold(d.target.y, borderBottom, radius),
    });
    nodes.attrs({
      cx: d => threshold(d.x, borderRight, radius),
      cy: d => threshold(d.y, borderBottom, radius),
    });
  } // function updatePositions() {
  function dragNode(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = d.x;
    d3.event.subject.fy = d.y;
  } // function dragNode(d) {
  function moveNode() {
    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
    d3.select(this).classed('fixed', true);
  } // function moveNode() {
  function fixNode() {
    if (!d3.event.active) simulation.alphaTarget(0);
    // d3.select(this).classed('fixed', true);
    // ? WRONG BEHAVIOR IF I SET CLASS IN fixNode => i'll set it in moveNode
  } // function fixNode() {
  function dblclickBehavior(d) {
    const node = d3.select(this);
    if (highlight) {
      if (node.classed('fixed highlighted') && (d.id === highlightedNodeId)) {
        releaseNode(d, node); // ? 1
        return highlightOff();
      } if (node.classed('fixed highlighted') && (d.id !== highlightedNodeId)) {
        return highlightLinked(d); // ? 2 //Лаура говорит releaseNode
      } if (node.classed('fixed')) return highlightLinked(d); // ? 4
      if (node.classed('highlighted') && (d.id !== highlightedNodeId)) {
        return highlightLinked(d); // ? 5
      } if (node.classed('highlighted') && (d.id === highlightedNodeId)) {
        return highlightOff(); // ? 6
      } return highlightLinked(d); // ? 8
    } // if (highlight) {
    if (node.classed('fixed')) return releaseNode(d, node); // ? 11 Лаура говорит highlightLinked
    return highlightLinked(d); // ? 16
  } // function dblclickBehavior(d) {
  function releaseNode(d, node) { // I want to rewrite this function (no-param-reassign)
    d.fx = null;
    d.fy = null;
    node.classed('fixed', false);
  } // function releaseNode(d, node)
  function highlightOff() {
    d3.selectAll('circle').classed('highlighted', false).attrs({
      fill: node => nodeColors[getLayer(node)],
      stroke: 'rgb(255, 255, 255)',
    });
    d3.selectAll('line').attr('stroke', link => linkColorsOpacity03[getLayer(link.source)]);
    highlight = false;
    highlightedNodeId = null;
  } // function highlightOff() {
  function highlightLinked(d) {
    d3.selectAll('line').attr('stroke', (link) => {
      if ((link.source.id !== d.id) && (link.target.id !== d.id) &&
          ((getLayer(link.source) === getLayer(d)) ||
           (getLayer(link.target) === getLayer(d)))) {
        return linkColorsOpacity01[getLayer(link.source)];
      } return linkColors[getLayer(link.source)];
    });
    d3.selectAll('circle').classed('highlighted', node =>
      (node.id === d.id) || (getLayer(node) !== getLayer(d))).attrs({
      fill: (node) => {
        if ((node.id !== d.id) && (getLayer(node) === getLayer(d))) {
          return nodeColorsOpacity01[getLayer(node)];
        } return nodeColors[getLayer(node)];
      },
      stroke: (node) => {
        if ((node.id !== d.id) && (getLayer(node) === getLayer(d))) {
          return 'rgba(255, 255, 255, 0.1)';
        } return 'rgb(255, 255, 255)';
      },
    });
    highlight = true;
    highlightedNodeId = d.id;
  } // function highlightLinked(d) {
  // const div = d3.select(this).append('div')
  // .attr('class', 'tooltip')
  // .style('opacity', 0.9)
  // .attrs({
  //   'text-align': 'center',
  //   padding: '2px',
  //   font: '12px sans-serif',
  //   background: '#8fb3de',
  //   border: '0px',
  //   'border-radius': '8px',
  // 'pointer-events': 'none',
  // })
  // .style('left', (d.y + 120) + 'px')
  // .style('top', (d.x - 20) + 'px')
  // .style('left', `${threshold(node.x + 15, width - 150, 0)}px`)
  // .style('top', `${threshold(node.y - 30, height - 50, 0)}px`)
  // .html(() => (node.bias ? `ID: ${node.id} <br/>Bias: ${node.bias}` : `ID: ${node.id}`));;
  // d3.selectAll('circle').classed('highlighted', node =>
  // (!((node.id !== d.id) && (getLayer(node) === getLayer(d)))));
} // function networkGraph(str) {

/**
 * Helper function for limiting a value between minimal and maximal thresholds
 * @param {Number} val value to limit
 * @param {Number} max maximal threshold
 * (if is null the function works like Math.max(val,min))
 * @param {Number} min minimal threshold
 * (if no max the function works like Math.min(val,max))
 * @return {Number} min if val<min, max if val>max, else val
 */
function threshold(val, max, min) {
  if (val > max) return max;
  if (val < min) return min;
  return val;
  // return Math.max(min, Math.min(val, max));
}
/**
 * Helper function for providing the number of current layer
 * @param {Array} d d3 datum (node or link) or node id
 * @return {Number} the layer number
 */
function getLayer(d) {
  if (d.id) return d.id.split('.')[0]; // is a node
  return d.split('.')[0]; // is a link
}
/**
 * Helper function for providing the number of current neuron
 * @param {Array} d d3 datum (node or link) or node id
 * @return {Number} the neuron number
 */
function getNeuron(d) {
  if (d.id) return d.id.split('.')[1]; // is a node
  return d.split('.')[1]; // is a link
}
