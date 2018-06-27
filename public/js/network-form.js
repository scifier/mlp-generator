/* global document, postAjax, d3 */

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

(function main() {
  const plusBtn = document.getElementById('plus-btn');
  plusBtn.addEventListener('click', addLayer);
  const minusBtn = document.getElementById('minus-btn');
  minusBtn.addEventListener('click', deleteLayer);
  getByIdAndValidate('inputLayer', /([^0-9]*)/g, 2, {
    event: (input) => { if (input.value === '0') input.value = ''; },
    sync: computeLayers,
  });
  getByIdAndValidate('outputLayer', /([^0-9]*)/g, 2, {
    event: (input) => { if (input.value === '0') input.value = ''; },
    sync: computeLayers,
  });
  getByIdAndValidate('iterations', /([^0-9]*)/g, 5, {
    pre: input => addArrowControllers(input, 1, 100, 99999),
    post: input => setZeroTo(input, ''),
  });
  getByIdAndValidate('errorThresh', /[^.\d]+/g, 5, {
    pre: input => addArrowControllers(input, 0.001, 0.001, 0.999),
    event: input => deleteRestriction(input, '0.'),
    post: input => setZeroTo(input, ''),
  });
  getByIdAndValidate('learningRate', /[^.\d]+/g, 5, {
    pre: input => addArrowControllers(input, 0.001, 0.001, 0.999),
    event: input => deleteRestriction(input, '0.'),
    post: input => setZeroTo(input, ''),
  });
  getByIdAndValidate('momentum', /[^.\d]+/g, 5, {
    pre: input => addArrowControllers(input, 0.001, 0.001, 0.999),
    event: input => deleteRestriction(input, '0.'),
    post: input => setZeroTo(input, ''),
  });
  const datasetSelect = document.getElementById('dataset');
  const inputLayer = document.getElementById('inputLayer');
  const outputLayer = document.getElementById('outputLayer');
  function disableLayers() {
    if (datasetSelect.value !== 'default') {
      inputLayer.value = 58;
      inputLayer.disabled = true;
      outputLayer.value = 1;
      outputLayer.disabled = true;
      computeLayers();
    } else {
      inputLayer.disabled = false;
      outputLayer.disabled = false;
    }
  }
  disableLayers();
  datasetSelect.addEventListener('change', disableLayers, false);

  const postBtn = document.getElementById('post-btn');
  const textarea = document.getElementById('post-modal-textarea');
  const title = document.getElementById('post-modal-title');
  postBtn.addEventListener('click', () => {
    if (datasetSelect.value === 'default') {
      title.innerText = 'Error occured';
      textarea.value = 'Please, choose a dataset';
    } else {
      const description = document.getElementById('description').value;
      const activation = document.getElementById('activation').value;
      const iterations = document.getElementById('iterations').value;
      const errorThresh = document.getElementById('errorThresh').value;
      const learningRate = document.getElementById('learningRate').value;
      const momentum = document.getElementById('momentum').value;
      const layerInputs = document.getElementsByClassName('layer');
      const hiddenLayers = [];
      if (layerInputs.length > 2) {
        for (let i = 1; i < layerInputs.length - 1; i++) {
          if (layerInputs[i].value) hiddenLayers.push(Number(layerInputs[i].value));
        }
      }
      const msg = {};
      if (description) msg.description = description;
      if (activation) msg.activation = activation;
      if (hiddenLayers) msg.hiddenLayers = hiddenLayers;
      if (iterations) msg.iterations = iterations;
      if (errorThresh) msg.errorThresh = errorThresh;
      if (learningRate) msg.learningRate = learningRate;
      if (momentum) msg.momentum = momentum;
      postAjax('/api/network', msg, (json) => {
        title.innerText = `Network ${JSON.parse(json).id} successful created!`;
        textarea.value = json;
      });
    }
  });
  computeLayers();
}());

function deleteLayer() {
  const parent = document.getElementById('hiddenLayerArray');
  const lastLayer = parent.lastChild;
  if (lastLayer) parent.removeChild(lastLayer);
  computeLayers();
}
function addLayer() {
  const parent = document.getElementById('hiddenLayerArray');
  const lastId = parent.lastChild ? Number(parent.lastChild.id.split('-')[1]) : -1;
  if (lastId < 5) {
    const newLayer = document.createElement('input');
    newLayer.className = 'layer form-control';
    newLayer.type = 'text';
    newLayer.value = '1';
    newLayer.size = '6';
    newLayer.autofocus = 'true';
    newLayer.required = 'true';
    newLayer.id = `hiddenLayer-${lastId + 1}`;
    newLayer.name = newLayer.id;
    newLayer.placeholder = 'neurons';
    document.getElementById('hiddenLayerArray').appendChild(newLayer);
    computeLayers();
    getByIdAndValidate(newLayer.id, /([^0-9]*)/g, 2, {
      event: (input) => { if (input.value === '0') input.value = ''; },
      sync: computeLayers,
    });
  }
}
function getByIdAndValidate(id, pattern, max, callback) {
  const input = document.getElementById(id);
  if (callback && callback.pre) callback.pre(input);
  input.addEventListener('input', () => {
    if (callback && callback.event) callback.event(input);
    input.value = input.value.replace(pattern, '')
      .replace(/^([^\.]*\.)|\./g, '$1').substr(0, max);
    document.getElementById(id).value = input.value;
    if (callback && callback.sync) callback.sync();
  }, false);
  if (callback && callback.post) callback.post(input);
}
function deleteRestriction(input, restrictedStr) {
  if (input.value.indexOf(restrictedStr)) input.value = restrictedStr;
}
function addArrowControllers(input, step, min, max) {
  input.addEventListener('keypress', (e) => {
    const val = parseFloat(input.value);
    if (e.key === 'ArrowUp') {
      if (val < max) {
        input.value = (step < 1)
          ? (val + step).toFixed(3)
          : (Number(input.value) + step);
      } else if (Number.isNaN(val)) input.value = step;
    } else if ((e.key === 'ArrowDown') && (val > min)) {
      input.value = (step < 1)
        ? (val - step).toFixed(3)
        : (Number(input.value) - step);
    }
  }, false);
}
function setZeroTo(input, val) {
  input.addEventListener('change', () => {
    if ((parseFloat(input.value) === 0) ||
      Number.isNaN(parseFloat(input.value))) input.value = val;
  }, false);
}
function computeLayers() {
  const layerInputs = document.getElementsByClassName('layer');
  const layers = [];
  const nodes = [];
  const links = [];
  for (let i = 0; i < layerInputs.length; i++) {
    if (layerInputs[i].value) layers.push(Number(layerInputs[i].value));
  }
  for (let i = 0; i < layers.length; i++) {
    for (let j = 0, layer = layers[i]; j < layer; j++) {
      nodes.push({ id: `${i}.${j}` });
    }
  }
  for (let i = 0; i < layerInputs.length; i++) {
    for (let j = 0, layer = layers[i]; j < layer; j++) {
      for (let k = 0, layer2 = layers[i + 1]; k < layer2; k++) {
        links.push({ source: `${i}.${j}`, target: `${i + 1}.${k}` });
      }
    }
  }
  return networkGraphImitation({ nodes, links, sizes: layers });
}

function networkGraphImitation(json) {
  const svgContainer = document.getElementById('svg-container');
  const optionsContainer = document.getElementById('svg-container');
  const width = svgContainer.clientWidth - 30; // - padding
  const height = optionsContainer.clientHeight;
  // const svg = document.getElementById('graph-container');
  // Reading svg attributes
  const graph = d3.select('#graph-container');
  // const width = +graph.attr('width');
  // const height = +graph.attr('height');
  // Frequently used values
  const minSide = ((width < height) ? width : height);
  const radius = minSide / 100;
  const borderRight = width - radius;
  const borderBottom = height - radius;
  const background = graph.append('rect').attrs({
    x: 0, y: 0, width, height, fill: 'rgb(100, 100, 100)', // 'rgb(127, 127, 127)', // nodeColors[7],
  });
  // Toggles for highlighting event
  let highlight = false;
  let highlightedNodeId = null;
  // Main graph objects
  const simulation = d3.forceSimulation();
  simulation
    .force('link', d3.forceLink().id(d => d.id).distance(minSide * 0.5) // .distance(200)
      .strength(minSide * 0.00015)) // .strength(0.075))
    .force('charge', d3.forceManyBody()
      .strength(minSide * -0.5)) // .strength(-250))
    .force('x', d3.forceX((d) => {
      if (json.sizes.length === 1) return width / 2;
      return (getLayer(d) * width) / (json.sizes.length - 1);
    }).strength(minSide * 0.001)) // .strength(0.6))
    .force('y', d3.forceY((d) => {
      if (json.sizes[getLayer(d)] === 1) return height / 2;
      return (getNeuron(d) * height) / (json.sizes[getLayer(d)] - 1);
    }).strength(minSide * 0.001)); // }).strength(0.6));
  const links = graph.append('g').attr('class', 'links').selectAll('line')
    .data(json.links)
    .enter()
    .append('line')
    .attrs({
      stroke: d => linkColorsOpacity03[getLayer(d.source)],
      'stroke-width': 1,
    });
  const nodes = graph.append('g').attr('class', 'nodes')
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
  nodes.append('textarea').text(d => d.id);
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
} // function networkGraph(str) {

/**
* Helper function for limiting a value event minimal and maximal thresholds
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
}
/**
* Helper function for providing the number of current layer
* @param {} d d3 datum (node, node.id, link.source or link.target)
* @return {String} the layer number
*/
function getLayer(d) {
  return d.id ? d.id.split('.')[0] : d.split('.')[0];
}
/**
* Helper function for providing the number of current neuron
* @param {} d d3 datum (node, node.id, link.source or link.target)
* @return {String} the neuron number
*/
function getNeuron(d) {
  return d.id ? d.id.split('.')[1] : d.split('.')[1];
}
